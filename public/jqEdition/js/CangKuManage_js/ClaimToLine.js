var barCode = ""; //当前条码
var kuweiCode = ""; //当前库位
var CurdateTime = ""; //当前时间
var billDate = ""; //单据日期
var billNo = ""; //条码品质，默认以扫描的第一个条码为准
var billType = ""; //单据类型
var CurCustomerID = "" //当前客户ID
// var AutoBillNo = 0;
var tbBillNos; //当天的领料单
var tbBarcodes; //已经扫过的条码
var userPicker = new mui.PopPicker();
var waitySendQty = "";
var tbBarcodeInfo //条码集合
var tbFocusBarCode //焦点行的条码

/** 
 * {选择交易日期}
 */
function ChangeDate(e) {
	var result = mui("#tradingDate")[0];
	var picker = new mui.DtPicker({
		type: 'date'
	});
	picker.show(function(rs) { //选择了一个库位
		DataGridClearn('#gridKMaterialList');
		DataGridClearn('#gridKWList');
		DataGridClearn('#gridBarcodeList');

		result.value = rs.text;
		//		result.value = "2018-08-15";
		picker.dispose();
		billDate = result.value;
		GetBillNoList();
	});
};

/**
 * 订单选中事件
 */
function GetBillNobyClick() {
	userPicker.show(function(items) {
		$('#BillNo').val(items[0]['value']);
		BandingBaseInfo(items);
		ReflishInfo();
	});
}

/**
 * {获取日期}
 */
function DateInit() {
	var dateTime = GetSysDateTime();
	CurdateTime = dateTime;
	//	var dateStr = dateTime["sys_date"].replace(/-/g, "/") + " " + dateTime["sys_time"];
	DateTemp = new Date(dateTime.replace(/-/g, "/"));
	// 	var hours = DateTemp.getHours(); //获取当前小时数(0-23) 
	// 	if(hours <= 7) {
	// 		var t = billDate.getTime() - 1000 * 60 * 60 * 24;
	// 		DateTemp = new Date(t);
	// 	}
	billDate = formatDate(DateTemp);
	//	billDate = "2018-08-15";
	GetBillNoList();
	//	if(GetBillNoList()) {
	//		ReflishInfo();
	//	}
}

/**
 * 获取当天所有的领料单
 */
function GetBillNoList() {
	$.ajax({
		url: app.API_URL_HEADER + '/ClaimToLine/GetBillNoList',
		data: {
			//date: billDate
			date: $('#tradingDate').val()
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 1) {
				mui.alert(resdata.message);
				$("#BillNo").val('');

				return false;
			} else {
				console.log(JSON.stringify(resdata));
				tbBillNos = resdata.data.BillNoList;
				$('#BillNo').val(tbBillNos[0]['value']);
				userPicker.setData(tbBillNos);
				return true;
			}
		},
		error: function(xhr, type, errorThrown) {
			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
			return false;
		}
	});
}

/**
 * 备料单信息选择的时候绑定基础信息
 * @param {Object} tbBillNos
 */
function BandingBaseInfo(tbBillNos) {
	if(tbBillNos == '') {
		billNo = tbBillNos;
		billType = '';
		CurCustomerID = tbBillNos;
		SendStock = tbBillNos;
	} else {
		billNo = tbBillNos[0]['value'];
		billType = GetBillType(billNo);
		CurCustomerID = tbBillNos[0]['DAF003'];
		SendStock = tbBillNos[0]['DAF022'];
	}
}
/**
 * 根据领料单获取领料单的详细信息
 */
function ReflishInfo() {
	GetMaterialList();
	GetBarCodeList();
}

/**
 * 获取物料明细
 */
