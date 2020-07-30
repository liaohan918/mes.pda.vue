var billDate = ""; //单据日期
var billNo = ""; //条码品质，默认以扫描的第一个条码为准
var billType = ""; //单据类型
var CurCustomerID = "" //当前客户ID
var tbBillNos; //当天的领料单
var tbBarcodes; //已经扫过的条码
var userPicker = new mui.PopPicker();
var linePicker = new mui.PopPicker();
var waitySendQty = "";
var tbFocusBarCode //焦点行的条码
var line="";//生产线别

mui.plusReady(function(e){
	app.init();
	$('#gridKMaterialList').datagrid({height: $(window).height() - $("#form").height() - 35});
	$('#gridKWList').datagrid({height: $(window).height() - $("#form").height() - 75});
	$('#gridBarcodeList').datagrid({height: $(window).height() - $("#form").height() - 35});
});

// $('#tabsid').tabs({
// 	height: $(window).height() - $("#form").height()
// });

/**
 * 材料列表领料单行点击事件
 */
$(function() {

	GetLine();
	GetBillNoList();
	
	/**
	 * 申领单点击事件
	 */
	$('#BillNo').click(function() {
		GetBillNobyClick()
	});
	
	$('#line').click(function() {
		GetLineClick()
	});
	
	$('#refresh').click(function() {
		if (GetBillNoList()) {
			ReflishInfo();
		}
	});
	
	$('#gridBarcodeList').datagrid({
		onClickRow: function(index, data) {
			SetFocusBarcode(data);
		}
	});
	
	$('#gridKMaterialList').datagrid({
		onClickRow: function(index, data) {
			GetStorageLocation(data["DAG004"]);
			document.getElementById('ThismaterialCode').value = data["DAG004"];
		}
	});
});

/**
 * 日期切换事件
 */
document.getElementById('tradingDate').addEventListener('tap',
	function(e) {
		ChangeDate(e);
	});
/**
 * 条码回车事件
 */
document.getElementById('materialCode').addEventListener('keydown', function(e) {
	if (e.keyCode != 13) return;
	var barcode = document.getElementById('materialCode').value

	DowithBarcode(barcode);
});

document.getElementById('tradingDate').addEventListener("input propertychange", function() {
	console.log($(this).val().length); //打印输入框字符长度
});

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

function GetLineClick(){
	linePicker.show(function(items) {
		$('#line').val(items[0]['value']);
		line=$('#line').val();
		GetBillNoList();
	});
}

/**
 * 获取当天所有的领料单
 */
function GetBillNoList() {
	$.ajax({
		url: app.API_URL_HEADER + '/ClaimToLine01/GetBillNoList',
		data: {
			billDate: $('#tradingDate').val(),
			line:$('#line').val()
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
 * 获得生产线别
 */
function GetLine(){
	$.ajax({
		url: app.API_URL_HEADER + '/ClaimToLine01/GetLine',
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 1) {
				mui.alert(resdata.message);
				$("#BillNo").val('');
				return false;
			} else {
				console.log(JSON.stringify(resdata));
				linePicker.setData(resdata.data);
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
		url: app.API_URL_HEADER + '/ClaimToLine01/GetMaterialList',
		data: {
			BillType: billType,
			BillNo: billNo
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 1) {
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
	$.ajax({
		//		async: false,
		url: app.API_URL_HEADER + '/ClaimToLine01/GetBarCodeList',
		data: {
			BillType: billType,
			BillNo: billNo
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
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
		url: app.API_URL_HEADER + '/ClaimToLine01/GetStorageLocation',
		data: {
			materialID: materialID,
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
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
	var check = $("#checkdefault").prop("checked") == true ? "1" : "0"
	$.ajax({
		async: false,
		url: app.API_URL_HEADER + '/ClaimToLine01/DoBarcode',
		data: {
			LoginID: user_id,
			CurBillType: billType,
			CurBillNo: billNo,
			strBarCode: BarCode,
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
				ReflishInfo();
				$("#materialCode").val("");
				$("#materialCode").focus();
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

function SetFocusBarcode(data) {
	tbFocusBarCode = data["DAH005"];
}

