package com.p2p.peercds.common;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.locks.Lock;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.eventbus.AsyncEventBus;
import com.google.common.eventbus.Subscribe;
import com.p2p.peercds.client.peer.PeerActivityListener;
import com.p2p.peercds.client.peer.SharingPeer;

public class CloudEventHandler {
	
	private static final Logger logger = LoggerFactory
			.getLogger(CloudEventHandler.class);

	private  Lock lock;
	
	private  AsyncEventBus eventBus;
	
	private Set<PeerActivityListener> peerActivityListners;
	
	public CloudEventHandler(){
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
	public void fetchMissingPiecesFromCloud(CloudFetchEvent event){
		logger.info("Handling cloud piece fetch event");
		lock.lock();
		ConcurrentMap<String, SharingPeer> connected = event.getConnected();
		logger.info("Number of peers connected for this torrent: "+connected.size());
		lock.unlock();
		logger.info("Cloud piece fetch event handling complete");
	}
	
	public void registerPeerActivityListener(PeerActivityListener listener){
		peerActivityListners.add(listener);
	}
}
