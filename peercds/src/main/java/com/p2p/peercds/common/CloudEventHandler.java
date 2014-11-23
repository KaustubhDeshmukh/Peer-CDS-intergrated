package com.p2p.peercds.common;

import static com.p2p.peercds.common.Constants.*;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.BitSet;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.locks.Lock;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.eventbus.AsyncEventBus;
import com.google.common.eventbus.Subscribe;
import com.p2p.peercds.client.Piece;
import com.p2p.peercds.client.SharedTorrent;
import com.p2p.peercds.client.peer.PeerActivityListener;
import com.p2p.peercds.client.peer.SharingPeer;

public class CloudEventHandler {

	private static final Logger logger = LoggerFactory
			.getLogger(CloudEventHandler.class);

	private Lock lock;

	private AsyncEventBus eventBus;

	private Set<PeerActivityListener> peerActivityListners;

	public CloudEventHandler() {
		logger.info("Empty constructor called");
	}

	public CloudEventHandler(Lock lock, AsyncEventBus eventBus) {
		super();
		this.lock = lock;
		this.eventBus = eventBus;
		eventBus.register(this);
		this.peerActivityListners = new HashSet<PeerActivityListener>();
	}

	@Subscribe
	public void fetchMissingPiecesFromCloud(CloudFetchEvent event) {
		logger.info("Handling cloud piece fetch event");
		lock.lock();
		ConcurrentMap<String, SharingPeer> connected = event.getConnected();
		SharedTorrent torrent = event.getTorrent();
		BitSet requestedPieces = torrent.getRequestedPieces();
		BitSet availablePieces = null;
		List<Integer> selectedPieceIndexList = new ArrayList<Integer>();

		synchronized (requestedPieces) {
			if(connected.size()==0){
				logger.info("There are no peers connected for the download of this torrent.Getting the piece availability from the pieces completed till now ");
				availablePieces = torrent.getCompletedPieces();
			}else{
				logger.info(connected.size()+" peers are connected for this download. Calculating piece availability based upon the piece availability stats from each peer");
				availablePieces = new BitSet(torrent.getPieceCount());
				for(SharingPeer peer : connected.values()){
					availablePieces.or(peer.getAvailablePieces());
				}			
			}
			synchronized (availablePieces) {
				
				if (availablePieces.cardinality() == torrent.getPieceCount()) {
					logger.info("All the pieces are available, torrent download is complete. No action required.");
					return;
				}

				int unavailablePieceCount = torrent.getPieceCount()
						- availablePieces.cardinality();
				logger.info(unavailablePieceCount
						+ " pieces are unavailable. 10% of unavailble pieces are fetched for every cluod fetch event.");

				int numPiecesToBeFetched = (int) Math
						.floor(unavailablePieceCount * CLOUD_PIECE_FETCH_RATIO);

				if (numPiecesToBeFetched == 0)
					numPiecesToBeFetched++;

				logger.info(numPiecesToBeFetched
						+ " pieces will be fetched out of "
						+ unavailablePieceCount
						+ " unavailable piece in this cloud fetch event");
				int numPiecesSelected = 0;

				for (int i = availablePieces.nextClearBit(0); i >= 0
						&& numPiecesSelected < numPiecesToBeFetched; i = availablePieces
						.nextClearBit(i + 1)) {
					logger.info("adding piece: "+i+" to the selected piece list");
					selectedPieceIndexList.add(i);
					numPiecesSelected++;
				}
				for (Integer index : selectedPieceIndexList) {
					logger.info("Setting piece " + index
							+ " as requested from cloud");
					torrent.setPieceRequested(index);
				}
			}
		}
		
		for (Integer index : selectedPieceIndexList) {
			Piece piece = torrent.getPiece(index);
			logger.info("Attempting to fetch the piece: "+piece+" from cloud");
			try {
				byte[] data = CloudHelper.downloadPiece(BUCKET_NAME, torrent.getCloudKey(), piece.getOffset(), piece.getOffset()+piece.size(), false);
				piece.record(ByteBuffer.wrap(data), 0);
				boolean valid = piece.validate();
				if(!valid){
					logger.warn("Piece: "+piece+" fetched from cloud is invalid. Marking piece as non-requested");
					requestedPieces.clear(index);
				}else{
					logger.info("Piece: "+piece+" has been successfully downloaded from cloud. Firing piece completed event");
				this.firePieceCompleted(piece);
				}
			} catch (TruncatedPieceReadException e) {
				logger.error("Could not read complete piece "+piece+"from cloud. Marking the piece as non-requested" ,e);
				requestedPieces.clear(index);
			} catch (S3ObjectNotFoundException e) {
				logger.error("No object found for key: "+String.format(KEY_BUCKET_FORMAT, BUCKET_NAME, torrent.getCloudKey())+"in cloud. Marking the piece as non-requested" ,e);
				requestedPieces.clear(index);
			} catch (FetchSizeExceededException e) {
				logger.error("Fetch size exceeded for key: "+String.format(KEY_BUCKET_FORMAT, BUCKET_NAME, torrent.getCloudKey())+" Requested: "+piece.size()+" max allowed is: "+PIECE_LENGTH+". Marking the piece as non-requested" ,e);
				requestedPieces.clear(index);
			} catch (S3FetchException e) {
				logger.error("Exception while fetching the data for key: "+String.format(KEY_BUCKET_FORMAT, BUCKET_NAME, torrent.getCloudKey())+". Marking the piece as non-requested" ,e);
				requestedPieces.clear(index);
			} catch (IOException e) {
				logger.error("IOException while writing piece "+piece+" to the file. Marking piece as non-requested" , e);
			}
		}
		lock.unlock();
		logger.info("Cloud piece fetch event handling complete");
	}
	
	private void firePieceCompleted(Piece piece){
		for (PeerActivityListener listener : this.peerActivityListners) {
			try {
				listener.handlePieceCompleted(null, piece);
			} catch (IOException e) {
				logger.error("IOException while firing piece completed event", e);
			}
		}
	}

	public void registerPeerActivityListener(PeerActivityListener listener) {
		peerActivityListners.add(listener);
	}
}
