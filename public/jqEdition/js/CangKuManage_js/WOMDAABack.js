mui.plusReady(function() {
	//add by HCW 20200317
	$("#inforow").height($(window).height() - $("#head1").height() - 10);
	
	app.init(1);
});

var barCode = ""; //当前条码
var billDate = ""; //单据日期
var billNo = ""; //单号
var billType;
if(TL_type == '1')
	billType = "5605"; //转产退料
else if(TL_type == '2')
	billType = "5601"; //良品退料
else
	billType = "5603"; //不良品退料
var isHaveBarcode = false;

var ReadybillNo = ""; //备料单单号
var DAH005 = 0;
var DAH011 = 0;
var DAH020 = "";
var DAH026 = 0;
var DRB023 = ""; //不良项目代码
var KW = "";
var barcodeCount = 0;
var NumArry = new Array();
var userPicker;
/// <summary>
/// 1：转产退料
/// 2：良品退料
/// 3:不良品退料
/// </summary>
$(function() {
	if(TL_type == 3) {
		userPicker = new mui.PopPicker();
		//获取单据类型
		$.ajax({
			url: app.API_URL_HEADER + '/WOMDAABack/GetBackReason',
			data: {},
			dataType: "json",
			type: "post",
			success: function(resdata) {
				console.log(JSON.stringify(resdata));
				dt = $.parseJSON(resdata.data);
				userPicker.setData(dt);
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
		//选择不良项目
		$('#txtBLCode').click(function() {
			userPicker.show(function(items) {
				$('#txtBLCode').val(items[0]['value']);
				$('#txtBLName').val(items[0]['text']);
			});
			$('#txtKuWei').select();
		});
	}
	DataInit(TL_type);
	$("#inforow").height($(window).height() - $("#head1").height() - 10);

	/**
	 * {材料条码文本改变事件 查询子条码和数量}
	 */
	document.getElementById("materialCode").addEventListener("keydown",
		function(e) {
			if(e.keyCode != 13) return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
			barCode = this.value.trim().toUpperCase();
			if(barCode.trim() == "") {
				//			plus.nativeUI.toast("条码输入不能为空",{verticalAlign:'center'});
				alert("条码输入不能为空", {
					verticalAlign: 'center'
				});
				playerAudio("NG");
				document.getElementById("materialCode").focus();
				document.getElementById("materialCode").select();
				return false;
			}
			$.ajax({
				url: app.API_URL_HEADER + '/WOMDAABack/GetBarCodeInfo',
				//			url: 'http://localhost:27611/api//WOMDAABack/GetBarCodeInfo',
				data: {
					barcode: barCode,
					TL_type: TL_type
				},
				dataType: "json",
				type: "post",
				success: function(data) {
					if(data.status == 1) {
						console.log(JSON.stringify(data));
						//					plus.nativeUI.toast(data.message,{verticalAlign:'center'});
						mui("#info")[0].value = data.message;
						document.getElementById("materialCode").focus();
						document.getElementById("materialCode").select();
						playerAudio("NG");
						return;
					} else {
						console.log(JSON.stringify(data));
						//					plus.nativeUI.toast(data.data,{verticalAlign:'center'});
						mui("#info")[0].value = data.data;
						NumArry = data.message.split(";");
						ReadybillNo = NumArry[0]; //备料单单号
						DAH005 = NumArry[1];
						DAH011 = NumArry[2];
						DAH020 = NumArry[3];
						DAH026 = NumArry[4];
						barcodeCount = NumArry[5];
						if(mui("#checkdefault")[0].checked == false)
							$("#txtKuWei").val(NumArry[6]);
						mui("#DAH026")[0].value = DAH026;
						document.getElementById("DAH026").focus();
						document.getElementById("DAH026").select();
						isHaveBarcode = true;
					}
				},
				error: function(xhr, type, errorThrown) {
					alert("获取数据异常：" + JSON.stringify(errorThrown));
					document.getElementById("materialCode").focus();
					document.getElementById("materialCode").select();
					playerAudio("NG");
				}
			});
		});
	/*
	 * 库位回车
	 */
	document.getElementById("txtKuWei").addEventListener("keydown",
		function(e) {
			if(e.keyCode != 13) return;
			if(CheckInputData())
				ResultCommit();
		}
	)
	/*
	 * 数量回车
	 */
	document.getElementById("DAH026").addEventListener("keydown",
		function(e) {
			if(e.keyCode != 13) return;
			if(TL_type == "3") return;
			//如果转产退料和良品退料并且选择了默认库位就直接退料执行			
			if(mui("#checkdefault")[0].checked == true && CheckInputData())
				ResultCommit();
		}
	)

	/**
	 * {确认按钮}
	 */

	document.getElementById("btnCommit").addEventListener("click",
		function(e) {
			if(CheckInputData())
			{
				ResultCommit();
				$("#materialCode").val("");
				$("#materialCode")[0].focus();
			}
		});
});

/*
 * 检查数据正确性
 */
function CheckInputData() {
	if(Isnull(mui("#materialCode")[0].value)) {
		playerAudio("NG");
		mui.alert("请输入条码！")
		mui("#materialCode")[0].focus();
		return false;
	}
	if(!isHaveBarcode) {
		playerAudio("NG");
		mui.alert("条码信息验证错误，请重新扫描条码！");
		$("#materialCode")[0].select().focus();
		return false;
	}
	if(Isnull(mui("#DAH026")[0].value)) {
		playerAudio("NG");
		mui.alert("请输入退料数量！");
		$("#DAH026")[0].select().focus();
		return false;
	}
	if(mui("#DAH026")[0].value <= 0) {
		playerAudio("NG");
		mui.alert("实盘数量不能小余等于0，请重新输入！");
		$("#DAH026")[0].select().focus();
		return false;
	}
	if(DAH026 > DAH011 && !confirm("实盘数量大于备料数,是否保存?")) {
		$("#DAH026")[0].select().focus();
		return false;
	}
	if(barcodeCount != 0) {
		playerAudio("NG");
		mui.alert("当前工单：" + DAH020 + "\n存在" + barcodeCount + "个条码未进行供料器解绑,请先解绑再退料！");
		return false;
	}
	if(TL_type == "3" && Isnull(mui("#txtBLCode")[0].value)) {
		playerAudio("NG");
		mui.alert("请不良项目！")
		mui("#txtBLCode")[0].focus();
		return false;
	}
	if(Isnull(mui("#txtKuWei")[0].value)) {
		playerAudio("NG");
		mui.alert("请扫描库位！")
		$("#txtKuWei").select().focus();
		return false;
	}
	DAH026 = $("#DAH026").val();
	if(TL_type == "3")
		DRB023 = $("#txtBLCode").val();
	KW = $("#txtKuWei").val();
	return true;
}

/**
 * {初始化数据}
 */
function DataInit(tl_type) {
	var dateTime = GetSysDateTime();
	//	var dateStr = dateTime["sys_date"].replace(/-/g, "/") + " " + dateTime["sys_time"];
	billDate = new Date(dateTime.replace(/-/g, "/"));
// 	var hours = billDate.getHours(); //获取当前小时数(0-23) 
// 	if(hours <= 7) {
// 		var t = billDate.getTime() - 1000 * 60 * 60 * 24;
// 		billDate = new Date(t);
// 	}
	TL_type = tl_type;
	billNo = GetMaxBillNO(billType, formatDate(billDate)); //获取单据编号
	mui("#billNo")[0].value = billNo;
	mui("#materialCode")[0].focus(); //进入界面材料条码输入框获得焦点
}

/**
 * 判断是否为空
 * @param {Object} value
 */
function Isnull(value) {
	if(value == "" || value == null || value == undefined) { // "",null,undefined
		return true;
	} else
		return false;
}

/**
 * 结果上传
 */
function ResultCommit() {
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	console.log(JSON.stringify(currentSession));
	var user_id = currentSession.user_id;
	//	var user_id = "zlw";
	if(TL_type == "1") {
		$.ajax({
			url: app.API_URL_HEADER + app.API_METHOD_ESP,
			data: {
				spname: "ReturnMaterialByZCBill", //转产退料
				returnvalue: 1,
				_sp_DRA001: billType,
				_sp_DRA002: billNo,
				_sp_DAF002: ReadybillNo,
				_sp_DAH005: DAH005,
				_sp_DRB010: DAH026,
				_sp_Auditor: user_id,
				_sp_KW: KW
			},
			dataType: "json",
			type: "post",
			async: false,
			success: function(data) {
				console.log(JSON.stringify(data));
				results = data;
				mui("#info")[0].value = data.message
				if(data.status == 0) {
					mui("#DAH026")[0].value = "";
					//					mui.toast("退料完成！");
					mui("#info")[0].value = "退料完成!";
					playerAudio("OK");
				}
			},
			error: function(xhr, type, errorThrown) {
				console.log("获取数据异常：" + JSON.stringify(errorThrown));
				plus.nativeUI.toast("获取数据异常：" + JSON.stringify(errorThrown));
				playerAudio("NG");

			}
		});
	} else if(TL_type == "2") { //良品退料
		$.ajax({
			url: app.API_URL_HEADER + app.API_METHOD_ESP,
			data: {
				spname: "ReturnMaterialByLPBill", //获取用户菜单权限
				returnvalue: 1,
				_sp_DRA001: billType,
				_sp_DRA002: billNo,
				_sp_DAF002: ReadybillNo,
				_sp_DAH005: DAH005,
				_sp_DRB010: DAH026,
				_sp_Auditor: user_id,
				_sp_DRB023: DRB023,
				_sp_KW: KW
			},
			dataType: "json",
			type: "post",
			async: false,
			success: function(data) {
				console.log(JSON.stringify(data));
				results = data;
				mui("#info")[0].value = data.message
				if(data.status == 0) {
					mui("#DAH026")[0].value = "";
					playerAudio("OK");
					mui("#info")[0].value = "退料完成!";
				}
			},
			error: function(xhr, type, errorThrown) {
				console.log("获取数据异常：" + JSON.stringify(errorThrown));
				plus.nativeUI.toast("获取数据异常：" + JSON.stringify(errorThrown));
				playerAudio("NG");
			}
		});
	} else if(TL_type == "3") { //不良品退料
		$.ajax({
			url: app.API_URL_HEADER + app.API_METHOD_ESP,
			data: {
				spname: "ReturnMaterialByLPBill", //获取用户菜单权限
				returnvalue: 1,
				_sp_DRA001: billType,
				_sp_DRA002: billNo,
				_sp_DAF002: ReadybillNo,
				_sp_DAH005: DAH005,
				_sp_DRB010: DAH026,
				_sp_Auditor: user_id,
				_sp_DRB023: DRB023,
				_sp_KW: KW
			},
			dataType: "json",
			type: "post",
			async: false,
			success: function(data) {
				console.log(JSON.stringify(data));
				results = data;
				mui("#info")[0].value = data.message
				if(data.status == 0) {
					mui("#DAH026")[0].value = "";
					playerAudio("OK");
					mui("#info")[0].value = "退料完成!";
				}
			},
			error: function(xhr, type, errorThrown) {
				console.log("获取数据异常：" + JSON.stringify(errorThrown));
				plus.nativeUI.toast("获取数据异常：" + JSON.stringify(errorThrown));
				playerAudio("NG");
			}
		});
	}
}