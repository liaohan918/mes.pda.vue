//add by HCW 20200318
mui.plusReady(function() {
	$('.easyui-datagrid').datagrid({
					height: $(window).height() - $("#form").height() - $('#info_BARDAB').height()-50,
					sortable: false
				});
});

$(function(){
//	mui('#info_BARDAB')[0].innerHTML  = "个数：" + 10 + "&#8195;&#8195;&#8195;&#8195;" + "总数：" + 10000;
	$('#txtDAB018').focus().val('');
	
	$('#txtDAB018').keydown(function(e){
		if(e.keyCode != "13")
			return;
		getData();
	})
});

function getData(){
	$.ajax({
		url: app.API_URL_HEADER + '/MainBarCode/GetData',
		
//		url: "http://localhost:27611/api/MainBarCode/GetData",
		data: {
			DAB018 : $('#txtDAB018').val()
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			if(resdata.status == 1){
				playerAudio('NG');
				$('#txtDAB018').focus().select();
				$('#dgBARDAB').datagrid('loadData', []);
				mui('#info_BARDAB')[0].innerHTML = "";
				alert(resdata.message);
			}else{
				playerAudio('OK');
				$('#txtDAB018').focus().select();
				$('#dgBARDAB').datagrid('loadData', resdata.data);
				mui('#info_BARDAB')[0].innerHTML = resdata.message;
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}
