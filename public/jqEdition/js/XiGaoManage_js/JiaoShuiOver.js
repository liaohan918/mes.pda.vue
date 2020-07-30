var userPicker;
$(function(){
	$('#txtBarCode').focus();
	
	$('#txtBarCode').keydown(function(e){
		if(e.keyCode !=13)
		    return;
	    txtBarCode_keyDown();
	});
});

//条码扫描，校验机型是否匹配
function txtBarCode_keyDown(){
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var user_id = currentSession.user_id;
	$.ajax({
			url:app.API_URL_HEADER + "/XiGao/Over",
//	url: "http://localhost:27611/api/XiGao/Over",
	data:{
		JiXing:$('#txtJiXing').val(),
		BarCode:$('#txtBarCode').val(),
		user_id:user_id,
	},
	DataType: "json",
	Type: "post",
	async: false,
	success: function(data) { 
		console.log(JSON.stringify(data));
		if(data.status == 1)
		{
			playerAudio('NG');
			mui.alert(data.message);
			$('#txtBarCode').val('');
			return false;
		}
		else{
			playerAudio('OK');
			$('#info').val(data.data);
			$('#txtBarCode').val('');
			mui.toast(data.message);
		}
	},
	error: function(xhr, type, errorThrow) {
		alert("获取数据异常：" + JSON.stringify(errorThrow));
		return;
	}
});
}
