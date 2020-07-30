/**
 * 成品出库--黄邦文
 */
var userid;

mui.plusReady(function() {
	app.init();
	userid = app.userid;
	//add by HCW 20200318
	$('#tabsid').tabs({
					height: $(window).height() - $("#box").height()-15
				});
	$('#dg').datagrid({
		height: $(window).height() - $("#box").height()-50
		});
	$('#barCodeInfo').height($(window).height()- $("#box").height()-136);
});

$(function() {
	$('#dg').datagrid({
		height: $(window).height() - $("#box").height()-50
		}
	).datagrid('clientPaging', GetData);
	$('#barCodeInfo').height($(window).height()- $("#box").height()-136);
});

var userPicker = new mui.PopPicker();
DataInit();
GetBillNo();
var songHuoDate = ""; //单据日期
var order = "";
/**
 * {初始化数据}
 */
function DataInit() {
	var dateTime = GetSysDateTime();
	songHuoDate = new Date(dateTime.replace(/-/g, "/"));
	mui("#txtSongHuoDate")[0].value = formatDate(songHuoDate); //初始化送货日期  默认当天
	mui("#txtSongHuoDate")[0].READ_ONLY = true;
	mui("#txtDanHao")[0].focus(); //进入界面单号输入框获得焦点
}

/**
 * {选择送货日期}
 */
document.getElementById("txtSongHuoDate").addEventListener("tap",
	function(e) {
		var result = mui("#txtSongHuoDate")[0];
		var picker = new mui.DtPicker({
			type: 'date'
		});
		picker.show(function(rs) {
			result.value = rs.text;
			picker.dispose();
			GetBillNo();
			mui("#txtDanHao")[0].value = "";
		});
	});

/**
 * {选择单号}
 */
document.getElementById("txtDanHao").addEventListener("click",
	function(e) {
		userPicker.show(function(items) {
			$('#txtDanHao').val(items[0]['value']);
			GetData();
		});
	});

/**
 * {获取单号}
 */
function GetBillNo() {
	$.ajax({
		url: app.API_URL_HEADER + "/COMDFC/GetBillNo",
		data: {
			dateTime: mui("#txtSongHuoDate")[0].value,
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			dt = $.parseJSON(resdata.data);
			var rows = [];
			userPicker.setData(dt);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

function GetData() {
	//以下才是以后要的实际操作
	$('#dg').datagrid('loadData', GetDatas());
};

function GetDatas() {
	$.ajax({
		url: app.API_URL_HEADER + "/COMDFC/GetDataByDanHao", //获取数据:调用webApi服务路径
		data: {
			DFB001: $("#txtDanHao").val() //语句查询参数3 ：jquery
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false, //是否异步
		success: function(data) { //成功后操作，返回行集合(data)
			if(data.status == 0) {
				$('#dg').datagrid('loadData', data.data.tbData);
				mui('#dg-sum')[0].innerHTML =data.data.sum;
			} else {
				mui.alert(data.message);
			}
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
		}
	});
}

/**
 * {扫描条码事件}
 */
document.getElementById("txtBarCode").addEventListener("keydown",
	function(e) {
		if(e.keyCode != 13)
			return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		var barCode = this.value.trim().toUpperCase();
		var billNo = mui("#txtDanHao")[0].value;
		if(billNo.trim() == "") {
			mui.alert("请先选择单号");
			return false;
		}
		if(barCode.trim() == "") {
			mui.alert("请扫码条码");
			return false;
		}
		$.ajax({
			url: app.API_URL_HEADER + "/COMDFC/GetBarInfo",
			data: {
				barCode: barCode,
				billNo: billNo
			},
			dataType: "json",
			type: "post",
			async: false,
			success: function(data) {
				if(data.status == 0) {
					//					plus.nativeUI.toast(data.data,{verticalAlign:'center'});
					mui("#barCodeInfo")[0].value = data.data.info;
					order = data.data.order;
					OutWareHouseOperation(order);
//					var btnArray = ['否', '是']; //选项
//					mui.confirm('是否出库？', '出库', btnArray,
//						function(e) {
//							if(e.index == 1) { //选择的索引
//								OutWareHouseOperation(order);
//							} else {
//								$("#txtBarCode").focus().val('');
//								$("#barCodeInfo").val('');
//							}
//						});
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
 * 出库操作
 */
function OutWareHouseOperation(order) {
	var data = {
		spname: "WMS_CREATE_COMDFA", //按当前日期获得最大编号
		returnvalue: 0,
		_sp_BillNo: mui("#txtDanHao")[0].value,
		_sp_SerialNo: order,
		_sp_BarCode: mui("#txtBarCode")[0].value,
		_sp_UserID: app.userid,
		_sp_BillType: '2307'
	};
	var responseData =
		AjaxOperation(data, "信息异常", true, app.API_METHOD_ESP);
	console.log(JSON.stringify(responseData));

	if(responseData.state) {
		playerAudio('OK');
		mui.toast('出货成功！');
		$("#txtBarCode").focus().val('');
//		$("#barCodeInfo").val('');
	} else {
		playerAudio('NG');
		mui.toast('出货失败！');
		$("#txtBarCode").focus().val('');
		$("#barCodeInfo").val('');
	}
	GetData();
	return true;
}