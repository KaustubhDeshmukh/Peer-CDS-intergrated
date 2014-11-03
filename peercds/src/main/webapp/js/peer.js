	peerApi.getTorrents();
//	peerApi.setDefaultDirectory();
	peerApi.getDefaultDirectory();

	
	/*torrent object*/
	
	var myobject={
		getCurrentTorrentInfo:function(res){
			myobject.currentFile=res;
		},
		currentFile:""
	};
	
	$('#torrent-info').hide();
	$('#page-wrapper').click(function(e){
		$('#torrent-info').hide();
		e.stopPropagation();
	});

$(function(){

	$("#torrent_table").on('click','#torrent-rows > tr',function(e){
		$('#torrent-info').show();
		var files=myobject.currentFile;
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
			var data=JSON.stringify({"defaultDirectory":path});
			$.ajax({
				url:"http://192.168.200.20:8080/ttorrent/service/setDefaultDirectory",
				contentType: "application/json; charset=utf-8",
    			dataType: "json",
				type:"POST",
				data:data,
				success:function(res){
					console.log(res);
				},
				error:function(){
					
				}
			});		
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
    
});
