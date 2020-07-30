//
//	作者：280639273@qq.com
//	时间：2018-09-12
//	描述：主条码
//

/*******************************************/
//MainBarCodePrintHtml.html
/*******************************************/
var tempIP = "";
var userPicker;
var billDate = ""; //单据日期
var billNo = ""; //条码品质，默认以扫描的第一个条码为准
var billType = "1202"; //单据类型
//var user_id='admin';
var useMainCode = "N"
var mainCodeprefix = ""

var tempCount = 0; //临时统计已扫主条码个数

//add by HCW 20200318
mui.plusReady(function() {
	$('#tabsid').tabs({
				height: $(window).height() -
					$("#div001").height() -
					$("#div002").height()
			});
});

$(function() {
	mui("#MainBarCode")[0].focus();
	DataInit();

})

function DataInit() {
	$.ajax({
		url: app.API_URL_HEADER + '/MainBarCodeBind/GetMainCodeRule',
		data: "",
		datatype: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 1) {
				mui.alert(resdata.message);
				return;
			} else {
				useMainCode = resdata.data.UseMainCode;
				mainCodeprefix = resdata.data.MainCodePrefix;
			}
		}
	})
}

//主条码打印页面加载时获取条码打印机
$(function() {
	userPicker = new mui.PopPicker();
	$.ajax({
		url: app.API_URL_HEADER + '/MainBarCode/GetPrinter',
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

});

function selectPrinter() {
	userPicker.show(function(items) {
		$('#cmbPrint').val(items[0]['text']);
		tempIP = items[0]['value'];
	});
}

//生成主条码
function CreateBar() {
	Count = document.getElementById('Count').value;
	$.ajax({
		url: app.API_URL_HEADER + '/MainBarCode/CreateBar',
		data: {
			Count: Count
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(resdata) {
			if(resdata.status == 1) {
				mui.alert(resdata.message, function() {
					mui("#Count")[0].focus();
					$("#Count").val("");
				});
				playerAudio("NG");
				return;
			} else {
				playerAudio("OK");
				$('#girdBar').datagrid('loadData', resdata.data.tbData);
			}
		},
		error: function(xhr, type, errorThrown) {
			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
			return;
		}
	});
}

//打印点击事件
function PrintBar() {
	var selRows = $('#girdBar').datagrid('getData').rows;
	var Counts = $('#girdBar').datagrid('getData').rows.length;
	var Position = mui('#cmbPrint')[0].value;
	if(Position == "") {
		alert("请选择打印机!");
		playerAudio("NG");
		return;
	}
	if(Counts <= 0) {
		alert("无打印数据!");
		playerAudio("NG");
		return;
	}
	var result = "";

	$.each(selRows, function(index, item) {
		result = result + "|" + item["MainBar"];
	});

	$.ajax({
		url: app.API_URL_HEADER + '/MainBarCode/PrintBar',
		data: {
			LoginID: app.userid(), //操作用户
			printName: mui('#cmbPrint')[0].value, //选择的打印机ip
			result: result,
			tempIP: tempIP
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false,
		success: function(data) {
			if(data.status != 0) {
				mui.alert(data.message);
				playerAudio("NG");
				return;
			} else {
				mui.toast(data.message);
				playerAudio("OK");
				mui("#Count")[0].focus();
				$("#Count").val("");
				$("#cmbPrint").val("");
			}
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息 
			return "";
		}
	});
}

/*******************************************/
//MainBarCodeInStoreHtml.html
/*******************************************/
var ZTMGS = 0
//主条码扫描
function ScanfMainBarCode(MainBarCodes) {

	var Position = mui('#MainBarCode')[0].value;
	if(Position == "") {
		alert("请扫描主条码!");
		playerAudio("NG");
		return;
	}

	if(useMainCode == "N") {
		mui.alert("未启用主条码功能");
		playerAudio("NG");
		return;
	}
	if(mainCodeprefix.length > 0 && MainBarCodes.indexOf(mainCodeprefix) < 0) {
		mui.alert("主条码规则不符合规范,请确认");
		playerAudio("NG");
		return;
	}

	Storehouse = document.getElementById('Storehouse').value;
	MainBarCode = document.getElementById('MainBarCode').value;

	if($("#checkdefault").prop("checked") == true) {
		billDate = GetSysDateTime();
		billNo = GetMaxBillNO(billType, billDate);
	}

	MainBarCode = document.getElementById('MainBarCode').value;
	$.ajax({
		url: app.API_URL_HEADER + '/MainBarCode/ScanfMainBarCode',
		data: {
			check: $("#checkdefault").prop("checked") == true ? "1" : "0",
			LoginID: app.userid(), //操作用户
			Storehouse: Storehouse,
			MainBarCode: MainBarCode,
			billDate: billDate,
			billNo: billNo,
			billType: billType
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false,
		success: function(resdata) {
			if(resdata.status == 1) {
				$("#MainBarCode").val("");
				mui("#MainBarCode")[0].focus();
				mui.alert(resdata.message);
				playerAudio("NG");
				return;
			} else {
				playerAudio("OK");
				$('#girdBarCode').datagrid('loadData', resdata.data.tbData);
				ZTMGS = resdata.data.shuliang;
				//带出物料最后一次入库的库位
				$("#ZTMGS").val(ZTMGS);
				//				if(resdata.data.RKStatus==1)
				if($("#checkdefault").prop("checked") == false)
					$("#Storehouse").val(resdata.data.KuWei).select();
				else if(resdata.data.RKStatus == 1) {
					playerAudio("OK");
					mui.toast("入库成功！");
					tempCount = tempCount + 1;
					$("#MainBarCode").val("").focus();
				} else {
					playerAudio("NG");
					mui.toast("入库失败！");
					$("#MainBarCode").val("").focus();
				}
				$("#MainCodeTotal").text("条码个数:" + resdata.data.shuliang + ",总数量:" + resdata.data.Total + ",已入库主条码个数:" + tempCount);
			}
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息 
			return "";
		}
	});
}

//物料条码扫描
function ScanfMaterialBar() {

	var MainBarCode = mui('#MainBarCode')[0].value; //主条码
	var TMGS = mui('#TMGS')[0].value; //条码个数
	if(MainBarCode == "") {
		alert("请扫描主条码!");
		mui("#MainBarCode")[0].focus();
		playerAudio("NG");
		return;
	}

	if($("#TMGS").val() != "") {
		if($("#ZTMGS").val() == $("#TMGS").val()) {
			mui.toast("主条码已满");
			$("#BarCode").val("");
			mui("#Storehouse")[0].focus();
			playerAudio("NG");
			return;
		}
	}

	BarCode = document.getElementById('BarCode').value;
	$.ajax({
		url: app.API_URL_HEADER + '/MainBarCode/ScanfMaterialBar',
		data: {
			//LoginID: user_id, //操作用户
			MainBarCode: MainBarCode,
			BarCode: BarCode,
			//TMGS: TMGS
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false,
		success: function(resdata) {
			if(resdata.status == 1) {
				mui.alert(resdata.message);
				mui("#BarCode")[0].focus();
				$("#BarCode").val("");
				playerAudio("NG");
				return;
			} else {
				playerAudio("OK");
				$('#girdBarCode').datagrid('loadData', resdata.data.tbData);
				$("#ZTMGS").val(resdata.data.shuliang);
				mui("#BarCode")[0].focus();
				$("#BarCode").val("");
				ZTMGS = resdata.data.shuliang;
				$("#ZTMGS").val(ZTMGS);
				mui.toast(resdata.message);
			}
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息 
			return "";
		}
	});
}

//扫描库位
function ScanfStorehouse() {

	Storehouse = document.getElementById('Storehouse').value;
	MainBarCode = document.getElementById('MainBarCode').value;
	
	if(MainBarCode == "") {
		alert("请扫描主条码!");
		mui("#MainBarCode")[0].focus();
		playerAudio("NG");
		return;
	}
	if(Storehouse == "") {
		alert("请扫描库位!");
		mui("#Storehouse")[0].focus();
		playerAudio("NG");
		return;
	}
	
	billDate = GetSysDateTime();
	billNo = GetMaxBillNO(billType, billDate);

	$.ajax({
		url: app.API_URL_HEADER + '/MainBarCode/ScanfStorehouse',
		data: {
			LoginID: app.userid(), //操作用户
			Storehouse: Storehouse,
			MainBarCode: MainBarCode,
			billDate: billDate,
			billNo: billNo,
			billType: billType
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false,
		success: function(resdata) {
			if(resdata.status == 1) {
				$("#Storehouse").val("");
				mui("#Storehouse")[0].focus();
				mui.alert(resdata.message);
				playerAudio("NG");
				return;
			} else {
				playerAudio("OK");
				$("#MainBarCode").val(""); //主条码
				$("#BarCode").val(""); //条码
				$("#TMGS").val(""); //条码个数
				$("#ZTMGS").val(""); //总条码个数
				if($("#checkdefault").prop("checked") == false)
					$("#Storehouse").val(""); //数据源
				mui("#MainBarCode")[0].focus();
				$('#girdBarCode').datagrid('loadData', {
					total: 0,
					rows: []
				});
				tempCount = tempCount + 1;
				mui.toast(resdata.message);
			}
			$("#MainCodeTotal").text("条码个数:" + resdata.data.Count + ",总数量:" + resdata.data.Total + ",已入库主条码个数:" + tempCount);
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息 
			return "";
		}
	});
}