$(function(){

	$.ajax({
		url:"http://192.168.200.20:8080/ttorrent/service/getDefaultDirectory",
		type:"GET",
		success:function(res){
			console.log(res);
		},
		error:function(){
			
		}
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

	$('tr').click(function(){
		var status=$(this).find('td.downloading').html();
		$('.status').html(status);
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
