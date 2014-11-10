var peerApi={
		
	getTorrents:function(status){
		$.ajax({
			url:"http://localhost:8080/peercds/service/gettorrents",
			type:"GET",
			success:function(res){
				myobject.getCurrentTorrentInfo(res);
				$('#torrent-rows').empty();
				for(var i=0;i<res.length;i++){
					if(status==res[i].status || status=="all"){
					console.log(res[i]);
//					if(i==myobject.selectedFile){
//						console.log('selected is'+myobject.selectedFile);
//						$('#'+myobject.selectedFile).addClass('info');
//					}					
					var table='<tr class="file" id='+i+'>';
					table=table+'<td class="fid">'+i+'</td>';
					table=table+'<td class="file_name">'+res[i].fileName+'</td>';
					table=table+'<td class="status">'+res[i].status+'</td>';
					table=table+'<td class="prog">'+ '<progress value='+'"'+res[i].progress+'"'+ 'max="100"></progress>'+'</td>';
					table=table+'<td class="eta">'+res[i].eta+'</td>';
					table=table+'<td class="size">'+res[i].size+'</td>';
					table=table+'</tr>';
					$('#torrent-rows').append(table);
					console.log(myobject.selectedFile);
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
		
		var path={
			"defaultDirectory":"/user/jayadev"
		};
		var a=JSON.stringify(path);
		console.log(a);
		
		console.log(path);
		
		$.ajax({
			url:"http://localhost:8080/peercds/service/defaultdirectory",
			type:"POST",
			contentType: "application/json",
			data:a,
			success:function(res){
				console.log(res);
			},
			error:function(){
				
			}
		});
		
	},
	
	getDefaultDirectory:function(){
		$.ajax({
			url:"http://localhost:8080/peercds/service/defaultdirectory",
			type:"GET",
			contentType: "application/json",
			success:function(res){
				console.log(res);
			},
			error:function(){
				
			}
		});
	},
	
	creatTorrent:function(){
		
	},
	
	getTorrent:function(){
		
	},
	
	startTorrent:function(){
		
	},
	
	pauseTorrent:function(){
		
	},
	
	deleteTorrent:function(){
		
	},
	
	downloadTorrent:function(){
		
	}
};