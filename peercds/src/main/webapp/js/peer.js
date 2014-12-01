	function timer(){
		var status=myobject.status;
		peerApi.getTorrents(status);
	}

	peerApi.getDefaultDirectory();
	
	/*torrent object*/
	
	var myobject={
		status:"all",
		getCurrentTorrentInfo:function(res){
			myobject.currentFile=res;
		},
		currentFile:"",
		selectedFile:"",
		currentTorrentState:''
	};
	console.log('current file is '+myobject.currentFile);
	if(myobject.currentFile==""){}
	$('#torrent-info').hide();
	$('#page-wrapper').click(function(e){
		$('#torrent-info').hide();
		$('#torrent-rows > tr').removeClass('info');
		$('.dropdown-menu').hide();
		myobject.selectedFile="";
		myobject.currentFile="";
		myobject.currentTorrentState="";
		e.stopPropagation();
	});
	
	$('body').click(function(e){
		$('#torrent-info').hide();
		$('#torrent-rows > tr').removeClass('info');
		myobject.selectedFile="";
		myobject.currentFile="";
		myobject.currentTorrentState="";
		e.stopPropagation();
	});
	
	$('document').click(function (e) {
		$('.dropdown-menu').hide();
		myobject.currentFile="";
		myobject.currentTorrentState="";
	});

$(function(){
	timer();
	setInterval(timer, 3000);
	$("#torrent_table").on('click','#torrent-rows > tr',function(e){
		var newcard=jQuery.extend(true, {}, myobject);
		console.log(newcard);
		// Cases to activate and deactivate button controls for each torrent
		
		
		$('#torrent-info').show();
		var files=myobject.currentFile;
		console.log(files);
		
		myobject.selectedFile=$(this).attr('id');
		peerApi.uuid=files[0].uuid;		
		console.log(peerApi.uuid);
		
		$('#torrent-rows > tr').removeClass('info');
		var active_row=$(this).attr('id');
		if(active_row!==""){
			$('#'+active_row).removeClass('info');
		}
		$('#'+active_row).addClass('info');

		var seeds=files[active_row].seeds;
		var peers=files[active_row].peers;
		var uploadSpeed=files[active_row].uploadSpeed;
		var downloadSpeed=files[active_row].downloadSpeed;
		var status;
		if(files[active_row].paused==true){
			status="Paused";
		}
		
		if(files[active_row].error==true){
			status="Error";
		}
		
		if(files[active_row].status=="Downloading"){
			status="Downloading";
		}
		
		console.log(files[active_row]);
		
		$("#home").find("#status").html(status);
		$("#home").find("#peers_count").html(peers);
		$("#home").find("#seeds_count").html(seeds);
		$("#home").find("#upload_speed").html(uploadSpeed);
		$("#home").find("#download_speed").html(downloadSpeed);
		e.stopPropagation();
	});
			
	$('#default-path').click(function(e){
		$('#default-path-modal').modal('show');
		
		$("#resource-submit").click(function(e){
			var path=$("#resource-url").val();
			if(path!==""){
				peerApi.setDefaultDirectory(path);
			}
		});
		e.stopPropagation();
	});
    
    $('li').click(function(){
  		$('#main-menu li').each(function(){
    		if($(this).children().attr('class')=="active-menu"){
    			$(this).children().removeClass("active-menu");
    		}
    	});
    	
    	$(this).children().addClass("active-menu");
    	// console.log($(this).children().addClass('active-menu'));
    });
    
    $('#downloading_files').click(function(){
    	myobject.status='Downloading';
    	setInterval(timer, 3000);
    	timer();
    });
    
    $('#seeding_files').click(function(){
    	myobject.status='Seeding';
    	setInterval(timer, 3000);
    	timer();
    });
    
    $('#all_files').click(function(){
    	myobject.status='all';
    	setInterval(timer, 3000);
    	timer();
    });

	
		$('#create_torrent').change(function(e){
			$in=$(this);
			console.log($in.val());
			$('#tracker_url_modal').modal('show');
			var filename=$in.val().replace(/C:\\fakepath\\/i, '');
			
			if(filename.length>0){
	    		$('#url-submit').click(function(){
	        		var trackerurl=$('#tracker_url').val();
	    	       	 if(trackerurl!==""){
	    	       		 peerApi.createTorrent(filename,trackerurl);
	    	       	 }
	        	});
	    	}
			$in.val("");
			
			e.stopPropagation();
		});
    
	
	
		$('#file_input').change(function(e){
			$('#upload_torrent').modal('hide'); 
			var folder_name=$('#dir-tree').find('li:first-child > a').html();
			alert(folder_name);
			$('#tracker_url_modal').modal('show');
			$('#url-submit').click(function(){
	    		var trackerurl=$('#tracker_url').val();
		       	 if(trackerurl!==""){
		       		 peerApi.createTorrent(folder_name,trackerurl);
		       	 }
	    	});
			$('#dir-tree').empty();
			e.stopPropagation();
		});
	

    $('input[type=file]#download_torrent').change(function(e){
    	$in=$(this);    	
    	var filename=$in.val().replace(/C:\\fakepath\\/i, '');
    	
    	    peerApi.downloadTorrent(filename);
    	
    	$in.val("");
    	e.stopPropagation();    	
    });
    
    $('#Resume').click(function(){
    	console.log(myobject.currentFile);
    	var row=myobject.currentFile;
    	if(row.paused==true){
			$('#Resume > .panel-back').css('background-color','');
	        $('#Resume').css('pointer-events','');
	        
			$('#Pause > .panel-back').css('background-color','#D1D0CE');
	        $('#Pause').css('pointer-events','none');
	        
	        $('#Delete > .panel-back').css('background-color','');
	        $('#Delete').css('pointer-events','');
		}
		
		
		if(row.paused==false && row.status=="Downloading"){
			$('#Resume > .panel-back').css('background-color','#D1D0CE');
	        $('#Resume').css('pointer-events','none');
	        
			$('#Pause > .panel-back').css('background-color','');
	        $('#Pause').css('pointer-events','');
	        
	        $('#Delete > .panel-back').css('background-color','');
	        $('#Delete').css('pointer-events','');
		}
    	
    	
    	
    	if(myobject.currentFile!==""){
    		console.log('file is selected');
    		peerApi.startTorrent(peerApi.uuid);
    	}
    });
    
    
    $('#Pause').click(function(){
    	console.log(myobject.selectedFile);
    	if(myobject.currentFile!==""){
    		console.log('file is selected');
    		peerApi.pauseTorrent(peerApi.uuid);
    	}
    });
    
    $('#Delete').click(function(e){
    	if(myobject.currentFile!==""){
    		if(confirm("Please confirm to delete the file")==true){
        		peerApi.deleteTorrent(peerApi.uuid);
    		}
    	}
    	e.stopPropagation();
    });
        
});
