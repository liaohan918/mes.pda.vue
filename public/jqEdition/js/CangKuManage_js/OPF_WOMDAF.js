var CurdateTime = ""; //当前时间 
var tbBarcodes;
var userPicker = new mui.PopPicker();
var tbFocusBarCode //焦点行的条码
var MergeBillNo = "";

//add by HCW 20200318
mui.plusReady(function() {
	$('#tabsid').tabs({
				height: $(window).height() - $("#form").height() - 25
			});
});

$(function() {
	var dateTime = GetSysDateTime();
	CurdateTime = dateTime;
	GetBillType();
	$('#gridKMaterialList').datagrid({
		rowStyler: function(index, row) {
			if (row.DAG014 != row.DAG015) {
				return 'background-color:PeachPuff;font-weight:bold';
			} else {
				return 'background-color:White;font-weight:bold;';
			}
		}
	});
})


function GetBillType() {
	$.ajax({
		url: app.API_URL_HEADER + '/OPF_WOMDAF/LoadData',
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			dt = $.parseJSON(resdata.data);
			userPicker.setData(dt);
		},
		error: function(xhr, type, errorThrown) {
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

/**
 * 根据领料单获取领料单的详细信息
 */
function ReflishInfo() {
	GetMaterialList();
}


$('#txtDJLX').click(function() {
	userPicker.show(function(items) {
		$('#txtDJLX').val(items[0]['value']);
		$('#txtDJMC').val(items[0]['text']);
		$('#txtBillNo')[0].focus();
	});
});

/*
 * 获取物料明细
 */
function GetMaterialList() {
	$.ajax({
		url: app.API_URL_HEADER + '/OPF_WOMDAF/GetMaterialList',
		data: {
			BillType: $("#txtDJLX").val(),
			BillNo: $("#txtBillNo").val()
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if (resdata.status == 1) {
				DataGridClearn('#gridKMaterialList');
				return;
			} else {
				console.log(JSON.stringify(resdata));
				var tb = JSON.stringify(resdata.data);
				$('#gridKMaterialList').datagrid('loadData', resdata.data.MaterialList);
				MergeBillNo = resdata.data.MergeBillNo;
				$("#wl_sum")[0].innerHTML = resdata.data.MaterialList.length;
				$('#materialCode')[0].focus();
			}
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
		url: app.API_URL_HEADER + '/OPF_WOMDAF/GetStorageLocation',
		data: {
			materialID: materialID,
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			var tb = JSON.stringify(resdata.data);
			$('#gridKWList').datagrid('loadData', resdata.data.StorageLocation);
			$("#kw_sum")[0].innerHTML = resdata.data.StorageLocation.length;

		},
		error: function(xhr, type, errorThrown) {
			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

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

function DowithBarcode(BarCode) {
	var check = $("#checkdefault").prop("checked") == true ? "1" : "0"
	$.ajax({
		async: false,
		url: app.API_URL_HEADER + '/OPF_WOMDAF/DoBarcode',
		data: {
			SystemDateTime: CurdateTime,
			LoginID: app.userid(),
			CurBillType: $("#txtDJLX").val(),
			CurBillNo: $("#txtBillNo").val(),
			strBarCode: BarCode,
			isCancel: check,
			MergeBillNo: MergeBillNo

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
			} else if (resdata.status == 0) {
				playerAudio("OK");
				mui.toast("条码" + $("#materialCode").val() + "操作成功");
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

function SetFocusBarcode(data) {
	tbFocusBarCode = data["DAH005"];
}
