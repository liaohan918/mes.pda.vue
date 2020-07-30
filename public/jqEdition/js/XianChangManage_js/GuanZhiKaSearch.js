$(function(){
	$('#txtGZKHao').focus();
	$('#txtGZKHao').keydown(function(e){
		if(e.keyCode != '13'){
			return ;
		}
		$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/GetShengChanInfo',
//		url: "http://localhost:27611/api" + '/WeiXiu/UnCancelJieShou',
		data: {
//			check : check,
			GuanZhiKaHao : $('#txtGZKHao').val()
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			if(resdata.status == 1){
				playerAudio('NG');
				$('#txtGZKHao').focus().select();
				alert(resdata.message);
			}else{
				playerAudio('OK');
				$('#txtGZKHao').focus().select();
				//mui.toast(resdata.message);
				$('#dgWOMQAC').datagrid('loadData', $.parseJSON(resdata.data));
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
	});
});