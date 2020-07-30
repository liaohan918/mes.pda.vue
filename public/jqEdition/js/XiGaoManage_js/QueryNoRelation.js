$(function(){
	InitDate();
});

function InitDate(){
	$.ajax({
		url: app.API_URL_HEADER + '/XiGao/GetNotBuildRelation',
//		url: "http://localhost:27611/api" + '/XiGao/GetNotBuildRelation',
		data: {
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			playerAudio('OK');
			console.log(JSON.stringify(resdata));
			$("#dgWOMDAA").datagrid('loadData', resdata.data);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}
