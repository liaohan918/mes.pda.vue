var tbBillNos; //当天的领料单
var tbBarcodes; //已经扫过的条码
var waitySendQty = "";
var billDate = ""; //单据日期
var userPicker = new mui.PopPicker();

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
 * 获取当天所有的领料单
 */
function GetBillNoList() {
	$.ajax({
		url: app.API_URL_HEADER + '/OPF_WOMDAF01/GetBillNoList',
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
				//$('#BillNo').val(tbBillNos[0]['value']);
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
 * 订单选中事件
 */
function GetBillNobyClick() {
	userPicker.show(function(items) {
		$('#BillNo').val(items[0]['value']);
		//BandingBaseInfo(items);
		ReflishInfo();
	});
}

/**
 * 根据领料单获取领料单的详细信息
 */
function ReflishInfo() {
	GetMaterialList();
	GetBarCodeList("");
}

/**
 * 获取物料明细
 */
function GetMaterialList() {
	$.ajax({
		url: app.API_URL_HEADER + '/OPF_WOMDAF01/GetMaterialList',
		data: {
			BillType:'5408',
			BillNo: document.getElementById('BillNo').value
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 1) {
				//清空原有数据
				playerAudio("NG");
				alert(resdata.data);
				document.getElementById('BillNo').value='';
				DataGridClearn('#gridKMaterialList');
				return;
			} else {
				playerAudio("OK");
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
function GetBarCodeList(TMMC) {
	DataGridClearn('#gridBarcodeList');
	$("#tm_sum")[0].innerHTML = 0;
	$.ajax({
		url: app.API_URL_HEADER + '/OPF_WOMDAF01/GetBarCodeList',
		data: {
			TMMC:TMMC,
			BillType:'5408',
			BillNo: document.getElementById('BillNo').value
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			tbBarcodes = resdata.data.BarCodeList;
			$('#gridBarcodeList').datagrid('loadData', resdata.data.BarCodeList);
			$("#tm_sum")[0].innerHTML = resdata.data.BarCodeList.length;
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
		url: app.API_URL_HEADER + '/OPF_WOMDAF01/GetStorageLocation',
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

function DowithBarcode(BarCode) {
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	console.log(JSON.stringify(currentSession));
	var user_id = currentSession.user_id;
	//var user_id = "zlw";
	var check = $("#checkdefault").prop("checked") == true ? "1" : "0"
	$.ajax({
		async: false,
		url: app.API_URL_HEADER + '/OPF_WOMDAF01/DoBarcode',
		data: {
			LoginID: user_id,
			CurBillType:'5408',
			CurBillNo: document.getElementById('BillNo').value,
			strBarCode: document.getElementById('materialCode').value,
			isCancel: check
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 1) {
				waitySendQty=resdata.data;
				if(waitySendQty==''){
					waitySendQty=0;
					playerAudio("NG");
					mui.alert(resdata.message);
					$("#materialCode").val("");
					$("#materialCode").focus();
				}
				else{
					playerAudio("NG");
					mui.alert(resdata.message);
				}
				return;
			} else if(resdata.status == 0) {
				playerAudio("OK");
				mui.toast(resdata.message);
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