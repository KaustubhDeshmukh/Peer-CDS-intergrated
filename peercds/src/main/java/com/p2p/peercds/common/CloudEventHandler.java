package com.p2p.peercds.common;

import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.locks.Lock;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.common.eventbus.AsyncEventBus;
import com.google.common.eventbus.Subscribe;
import com.p2p.peercds.client.peer.SharingPeer;

public class CloudEventHandler {
	
	private static final Logger logger = LoggerFactory
			.getLogger(CloudEventHandler.class);

	private  Lock lock;
	
	private  AsyncEventBus eventBus;
	
	private  ConcurrentMap<String, SharingPeer> connectedPeersMap;

	public CloudEventHandler(Lock lock, AsyncEventBus eventBus,
			ConcurrentMap<String, SharingPeer> connectedPeersMap) {
		super();
		this.lock = lock;
		this.eventBus = eventBus;
		this.connectedPeersMap = connectedPeersMap;
		eventBus.register(this);
	}
	
	@Subscribe
	public void fetchMissingPiecesFromCloud(CloudFetchEvent event){
		logger.info("Handling cloud piece fetch event");
		lock.lock();
		lock.unlock();
		logger.info("Cloud piece fetch event handling complete");
	}
}
