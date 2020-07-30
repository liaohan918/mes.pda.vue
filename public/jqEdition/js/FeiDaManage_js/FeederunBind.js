function FeederUnbind() {
	var FeederID = document.getElementById("TexFeederID").value;
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var data = {
		FeederID: FeederID,
		user_id:currentSession.user_id //登陆用户
	};
	/* 这里的飞达解绑，没有限制已绑定设备的飞达不能解绑
	 * 导致物料生产状态为'上线'，无法再进行绑定
	 * 
	 * 看后面决定怎么处理后，再修改吧！
	 * */
	var responseData = AjaxOperation(data, "飞达解绑", true, "/FeederunBind/FeederUnbind");
	if(!responseData.state) {
		playerAudio('NG');
		document.getElementById("info").value = responseData.data.data;
		document.getElementById("TexFeederID").focus();
		document.getElementById("TexFeederID").select();
	} else {
		document.getElementById("info").value = responseData.data.data;
		//mui.alert(responseData.data.message);
		playerAudio('OK');
		mui.toast(responseData.data.message);
		document.getElementById("TexFeederID").focus();
		document.getElementById("TexFeederID").select();
	}
}