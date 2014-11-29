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
		currentTorrentState:''
	};
	
	$('#torrent-info').hide();
	$('#page-wrapper').click(function(e){
		$('#torrent-info').hide();
		$('#torrent-rows > tr').removeClass('info');
		myobject.selectedFile="";
		e.stopPropagation();
	});
	
	$('body').click(function(e){
		$('#torrent-info').hide();
		$('#torrent-rows > tr').removeClass('info');
		myobject.selectedFile="";
		e.stopPropagation();
	});

$(function(){
	timer();
	setInterval(timer, 3000);
	$("#torrent_table").on('click','#torrent-rows > tr',function(e){
		console.log(myobject.currentFile[0].uuid);
		var status=myobject.currentFile[0].status;
		
		// Cases to activate and deactivate button controls for each torrent
		
		
		$('#torrent-info').show();
		var files=myobject.currentFile;
		myobject.selectedFile=$(this).attr('id');
		peerApi.uuid=files[0].uuid;		
		
		$('#torrent-rows > tr').removeClass('info');
		var active_row=$(this).attr('id');
		if(active_row!==""){
			$('#'+active_row).removeClass('info');
		}
		$('#'+active_row).addClass('info');

		var seeds=files[active_row].seeds;
		var peers=files[active_row].peers;
		var status=files[active_row].status;
		
		$("#home").find("#status").html(status);
		$("#home").find("#peers_count").html(peers);
		$("#home").find("#seeds_count").html(seeds);
		e.stopPropagation();
	});
			
	$('#default-path').click(function(){
		$('#default-path-modal').modal('show');
		
		$("#resource-submit").click(function(){
			var path=$("#resource-url").val();
			peerApi.setDefaultDirectory(path);		
		});
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
    	myobject.status='downloading';
    	setInterval(timer, 3000);
    	timer();
    });
    
    $('#seeding_files').click(function(){
    	myobject.status='seeding';
    	setInterval(timer, 3000);
    	timer();
    });
    
    $('#all_files').click(function(){
    	myobject.status='all';
    	setInterval(timer, 3000);
    	timer();
    });
    
    
    $('input[type=file]#create_torrent').change(function(e){
    	$in=$(this);    	
    	var filename=$in.val().replace(/C:\\fakepath\\/i, '');
    	peerApi.downloadTorrent(filename);
    });
    
    $('#Resume').click(function(){
    	if(myobject.currentFile!==""){
    		console.log('file is selected');
    		peerApi.startTorrent(peerApi.uuid);
    	}
    });
    
    
    $('#Pause').click(function(){
    	if(myobject.currentFile!==""){
    		console.log('file is selected');
    		peerApi.pauseTorrent(peerApi.uuid);
    	}
    });
    
    $('#Delete').click(function(){
    	if(myobject.currentFile!==""){
    		console.log('file is selected');
    		peerApi.deleteTorrent(peerApi.uuid);
    	}
    });
        
});
