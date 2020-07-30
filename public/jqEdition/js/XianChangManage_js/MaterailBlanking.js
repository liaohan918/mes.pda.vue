/*
 * 下料——岳志鹏
 */

var userid;
mui.plusReady(function() {
	app.init();
	currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	userid = currentSession.user_id; 
});


/**
 * {扫描物料条码事件}
 */
document.getElementById("barCode").addEventListener("keydown",
	function(e) {
		if(e.keyCode != 13)
			return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		var barCode = this.value.trim().toUpperCase();
		if(barCode.trim() == "") {
			mui.alert("请扫码物料条码");
			return false;
		}
		$.ajax({
			url: app.API_URL_HEADER + "/MaterailBlanking/GetBarInfo",
			data: {
				barCode: barCode,
				userid:userid
			},
			dataType: "json",
			type: "post",
			async: false,
			success: function(data) {
				if(data.status == 0) {
					mui("#info")[0].value = data.data.info;
				} else {
					mui.alert(data.message);
					return;
				}
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
		$("#barCode").focus().val('');
		return true;
	});