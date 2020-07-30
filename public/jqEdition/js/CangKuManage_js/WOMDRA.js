/**
 * 作者：张凌玮
 * 时间：2018-09-11
 *  描述：SMT在线不良退料单
 */
var billType = "5603"; //工单不良退料
var billNo = ""; //获取退料单单号
var CurbillDate;
var userPicker = new mui.PopPicker(); //原因选择
var tbBackReason;
var jsonWOMDARBRows = [];
var rowcount = 1;
var SumAll = 0;
var ReadybillNo = ""; //备料单单号

mui.plusReady(function() {
	app.init();
	
	//add by HCW 20200317
	$('#tabsid').tabs({
		height: $(window).height() - 15
	});
});

$(function(){
	DataInit(); //杨俊燃添加,原来没写，注释了 2019-03-30
});


/**
 * 初始化
 */
function DataInit() {
	var CurDateTime = GetSysDateTime();
	//	var dateStr = dateTime["sys_date"].replace(/-/g, "/") + " " + dateTime["sys_time"];
	CurbillDate = new Date(CurDateTime.replace(/-/g, "/"));
// 	var hours = CurbillDate.getHours(); //获取当前小时数(0-23) 
// 	if(hours <= 7) {
// 		var t = CurbillDate.getTime() - 1000 * 60 * 60 * 24;
// 		CurbillDate = new Date(t);
// 	}
	billNo = GetMaxBillNO(billType, formatDate(CurbillDate)); //获取单据编号
	document.getElementById('txtDRA002').value = billNo;
	GetBackReason();
}
/**
 * 原因选中选中事件
 */
function BackReasonClick() {
	userPicker.show(function(items) {
		$('#txtDRB023').val(items[0]['value']);
	});
}
/*
 * 获取退料原因
 */
function GetBackReason() {
	$.ajax({
		url: app.API_URL_HEADER + '/WOMDRA/GetBackReason',
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 1) {
				mui.alert(resdata.data);
				return false;
			} else {
				console.log(JSON.stringify(resdata));

				tbBackReason = resdata.data.BackReason;
				userPicker.setData(tbBackReason);

				return true;
			}
		},
		error: function(xhr, type, errorThrown) {
			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
			return false;
		}
	});
}

/*
 * 获取条码信息
 */
function GetBarCodeInfo(barcode) {
	$.ajax({
		url: app.API_URL_HEADER + '/WOMDRA/GetBarCodeInfo',
		data: {
			Barcode: barcode
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 1) {
				mui.alert(resdata.message);
				return;
			} else {
				console.log(JSON.stringify(resdata));
				BarCodeInfo = resdata.data.BarCodeInfo;
				document.getElementById('txtDRB017').value = BarCodeInfo[0]["DRB017"];
				document.getElementById('txtDRB006').value = BarCodeInfo[0]["DRB006"];
				document.getElementById('txtDRB007').value = BarCodeInfo[0]["DRB007"];
				document.getElementById('txtDRB010').value = BarCodeInfo[0]["DRB011"];
				ReadybillNo = BarCodeInfo[0]["DRB018"]; //备料单单号
				return;
			}
		},
		error: function(xhr, type, errorThrown) {
			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
			return false;
		}
	});
}

function WOMDBANewRow() {
	var barcode = document.getElementById('txtBarcode').value;
	if(barcode == "" || barcode == null) {
		mui.alert("条码不能为空，请扫描条码！");
		mui("#txtBarcode")[0].focus();
		return;
	}
	for(var i in jsonWOMDARBRows) {
		if(barcode == jsonWOMDARBRows[i]["DRB004"]) {
			mui.alert("本次退料列表中已经有此条码，请扫描下一个条码！");
			mui("#txtBarcode")[0].focus();
			return;
		}
	}
	var DRB023 = document.getElementById('txtDRB023').value;
	var sum = document.getElementById('txtDRB010').value;
	var stralter = "";
	if(DRB023 == "" || DRB023 == null)
		stralter = "不良类型必须选择！\r";
	if(sum <= 0)
		stralter = stralter + "实盘数量不能小余等于0，请重新输入！";
	if(stralter != "" && stralter != null) {
		mui.alert(stralter);
		return;
	}
	if(!Commit())
		return;
	var oneRow = {};
	oneRow.DRB003 = rowcount;
	oneRow.DRB004 = barcode;
	oneRow.DRB006 = document.getElementById('txtDRB006').value;
	oneRow.DRB017 = document.getElementById('txtDRB017').value;
	oneRow.DRB010 = sum;
	oneRow.DRB023 = document.getElementById('txtDRB023').value;
	oneRow.DRB027 = 1;
	jsonWOMDARBRows.push(oneRow);
	rowcount++;
	$('#gridWOMDRB').datagrid('loadData', jsonWOMDARBRows);
	Reflash();
}

function Reflash() {
	document.getElementById('txtCount').value = jsonWOMDARBRows.length;

	for(var i in jsonWOMDARBRows) {
		SumAll = SumAll + Number(jsonWOMDARBRows[i]["DRB010"]);
	}
	document.getElementById('txtSumAll').value = SumAll;
	document.getElementById('txtBarcode').value = "";
	document.getElementById('txtDRB006').value = "";
	document.getElementById('txtDRB007').value = "";
	document.getElementById('txtDRB017').value = "";
	document.getElementById('txtDRB023').value = "";
	document.getElementById('txtSum').value = "";

}

/**
 * 物料确认
 */
function Commit() {
//	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
//	console.log(JSON.stringify(currentSession));
//	var user_id = currentSession.user_id;
		var user_id = "zlw";
	var DAH005 = document.getElementById("txtBarcode").value //条码
	var DRB010 = document.getElementById("txtDRB010").value //退料数量
	var BackReasonType = document.getElementById("txtDRB023").value //获取退料原因
	$.ajax({
		url: app.API_URL_HEADER + app.API_METHOD_ESP,
		data: {
			spname: "ReturnMaterialByBuLiangBill", //不良品退料
			returnvalue: 1,
			_sp_DRA001: billType, //退料单别
			_sp_DRA002: billNo, //--退料单号
			_sp_DAF002: ReadybillNo, //备料单号
			_sp_DAH005: DAH005, //条码
			_sp_DRB010: DRB010, //退料数量
			_sp_DRB023: BackReasonType, //不良代码
			_sp_Auditor: user_id, //退料人
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(data) {
			console.log(JSON.stringify(data));
			results = data;
			mui("#info")[0].value = data.message
			if(data.status == 0) {
				mui.alert("退料完成！");
				mui("#txtBarcode")[0].focus(); //进入界面材料条码输入框获得焦点
				return true;
			} else {
				mui.alert(data.message);
				mui("#txtBarcode")[0].focus(); //进入界面材料条码输入框获得焦点
				return false;
			}
		},
		error: function(xhr, type, errorThrown) {
			console.log("获取数据异常：" + JSON.stringify(errorThrown));
			plus.nativeUI.toast("获取数据异常：" + JSON.stringify(errorThrown));

		}
	});
}