/*
 * 上料——岳志鹏
 */
var userid;
mui.plusReady(function() {
	app.init();
	currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	userid = currentSession.user_id; 
});

var wo="";
var deviceNo = "";
var devicePosition = "";
var feederPosition = "";
var nextDoorPosition="";


$("#feida1").hide();
$("#feida2").hide();

/**
 * {扫描物料条码事件}
 */
document.getElementById("barCode").addEventListener("keydown",
	function(e) {
		if(e.keyCode != 13)
			return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		var barCode = this.value.trim().toUpperCase();
		if(barCode.trim() == "") {
			//			plus.nativeUI.toast("条码输入不能为空",{verticalAlign:'center'});
			mui.alert("请扫码物料条码");
			return false;
		}
		$.ajax({
			url: app.API_URL_HEADER + "/OrdinaryFeed/GetBarInfo",
			data: {
				barCode: barCode
			},
			dataType: "json",
			type: "post",
			async: false,
			success: function(data) {
				if(data.status == 0) {
					//					plus.nativeUI.toast(data.data,{verticalAlign:'center'});
					mui("#info")[0].value = data.data.info;
					wo=data.data.wo;
					deviceNo = data.data.deviceNo;
                	devicePosition = data.data.devicePosition;
                	feederPosition = data.data.feederPosition;
					$("#barcode").hide();
					$("#feida1").show();
					$("#feidaCode1").focus().val('');
				} else {
					mui.alert(data.message);
					return;
				}
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
		return true;
	});
	
/**
 * {扫描飞达编码1事件(扫描上料的供料器编码)}
 */
document.getElementById("feidaCode1").addEventListener("keydown",
	function(e) {
		if(e.keyCode != 13)
			return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		var code = this.value.trim().toUpperCase();
		if(code.trim() == "") {
			//			plus.nativeUI.toast("条码输入不能为空",{verticalAlign:'center'});
			mui.alert("请扫码飞达编码");
			return false;
		}
		$.ajax({
			url: app.API_URL_HEADER + "/OrdinaryFeed/FeidaCode1KeyDown",
			data: {
				code: code,
				wo: wo,
				userid:userid,
				deviceNo: deviceNo,
				devicePosition: devicePosition,
				feederPosition: feederPosition
			},
			dataType: "json",
			type: "post",
			async: false,
			success: function(data) {
				if(data.status == 0) {
					//					plus.nativeUI.toast(data.data,{verticalAlign:'center'});
					document.getElementById('lblfeida').innerHTML = data.data.lblnextCode;
					nextDoorPosition=data.data.nextDoorPosition;
					$("#feida1").hide();
					$("#feida2").show();
					$("#feidaCode2").focus().val('');
				} else {
					mui.alert(data.message);
					return;
				}
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
		return true;
	});
	

/**
 * {扫描事件(扫描隔壁栈位,确认上料的位置是否正确)}
 */
document.getElementById("feidaCode2").addEventListener("keydown",
	function(e) {
		if(e.keyCode != 13)
			return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		var code = this.value.trim().toUpperCase();
		if(code.trim() == "") {
			//			plus.nativeUI.toast("条码输入不能为空",{verticalAlign:'center'});
			mui.alert("请扫码飞达编码");
			return false;
		}
		$.ajax({
			url: app.API_URL_HEADER + "/OrdinaryFeed/FeidaCode2KeyDown",
			data: {
				code: code,
				nextDoorPosition:nextDoorPosition,
				wo: wo,
				deviceNo: deviceNo,
				devicePosition: devicePosition,
				feederPosition: feederPosition
			},
			dataType: "json",
			type: "post",
			async: false,
			success: function(data) {
				if(data.status == 0) {
					//					plus.nativeUI.toast(data.data,{verticalAlign:'center'});
					mui.alert(data.message);
					
					$("#feida2").hide();
					$("#barcode").show();
					$("#barCode").focus().val('');
				} else {
					mui.alert(data.message);
					return;
				}
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
		return true;
	});