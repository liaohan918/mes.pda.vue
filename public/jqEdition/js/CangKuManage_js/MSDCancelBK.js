/**
 * 湿敏元件——取消烘烤
 */
var currentSession;
var userid;
$("#barCode").focus();

mui.plusReady(function() {
	app.init();
	currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	userid = currentSession.user_id; 
	document.getElementById('userid').innerHTML = userid;
});

$("#result").hide();

/**
 * {扫描条码事件}
 */
document.getElementById("barCode").addEventListener("keydown",
	function(e) {
		if(e.keyCode != 13)
			return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		var barCode = this.value.trim().toUpperCase();
		if(barCode.trim() == "") {
			mui.alert("请扫码条码");
			return false;
		}
		$.ajax({
			//url: "http://localhost:27611/api/MSDCancelBK/CancelBK",
			url: app.API_URL_HEADER + "/MSDCancelBK/CancelBK",
			data: {
				barCode: barCode,
				userid:userid
			},
			dataType: "json",
			type: "post",
			async: false,
			success: function(data) {
				if(data.status == 0) {
					$("#result").show();
					document.getElementById('res').innerHTML = '处理成功！';
					document.getElementById("res").style.color="green";
				} else {
					$("#result").show();
					document.getElementById('res').innerHTML = '处理失败！';
					document.getElementById("res").style.color="red";
					mui.alert(data.message);
					return;
				}
			},
			error: function(xhr, type, errorThrown) {
				mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
		$("#barCode").focus().val('');
		return true;
	});