function GetMaterialList() {
	$.ajax({
		//		async: false,
		url: app.API_URL_HEADER + '/ClaimToLine/GetMaterialList',
		data: {
			BillType: billType,
			BillNo: billNo
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 1) {
				//mui.alert(resdata.message);
				//清空原有数据
				DataGridClearn('#gridKMaterialList');
				return;
			} else {
				console.log(JSON.stringify(resdata));
				var tb = JSON.stringify(resdata.data);
				$('#gridKMaterialList').datagrid('loadData', resdata.data.MaterialList);
				$("#wl_sum")[0].innerHTML = resdata.data.MaterialList.length;
			}
		},
		error: function(xhr, type, errorThrown) {
			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

/**
 * 获取条码明细
 */
function GetBarCodeList() {
	DataGridClearn('#gridBarcodeList');
	$("#tm_sum")[0].innerHTML = 0;
	// AutoBillNo = GetMaxBillNO("PDA", formatDate(GetSysDateTime()));
	$.ajax({
		//		async: false,
		url: app.API_URL_HEADER + '/ClaimToLine/GetBarCodeList',
		data: {
			BillType: billType,
			BillNo: billNo
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			// 			if(resdata.status == 1) {
			// 				//				mui.alert(resdata.message);
			// 				//清空原有数据
			// 				DataGridClearn('#gridBarcodeList');
			// 				return;
			// 			} else {
			console.log(JSON.stringify(resdata));
			tbBarcodes = resdata.data.BarCodeList;
			$('#gridBarcodeList').datagrid('loadData', resdata.data.BarCodeList);
			$("#tm_sum")[0].innerHTML = resdata.data.BarCodeList.length;
			// }
		},
		error: function(xhr, type, errorThrown) {
			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

/**
 * 获取物料对应的库位
 * @param {Object} materialID
 */
function GetStorageLocation(materialID) {
	DataGridClearn('#gridKWList');
	$.ajax({
		//		async: false,
		url: app.API_URL_HEADER + '/ClaimToLine/GetStorageLocation',
		data: {
			materialID: materialID,
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			// 			if(resdata.status == 1) {
			// 				//				mui.alert(resdata.message);
			// 				//清空原有数据
			// 				return;
			// 			} else {
			console.log(JSON.stringify(resdata));
			var tb = JSON.stringify(resdata.data);
			$('#gridKWList').datagrid('loadData', resdata.data.StorageLocation);
			$("#kw_sum")[0].innerHTML = resdata.data.StorageLocation.length;
			// }
		},
		error: function(xhr, type, errorThrown) {
			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

/**
 * 获取单据类别
 * @param {Object} billno
 */
function GetBillType(billno) {
	for(var i = 0, l = tbBillNos.length; i < l; i++) {
		if(tbBillNos[i]["value"] == billno)
			return tbBillNos[i]["DAF001"];　　
	}
}

/**
 * 清除表数据
 * @param {Object} GridID
 */
function DataGridClearn(GridID) {
	var item = $(GridID).datagrid('getRows');
	if(item) {
		for(var i = item.length - 1; i >= 0; i--) {
			var index = $(GridID).datagrid('getRowIndex', item[i]);
			$(GridID).datagrid('deleteRow', index);
		}
	}
	$(GridID).datagrid('loadData', {
		total: 0,
		rows: []
	});
}

function DowithBarcode(BarCode) {
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	console.log(JSON.stringify(currentSession));
	var user_id = currentSession.user_id;
	//	var user_id = "zlw";
	var check = $("#checkdefault").prop("checked") == true ? "1" : "0"
	$.ajax({
		async: false,
		url: app.API_URL_HEADER + '/ClaimToLine/DoBarcode',
		data: {
			LoginID: user_id,
			// SendStock: kuweiCode,
			CurBillType: billType,
			CurBillNo: billNo,
			strBarCode: BarCode,
			// iscbPh: iscbPh,
			isCancel: check
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 1) {
				waitySendQty=resdata.data;
				if(waitySendQty=='')
					waitySendQty=0;
				playerAudio("NG");
				mui.alert(resdata.message);
				return;
			} else if(resdata.status == 0) {
				playerAudio("OK");
				mui.toast("条码" + $("#materialCode").val() + "发料成功");
				console.log(JSON.stringify(resdata));
				//				//document.getElementById('num').value = resdata.data.NeedRow.ItemArray[7];
				ReflishInfo();
				$("#materialCode").val("");
				$("#materialCode").focus();
				//tbBarcodeInfo =  resdata.data.StorageLocation;
			} else {

				mui.toast(resdata.message);
				ReflishInfo();
				$("#materialCode").val("");
				$("#materialCode").focus();
			}

		},
		error: function(xhr, type, errorThrown) {
			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
			return;
		}
	});
}

//条码拆分
function SplitBarcode(e) {

	var tmpTiaoMa = mui('#materialCode')[0].value;
	if(tmpTiaoMa == "") {
		playerAudio("NG");
		mui.alert("请先扫描条码，再拆分操作~")
		return;
	}

	if(waitySendQty == "") {
		playerAudio("NG");
		mui.alert("无待发数量，不需要拆分操作~")
		return;
	}

	//跳转界面
	var extras = {
		BarCode: mui('#materialCode')[0].value,
		waitySendQty: waitySendQty
	};
	newpage(e, extras);
	mui('#materialCode')[0].value='';
}

//注释于2019-05-13  吴

///**
// * 删除条码
// */
//function DeleteBarcode() {
//	if(!confirm('确认删除当前条码?'))
//		return;
//	$.ajax({
//		async: false,
//		url: app.API_URL_HEADER + '/ClaimToLine/DeleteMBarcode',
//		data: {
//			CurBillType: billType,
//			CurBillNo: billNo,
//			strBarCode: tbFocusBarCode
//		},
//		dataType: "json",
//		type: "post",
//		success: function(resdata) {
//			if(resdata.status == 1) {
//				mui.alert(resdata.message);
//				return;
//			} else {
//				console.log(JSON.stringify(resdata));
//				ReflishInfo();
//			}
//		},
//		error: function(xhr, type, errorThrown) {
//			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
//			return;
//		}
//	});
//}

function SetFocusBarcode(data) {
	tbFocusBarCode = data["DAH005"];
}

//注释于2019-05-13  吴

//function DeleteAll() {
//	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
//	console.log(JSON.stringify(currentSession));
//	var user_id = currentSession.user_id;
////		var user_id = "zlw";
//	if(!confirm('确认删除所有条码?'))
//		return;
//	$.ajax({
//		async: false,
//		url: app.API_URL_HEADER + '/ClaimToLine/DeleteAll',
//		data: {
//			CurBillType: billType,
//			CurBillNo: billNo,
//			LoginID: user_id,
//			SystemDateTime: billDate,
//		},
//		dataType: "json",
//		type: "post",
//		success: function(resdata) {
//			if(resdata.status == 1) {
//				mui.alert(resdata.message);
//				return;
//			} else {
//				console.log(JSON.stringify(resdata));
//				ReflishInfo();
//			}
//		},
//		error: function(xhr, type, errorThrown) {
//			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
//			return;
//		}
//	});
//}

///**
// * 对条码进行第一次检测
// * @param {Object} strBarCode
// */
//function doScanCheckBarCode(strBarCode) {
//	if(strBarCode.substr(0, 1).toUpperCase() == "M") {
//		mui.alert("扫描条码不能为主条码！");
//		return false;
//	}
//	for(var row in tbBarcodes) {
//		if(tbBarcodes[row]["DAH005"] != strBarCode)
//			continue;
//		mui.alert("当前条码:" + strBarCode + "\n已经在本次备料中");
//		return false;
//	}
//	return true;
//}
//
///**
// * 获取条码信息
// * @param {Object} BarCode
// * @param {Object} iscbPh
// */
//function GetInfoFromBarCode(BarCode, iscbPh) {
//	$.ajax({
//		async: false,
//		url: app.API_URL_HEADER + '/ClaimToLine/GetInfoFromBarCode',
//		data: {
//			BarCode: BarCode,
//			iscbPh: iscbPh
//		},
//		dataType: "json",
//		type: "post",
//		success: function(resdata) {
//			if(resdata.status == 1) {
//				mui.alert(resdata.message);
//				return ;
//			} else {
//				console.log(JSON.stringify(resdata));
//				var tb = JSON.stringify(resdata.data);
//				tbBarcodeInfo =  resdata.data.StorageLocation;
//			}
//		},
//		error: function(xhr, type, errorThrown) {
//			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
//			return ;
//		}
//	});
//}
//
///**
// * 检查批量发料的物料是否有误
// * @param {Object} tbBarInfo
// * @param {Object} iscbPh
// */
//function doCheckBarcodeTable(BarCode, tbBarInfo, iscbPh) {
//	if(tbBarcodes.length < 1) {
//		var str = "";
//		if(iscbPh) {
//			str = "按批号没有找到条码:" + BarCode + ",请取消按批号发料重试！"
//		} else {
//			var str = "没有找到条码:" + BarCode;
//		}
//		mui.alert(str);
//		return false;
//	}
//	for(var row in tbBarInfo) {
//		var Barcode = tbBarInfo[row]["DAB001"]; //条码
//		//仓库
//		if(SendStock != tbBarInfo[row]["DAB002"]) {
//			mui.alert("当前条码:" + Barcode + "\n在仓库:" +
//				tbBarInfo[row]["DAB002"] + "当前备料所需发料仓库为:" + SendStock);
//			return false;
//		}
//	}
//	return true;
//}
//
//function DoBarCode(BarCode, tbBarInfo) {
//	var returnRow = null;
//	var PartRow = null;
//	for(var row in tbBarInfo) {
//		if(BarCode = tbBarInfo[row]["DAB001"]) {
//			returnRow = tbBarInfo[row];
//		}
//		var BarQty = tbBarInfo[row]["DAB006"];
//		if(BarQty < 0) {
//			mui.alert("条码" + tbBarInfo[row]["DAB001"].toString() + "已经发过，数量为0！")
//			continue;
//		}
//		var PartSpec = tbBarInfo[row]["DAA004"];
//		if(PartRow == null || PartSpec != PartRow["DAG004"].ToString()) {
//			var PartRows = tbBarcodes.filter(function(e) {
//				return e.DAG004 == PartSpec;
//			});
//			if(PartRows != null && PartRows.Length > 0)
//				PartRow = PartRows[0];
//			else if(CheckPartSpec) {
//				mui.alert("条码"+tbBarInfo[row]["DAB001"]+"的品号在"+PartSpec+"在领料单中不存在,不能使用批号发料!");
//				return null;
//			}
//		}
//		 UpdateWOMDAG(tbBarInfo[row], PartRow);
//		
//	}
//}
//
//function UpdateWOMDAG(BarRow, PartRow){
//	
//	
//}