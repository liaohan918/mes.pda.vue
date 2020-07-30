//
//	作者：dzp
//	时间：2019-05-15
//	描述：主条码绑定
//
var billDate = ""; //单据日期
var billNo = ""; //条码品质，默认以扫描的第一个条码为准
var billType = "1202"; //单据类型
var useMainCode = "N"
var mainCodeprefix = ""

//add by HCW 20200318
mui.plusReady(function() {
	$('#bindGrid').height($(window).height() -
					$("#row001").height() -
					$("#row002").height() -
					$("#row003").height() - 
					$("#row004").height() -
					$("#maincodeInfo").height() - 45
					);
});

//初始化
$(function() {
	mui("#MainBarCode")[0].focus();
	DataInit();
})

var userPicker = new mui.PopPicker();
$(function() {
	
	$.ajax({
		url: app.API_URL_HEADER + '/MainBarCodeBind/Gethouse',
		data: {}, 
		dataType: "json",
		type: "post",
		success: function(resdata) 
		{
			
			dt = $.parseJSON(resdata.data);
			userPicker.setData(dt);
		},
		error: function(xhr, type, errorThrown) 
		{
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});	
	
		
		$('#WareHouse').val("元器件仓");
		$('#WareHouseID').val("53");
		$('#WareHouse').click(function() {
		userPicker.show(function(items) {
			$('#WareHouse').val(items[0]['text']);
			$('#WareHouseID').val(items[0]['value']);
			//GetData(items[0]['value']);
			$('#MainBarCode').val("");
			$('#MainKW').val("");
			$('#MMBarCode').val("");
			$('#bindGrid').datagrid('loadData', { total: 0, rows: [] });
		});
	});
});



function DataInit() {
	billDate = GetSysDateTime();
	billNo = GetMaxBillNO(billType, billDate);
	
	$.ajax({
		url: app.API_URL_HEADER + '/MainBarCodeBind/GetMainCodeRule',
		data: "",
		datatype: "json",
		type: "post",
		success: function(resdata) {
			if (resdata.status == 1) {
				mui.alert(resdata.message);
				return;
			} else { 
				useMainCode = resdata.data.UseMainCode;
				mainCodeprefix = resdata.data.MainCodePrefix;
			}
		}
	}) 
}
/*******************************************/
//MainBarCodeBind.html
/*******************************************/
/*
获取主条码的信息
*/
function CheckMainBarCode(mainbarcode) {
	$("#MainKW").val("");
				console.log(useMainCode);
				console.log(mainCodeprefix);
	if (useMainCode == "N") {
		mui.alert("未启用主条码功能");
		mui("#MainBarCode")[0].focus();
		$('#MainBarCode').val("");
		playerAudio("NG");
		return;
	}
	if (mainCodeprefix.length > 0 && mainbarcode.indexOf(mainCodeprefix) < 0) {
		mui.alert("主条码规则不符合规范,请确认");
		mui("#MainBarCode")[0].focus();
		$('#MainBarCode').val("");
		playerAudio("NG");
		return;
	}
	//1.检查此系统是否可以使用主条码
	//2.检查录入的物料是否属于主条码的格式
	$.ajax({
		url: app.API_URL_HEADER + '/MainBarCodeBind/getMainBarCode',
		data: {
			MainBarCode: mainbarcode,
			WareHouse : $('#WareHouseID').val()
		},
		datatype: "json",
		type: "post",
		success: function(resdata) {
			if (resdata.status == 1) {
				mui.alert(resdata.message, function() {
					mui("#MainBarCode")[0].focus();
					$("#MainBarCode").val("");
					$('#bindGrid').datagrid('loadData', { total: 0, rows: [] });
					playerAudio("NG");
				});
				return;
			} else {
				$('#bindGrid').datagrid('loadData', resdata.data.tbList);
				$("#MMBarCode").val("");
				$("#MMBarCode")[0].focus();
				playerAudio("OK");
				UpdateMainKW(resdata);
				$("#MainCodeTotal").text("条码个数:" + resdata.data.Count + ",总数量:" + resdata.data.Total);
			}
		}
	})
}

/*更新主条码的库位信息，如果主条码不是第一次绑定，则获取第一个条码的库位
如果主条码是第一次绑定，应该在绑定后更新库位*/
function UpdateMainKW(resdata) {
	if ($("#MainKW").val() != "")
	{
		return;
	}
		
	var str = JSON.stringify(resdata.data);
	var obj = eval('(' + str + ')');
	if (obj.tbList != null && obj.tbList.length > 0) {
		var kw = obj.tbList[0].DAB003;
		$("#MainKW").val(kw);
	}
}

/*绑定主条码*/
function MainBarCodeBind(mainbarcode, mmbarcode) {
	
	if (mmbarcode == "")
	{
		playerAudio("NG");
		return;
	}
	
//	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
//	console.log(JSON.stringify(currentSession));
//	var user_id = currentSession.user_id;
	  //var user_id = "dzp";
	//1.扫描物料条码,
	//2.绑定主条码,
	//3.主条码的库位与新绑定的条码不同，则执行库位调拨
	//4.返回Json绑定到表格
	$.ajax({
		url: app.API_URL_HEADER + '/MainBarCodeBind/SetMainBarCode',
		data: {
			MainBarCode: mainbarcode,
			MMBarCode: mmbarcode,
			billdate: billDate,
			billno: billNo,
			billtype: billType,
			position: $("#MainKW").val(),
			userid: app.userid(),
			checkdefault: $("#checkdefault").prop("checked") == true ? "Y" : "N",
		    WareHouse : $('#WareHouseID').val()
		},
		datatype: "json",
		type: "post",
		success: function(resdata) {
			if (resdata.status == 1) {
				mui.alert(resdata.message, function() {
					mui("#MMBarCode")[0].focus();
					$("#MMBarCode").val("");
					//mui.toast(resdata.message);
					 playerAudio("NG");
				});
				return;
			} else {
				$('#bindGrid').datagrid('loadData', resdata.data.tbList);
				$("#MMBarCode").val("");
				$("#MMBarCode")[0].focus();
				mui.toast(resdata.message);
				playerAudio("OK");
				UpdateMainKW(resdata);
				$("#MainCodeTotal").text("条码个数:" + resdata.data.Count + ",总数量:" + resdata.data.Total);
			}
		}
	})
}
