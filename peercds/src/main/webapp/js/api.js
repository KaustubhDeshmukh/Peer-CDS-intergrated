var peerApi={
	//url:"http://localhost:8080/peercds/service/gettorrents",
	base_url:"http://192.168.200.22:8080",
	getTorrents:function(status){
		$.ajax({
			url:this.base_url+"/peercds/service/gettorrents",
			type:"GET",
			success:function(res){
				myobject.getCurrentTorrentInfo(res);
				$('#torrent-rows').empty();
				for(var i=0;i<res.length;i++){
					if(status==res[i].status || status=="all"){
					console.log(res[i]);
					var table='<tr class="file" id='+i+'>';
					table=table+'<td class="fid">'+i+'</td>';
					table=table+'<td class="file_name">'+res[i].fileName+'</td>';
					table=table+'<td class="status">'+res[i].status+'</td>';
					table=table+'<td class="prog">'+ '<progress value='+'"'+res[i].progress+'"'+ 'max="100"></progress>'+'</td>';
					table=table+'<td class="eta">'+res[i].eta+'</td>';
					table=table+'<td class="size">'+res[i].size+'</td>';
					table=table+'</tr>';
					$('#torrent-rows').append(table);
					//console.log(myobject.selectedFile);
					if(myobject.selectedFile!=""){
						$('#torrent-rows tr').eq(myobject.selectedFile).addClass('info');
					}
				  }
				}
					
			},
			error:function(){
				
			}
		});
	},
	
	setDefaultDirectory:function(){
		var path=$("#resource-url").val();
		var data=JSON.stringify({"defaultDirectory":path});
		$.ajax({
			url:this.base_url+"/ttorrent/service/setDefaultDirectory",
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			type:"POST",
			data:data,
			success:function(res){
				console.log('success');
			},
			error:function(){
				alert("error");
			}
		});
		
	},
	
	getDefaultDirectory:function(){
		$.ajax({
			url:this.base_url+"/peercds/service/defaultdirectory",
			type:"GET",
			contentType: "application/json",
			success:function(res){
				console.log(res);
				$('#resource-url').html();
			},
			error:function(){
				
			}
		});
	},
	
	creatTorrent:function(){
		// filename : "name of the file"
		$.ajax({
			url:this.base_url+"/peercds/service/createtorrent",
//			type:"GET",
//			contentType: "application/json",
//			success:function(res){
//				console.log(res);
//				$('#resource-url').html();
//			},
//			error:function(){
//				
//			}
		});
	},
	
	startTorrent:function(){
		// uuid :"value"
		$.ajax({
			url:this.base_url+"/peercds/service/defaultdirectory",
			type:"GET",
			contentType: "application/json",
			success:function(res){
				console.log(res);
				$('#resource-url').html();
			},
			error:function(){
				
			}
		});
	},
	
	pauseTorrent:function(){
		// uuid :"value"
//		$.ajax({
//			url:this.base_url+"/peercds/service/pausetorrent",
//			type:"POST",
//			data:{"uuid":}
//			contentType: "application/json",
//			success:function(res){
//				console.log(res);
//				$('#resource-url').html();
//			},
//			error:function(){
//				
//			}
//		});
	},
	
	deleteTorrent:function(){
		// uuid :"value"
		$.ajax({
			url:this.base_url+"/peercds/service/deletetorrent",
//			type:"GET",
//			contentType: "application/json",
//			success:function(res){
//				console.log(res);
//				$('#resource-url').html();
//			},
//			error:function(){
//				
//			}
		});
	},
	
	downloadTorrent:function(){
		// filename : "name of the file"
		$.ajax({
			url:this.base_url+"/peercds/service/downloadtorrent",
			type:"GET",
			contentType: "application/json",
			success:function(res){
				console.log(res);
				$('#resource-url').html();
			},
			error:function(){
				
			}
		});
	}
};