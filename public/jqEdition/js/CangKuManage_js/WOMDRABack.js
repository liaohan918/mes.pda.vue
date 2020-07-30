//
//	作者：2606529150@qq.com
//	时间：2018-09-12
//	描述：SMT不良品退料
//

var thisBarinfo = null; //当前的条码信息表

/**
 * 获取条码信息
 */
function GetBarCodeInfo() {
	barcode = document.getElementById('txtBarcode').value;
	$.ajax({
		url: app.API_URL_HEADER + '/WOMDRABack/GetBarCodeInfo',
		data: {
			Barcode: barcode
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(resdata) {
			if(resdata.status == 1) {
				mui.alert(resdata.message);
				return;
			} else {
				console.log(JSON.stringify(resdata));
				thisBarinfo = resdata.data.BarCodeInfo;
				document.getElementById('Barinfo').value = resdata.data.info;
				document.getElementById('txtDRA002').value = BarCodeInfo[0]["DRB002"];
				document.getElementById('txtKuWei').value = BarCodeInfo[0]["DAB003"];
				document.getElementById('txtCangku').value = BarCodeInfo[0]["DAB002"];
				document.getElementById('txtSum').value = BarCodeInfo[0]["DAH011"];
				var tbWOMDRB = JSON.stringify(resdata.data.tbWOMDRB);
				$('#gridWOMDRB').datagrid('loadData', tbWOMDRB);
				document.getElementById('AllBack').value = resdata.data.AllBack;
				document.getElementById('NeedBack').value = resdata.data.NeedBack;
				document.getElementById('ReadyBack').value = resdata.data.ReadyBack;
				return;
			}
		},
		error: function(xhr, type, errorThrown) {
			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
			return;
		}
	});
}

/**
 * 获取更换后库位的信息
 */
function GetStoragenfo() {
	barcode = document.getElementById('txtBarcode').value;
	if(barcode == "" || barcode == null) {
		mui.alert("请先扫描物料条码！")
		return;
	}
	var Stockcode = document.getElementById('txtKuWei').value;

	$.ajax({
		url: app.API_URL_HEADER + '/WOMDRABack/GetStoragenfo',
		data: {
			Stockcode: Stockcode
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 1) {
				mui.alert(resdata.data);
				return;
			} else {
				console.log(JSON.stringify(resdata));
				thisStockInfo = resdata.data.StockInfo;
				document.getElementById('txtKuWei').value = thisStockInfo[0]["BAB001"];
				document.getElementById('txtCangku').value = thisStockInfo[0]["BAB002"];
				return;
			}
		},
		error: function(xhr, type, errorThrown) {
			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
			return;
		}
	});
}

function BackConFirm() {
	var kuwei = document.getElementById('txtKuWei').value;
	var sum = document.getElementById('txtSum').value;
	var DRB017 = thisBarinfo[0]["DRB017"];
	var DRB002 = thisBarinfo[0]["DRB002"];
	var DAB001 = thisBarinfo[0]["DAB001"];
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	console.log(JSON.stringify(currentSession));
	var user_id = currentSession.user_id;
	$.ajax({
		url: app.API_URL_HEADER + '/WOMDRABack/GetStoragenfo',
		data: {
			DRB017: DRB017, //工单单号
			DRB002: DRB002, //退料单号
			DAB001: DAB001, //条码
			kuwei: kuwei, //库位
			sum: sum, //条码数量
			LoginID: user_id, //工号
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 1) {
				mui.alert(resdata.data);
				return;
			} else {
				console.log(JSON.stringify(resdata));
				thisStockInfo = resdata.data.StockInfo;
				document.getElementById('txtKuWei').value = thisStockInfo[0]["BAB001"];
				document.getElementById('txtCangku').value = thisStockInfo[0]["BAB002"];
				return;
			}
		},
		error: function(xhr, type, errorThrown) {
			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
			return;
		}
	});
}