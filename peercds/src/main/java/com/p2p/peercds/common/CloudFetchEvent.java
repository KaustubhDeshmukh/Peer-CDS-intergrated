package com.p2p.peercds.common;

import java.util.concurrent.ConcurrentMap;

import com.p2p.peercds.client.peer.SharingPeer;

public class CloudFetchEvent {
	
	private ConcurrentMap<String, SharingPeer> connected;

	public CloudFetchEvent(ConcurrentMap<String, SharingPeer> connected) {
		super();
		this.connected = connected;
	}

	public ConcurrentMap<String, SharingPeer> getConnected() {
		return connected;
	}
}
