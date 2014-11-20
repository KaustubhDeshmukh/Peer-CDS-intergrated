package com.p2p.peercds.common;

import java.io.File;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.Arrays;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.ObjectListing;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.PutObjectResult;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import com.amazonaws.services.s3.transfer.MultipleFileUpload;
import com.amazonaws.services.s3.transfer.TransferManager;

public class CloudHelper {

	private static final Logger logger = LoggerFactory
			.getLogger(CloudHelper.class);

	private static AmazonS3 s3 = null;
	private static TransferManager manager = null;

	static {

		s3 = new AmazonS3Client(new DefaultAWSCredentialsProviderChain());
		s3.setRegion(Region.getRegion(Regions.US_EAST_1));
		manager = new TransferManager(s3);

	}

	public static void main(String args[]) throws Exception {

		logger.info("===========================================");
		logger.info("Getting Started with Amazon S3");
		logger.info("===========================================\n");

		File file = new File("/Users/kaustubh/Desktop/bike-to-office.pdf");
		uploadTorrent("peer-cds", "R0dcvBQPBEADa6BQAQT", file);
		//downloadPiece("peercds", "mfile/abc.pdf" , 10 , 11);

	}

	public static boolean uploadTorrent(String bucketName, String key,
			File sourceFile) {

		boolean fileExists = false;

		if (!s3.doesBucketExist(bucketName)) {
			logger.info("Creating bucket " + bucketName);
			s3.createBucket(bucketName);
			logger.info("bucket created");
		}

		ObjectListing listObjects = s3.listObjects(bucketName, key);
		List<S3ObjectSummary> objectSummaries = listObjects
				.getObjectSummaries();
		if (objectSummaries.size() != 0)
			fileExists = true;

		if (!fileExists) {

			if (sourceFile.isDirectory()) {
				
				logger.info("Uploading a directory: "+sourceFile.getName()+" to cloud.");
				
				MultipleFileUpload uploadDirectory = manager.uploadDirectory(bucketName, key, sourceFile, true);
				try {
					uploadDirectory.waitForCompletion();
				} catch (Exception e) {
					logger.info("Exception while uploading a directory: "+sourceFile.getName()+" to the cloud");
					e.printStackTrace();
					throw new RuntimeException("Unable to upload directory "+sourceFile.getName()+"to the cloud: Reason: "+e.getMessage());
				} 
				
				logger.info("Directory: "+sourceFile.getName()+" has been uploaded successfully to the cloud.");
				return true;

			} else {
				logger.info("Uploading a single file: "+sourceFile.getName()+" to cloud.");
				PutObjectResult result = s3.putObject(new PutObjectRequest(
						bucketName, key, sourceFile));
				return true;
			}
		} else {

			logger.info("File already exists in the cloud.. skipping upload.");
			return false;
		}
	}

	public static byte[] downloadPiece(String bucketName, String key)
			throws IOException, TruncatedPieceReadException,
			S3ObjectNotFoundException {

		byte[] data = downloadPiece(bucketName, key, null, null);
		return data;
	}
	
	/*
	 * endByteIndex is exclusive
	 * byte index in S3 also starts from 0 
	 * Range set in get request of S3 has both the endpoints inclusive
	 */

	public static byte[] downloadPiece(String bucketName, String key,
			Integer startByteIndex, Integer endByteIndex) throws IOException,
			TruncatedPieceReadException, S3ObjectNotFoundException {

		long length = 0;

		ObjectListing listObjects = s3.listObjects(bucketName, key);
		List<S3ObjectSummary> objectSummaries = listObjects
				.getObjectSummaries();
		if (objectSummaries.size() == 0)
			throw new S3ObjectNotFoundException("No object with key: " + key
					+ " in the bucket: " + bucketName + " can be found");
		else {
			logger.info(objectSummaries.size()
					+ " objects found with the key: " + key + " in bucket "
					+ bucketName);
//			if (objectSummaries.size() > 1)
//				throw new IllegalArgumentException(
//						"More than one file is associated with the given key: "
//								+ key);
			S3ObjectSummary s3ObjectSummary = objectSummaries.get(0);
			length = s3ObjectSummary.getSize();
			if (length > Integer.MAX_VALUE)
				throw new IllegalArgumentException(
						"Max fetch size exceeded. Consider chunking the download in parts. Max allowed size is: "
								+ Integer.MAX_VALUE);
		}

		GetObjectRequest req = new GetObjectRequest(bucketName, key);

		if (startByteIndex != null && endByteIndex != null) {
			length = (endByteIndex - startByteIndex); // This is placed before decrementing the endIndex to accurately calculate the number of bytes to be fetched
			endByteIndex = endByteIndex -1; // This is to make endByteIndex exclusive
			if (startByteIndex > endByteIndex)
				throw new IllegalArgumentException(
						"startByteIndex should be smaller than endByteIndex to fetch the legitimate data bytes");
			else {
				logger.info("Fetching " + length
						+ " bytes data of a piece from S3");
				req.setRange(startByteIndex, endByteIndex);
			}
		} else
			logger.info("Range has not been provided for this download from cloud. Whole "
							+ key
							+ " will be downloaded from bucket: "
							+ bucketName);

		ByteBuffer buffer = ByteBuffer.allocate((int) length);
		byte[] holder = new byte[(int) length];
		S3Object piece = s3.getObject(req);
		logger.info("Downloading a piece of size " + (length / 1024)
				+ "kb from cloud for content type: "
				+ piece.getObjectMetadata().getContentType());

		int rem = 0;
		for (rem = piece.getObjectContent().read(holder); rem != -1; rem = piece
				.getObjectContent().read(holder)) {
			logger.info("fetched: "+rem+" bytes from cloud for key: "+key);
			buffer.put(Arrays.copyOfRange(holder, 0, rem));
		}
		logger.info("Total bytes read from cloud: " + buffer.position()
				+ " for key: " + key);

		if (buffer.position() != length)
			throw new TruncatedPieceReadException(
					"Number of bytes expected to be read: " + length
							+ ". Number of bytes actually read: "
							+ buffer.position());

		return buffer.array();
	}
}
