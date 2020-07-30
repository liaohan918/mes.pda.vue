var CurdateTime = ""; //当前时间
var billDate = ""; //单据日期
var billNo = ""; //条
var billType = ""; //1401借用单；1410，返还单（页面中定义）
var tbBillNos; //当天的领料单
var tbBarcodes; //已经扫过的条码
var userPicker = new mui.PopPicker();
var tbBarcodeInfo //条码集合 
/**
 * {获取日期}
 */
function DateInit() {
	var dateTime = GetSysDateTime();
	CurdateTime = dateTime;
	DateTemp = new Date(dateTime.replace(/-/g, "/"));
	billDate = formatDate(DateTemp);
	GetBillNoList();
	$("#tradingDate").val(billDate);
}

/** 
 * {选择交易日期}
 */
function ChangeDate(e) {
	var result = mui("#tradingDate")[0];
	var picker = new mui.DtPicker({
		type: 'date'
	});
	picker.show(function(rs) {
		DataGridClearn('#gridKMaterialList');
		DataGridClearn('#gridBarcodeList');
		result.value = rs.text;
		picker.dispose();
		billDate = result.value;
		GetBillNoList();
	});
};
/**
 * 备料单信息选择的时候绑定基础信息
 * @param {Object} tbBillNos
 */
// function BandingBaseInfo(tbBillNos) {
// 	if (tbBillNos == '')
// 		billNo = ''; // billType = '';
// 	else
// 		billNo = tbBillNos[0]['value']; // billType = GetBillType(billNo);
// }

/**
 * 获取单据类别
 * @param {Object} billno
 */
// function GetBillType(billno) {
// 	for(var i = 0, l = tbBillNos.length; i < l; i++) {
// 		if(tbBillNos[i]["value"] == billno)
// 			return tbBillNos[i]["DEA002"];　　
// 	}
// }

/**
 * 订单选中事件
 */
function GetBillNobyClick() {
	userPicker.show(function(items) {
		$('#BillNo').val(items[0]['value']);
		billNo = $('#BillNo').val();
		// BandingBaseInfo(items);
		ReflishInfo();
	});
}
/**
 * 获取当天所有的领料单
 */
function GetBillNoList() {
	$.ajax({
		url: app.API_URL_HEADER + '/INVDEA/GetBillNoList',
		data: {
			date: billDate,
			qtype: billType
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if (resdata.status == 1) {
				mui.alert(resdata.message);
				$("#BillNo").val('');
				playerAudio("NG");
				return false;
			} else {
				tbBillNos = resdata.data.BillNoList;
				$('#BillNo').val(tbBillNos[0]['value']);
				billNo=$('#BillNo').val();
				ReflishInfo();
				userPicker.setData(tbBillNos);
				playerAudio("OK");
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
 * 订单选中事件
 */
// function GetBillNobyClick() {
// 	userPicker.show(function(items) {
// 		$('#BillNo').val(items[0]['value']);
// 		BandingBaseInfo(items);
// 		ReflishInfo();
// 	});
// }
/**
 * 根据领料单获取领料单的详细信息
 */
function ReflishInfo() {
	GetMaterialList();
	GetBarCodeList();
}
/**
 * 获取物料汇总
 */
function GetMaterialList() {
	$.ajax({
		url: app.API_URL_HEADER + '/INVDEA/GetMaterialList',
		data: {
			BillNo: billNo
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if (resdata.status == 1) {
				DataGridClearn('#gridKMaterialList');
				playerAudio("NG");
				return;
			} else {
				playerAudio("OK");
				var tb = JSON.stringify(resdata.data);
				$('#gridKMaterialList').datagrid('loadData', resdata.data.MaterialList);
				$("#kw_sum")[0].innerHTML = resdata.data.MaterialList.length;
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
	$.ajax({
		url: app.API_URL_HEADER + '/INVDEA/GetBarCodeList',
		data: {
			BillNo: billNo
		},
		dataType: "json",
		type: "post",
		success: function(resdata) { 
			tbBarcodes = resdata.data.BarCodeList;
			$('#gridBarcodeList').datagrid('loadData', resdata.data.BarCodeList);
			$("#wl_sum")[0].innerHTML = resdata.data.BarCodeList.length; 
		},
		error: function(xhr, type, errorThrown) {
			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

function DowithBarcode(barcode,housestore,iscancel) {
	$.ajax({
		url: app.API_URL_HEADER + '/INVDEA/DoBarcode',
		data: {
			SystemDateTime: CurdateTime,
			LoginID: app.userid,
			CurBillType: billType,
			CurBillNo: billNo,
			strBarCode: barcode,
			isCancel:iscancel,
			housestore:housestore
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if (resdata.status == 1) {
				playerAudio("NG");
				mui.alert(resdata.message);
				$("#materialCode").val("");
				$("#materialCode").focus();
				return;
			} else {
				playerAudio("OK");
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

// 
// function ScanfHouse(BarCode, housestore) {
// 	if ($("#materialCode").val() == "") {
// 		alter("请扫描条码");
// 		$("#materialCode").focus();
// 		playerAudio("NG");
// 	}
// 
// 	$.ajax({
// 
// 		url: app.API_URL_HEADER + '/INVDEA_FH/ScanfHouse',
// 		data: {
// 			SystemDateTime: CurdateTime,
// 			LoginID: app.userid(),
// 			CurBillType: billType,
// 			CurBillNo: billNo,
// 			strBarCode: BarCode,
// 			housestore: housestore
// 
// 		},
// 		dataType: "json",
// 		type: "post",
// 		success: function(resdata) {
// 			if (resdata.status == 1) {
// 				playerAudio("NG");
// 				mui.alert(resdata.message);
// 				$("#housestore").val("");
// 				$("#housestore").focus();
// 				return;
// 			} else {
// 				playerAudio("OK");
// 				mui.toast(resdata.message);
// 				ReflishInfo();
// 				$("#materialCode").val("");
// 				$("#materialCode").focus();
// 			}
// 		},
// 		error: function(xhr, type, errorThrown) {
// 			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
// 			return;
// 		}
// 	});
// }


/**
 * 清除表数据
 * @param {Object} GridID
 */
function DataGridClearn(GridID) {
	var item = $(GridID).datagrid('getRows');
	if (item) {
		for (var i = item.length - 1; i >= 0; i--) {
			var index = $(GridID).datagrid('getRowIndex', item[i]);
			$(GridID).datagrid('deleteRow', index);
		}
	}
	$(GridID).datagrid('loadData', {
		total: 0,
		rows: []
	});
}

