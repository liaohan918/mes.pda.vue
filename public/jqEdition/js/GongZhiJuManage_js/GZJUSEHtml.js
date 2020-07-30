/**
 * 作者：G98138 黎锋
 * 日期：2018-09-07
 * 描述：工治具领用
 */

var GZJTypePicker;//工治具类型
var WOMHaoPicker;//指令单号

$(function(){
	//默认工治具类型
	$("#gzjType").val('1-钢网');
	$('#Barcode').focus();
	//获取工治具类型
	getGZJType();
	
	//工治具类型点选
	$("#gzjType").click(function(){
		GZJTypePicker.show(function(items) {
			$("#gzjType").val(items[0]["text"]);
			getGZJList();
			FindScaned();
			$('#Barcode').focus();
		});
	});
	
	//获取所有在生产未校验钢网的指令
	getWOMDAA();
	
	//指令类型点选
	$("#DAA001").click(function(){
		showItem();
		$('#Barcode').focus();
	});
	
	//工治具条码回车
	$("#Barcode").keydown(function(e){
		if(e.keyCode != "13")
		    return;
		ScanBarCode_USE();
	});
});

//指令单号（原工单号）点选处理
function getWOMDAA() {
	WOMHaoPicker = new mui.PopPicker(); //声明对象
	$('#Barcode').val("");
	$.ajax({
		url: app.API_URL_HEADER + "/GZJUSE/GetWOMDAA",
//		      url:"http://localhost:27611/api/GZJUSE/GetWOMDAA",
		data: {},
		DataType: "json",
		Type: "post",
		async: false,
		success: function(data) {
			console.log(JSON.stringify(data));
			if(data.status!=0){
				alert(data.message);
				return;
			}
			var dt = data.data;
			WOMHaoPicker.setData(dt); //设置数据源
			showItem();
		},
		error: function(xhr, type, errorThrow) {
			alert("获取数据异常：" + JSON.stringify(errorThrow));
			return false;
		}
	});
};

//工治具类型
function getGZJType() {
	GZJTypePicker = new mui.PopPicker(); //声明对象
	var responseData = AjaxOperation({}, "获取工治具类型", true, "/GZJUSE/GetGZJType");
	if(!responseData.state) {
		return;
	}
	console.log(JSON.stringify(responseData));
	var dt = responseData.data.data;
	GZJTypePicker.setData(dt); //设置数据源
};

//工单选择
function showItem(){
	WOMHaoPicker.show(function(items) {
		var arrs = items[0]["text"].split("/"); //截取工单
		$("#DAA001").val(arrs[0]);
		$("#lineId").val(arrs[1]);
		getGZJList();
		FindScaned();
	    
	});
}

//根据指令单号、工治具类型，获得工治具列表
function getGZJList() {
	$.ajax({
		url: app.API_URL_HEADER + "/GZJUSE/GetGZJList",
//		url:"http://localhost:27611/api/GZJUSE/GetGZJList",
		data: {
			DAA001: $('#DAA001').val(),
			GZJType: $('#gzjType').val().substring(0, 1),
			
		},
		DataType: "json",
		type: "post",
		async: false,
		success: function(data) {
			playerAudio('OK');
			console.log(JSON.stringify(data));
			$("#tb1").datagrid("loadData", []);
			$("#tb1").datagrid("loadData", data.data);
		},
		error: function(xhr, type, errorThrow) {
			alert("获取数据异常：" + JSON.stringify(errorThrow));
		}
	});
};

/**
 * 扫描工治具条码处理
 */
function ScanBarCode_USE() {
	if($("#Barcode").val() == "") {
		playerAudio("NG");
		alert("请先扫描条码！");
		return false;
	}
	if($("#DAA001").val() == "") {
		playerAudio("NG");
		alert("请先选择指令！");
		return false;
	}
	
	//用户ID
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var user_id = currentSession.user_id;
	var checkCancel = $('#checkCancel').prop("checked") == true ? "1" : "0";
	//      var user_id = "admin-test";
	$.ajax({
			url: app.API_URL_HEADER + "/GZJUSE/ScanBarCode_USE",
//		    url:"http://localhost:27611/api/GZJUSE/ScanBarCode_USE",
		data: {
			GZJType: $("#gzjType").val().substr(0, 1), //工治具类型
			DAA001: $("#DAA001").val(), //指令单号
			lineId: $("#lineId").val(), //线别
			GZJ001: $("#Barcode").val(), //工治具条码
			checkCancel : checkCancel,
			user_id: user_id
		},
		DataType: "json",
		type: "post",
		async: false,
		success: function(data) {
			console.log(JSON.stringify(data));
			if(data.status == 1) {
				$("#Barcode").val('').focus();
				playerAudio("NG");
				alert(data.message);
				
			}else{
				playerAudio("OK");
				document.getElementById("Barcode").select();
				mui.toast(data.message);
				if(checkCancel == "0"){
					$("#tb2").datagrid("appendRow", {
						MZJ003: data.data[0]["MZJ003"],
						MZJ001: data.data[0]["MZJ001"]
					});
				}else{
					delRow($('#Barcode').val());
				}
			}
		},
		error: function(xhr, type, errorThrow) {
			alert("获取数据异常：" + JSON.stringify(errorThrow));
		}
	});
	
};

/**
 * 找一遍GZJUSE表，将已扫描的记录展示出来
 */
function FindScaned() {
	$.ajax({
		url: app.API_URL_HEADER + "/GZJUSE/FindScaned",
//		          url:"http://localhost:27611/api/GZJUSE/FindScaned",
		data: {
			GZJType: $("#gzjType").val().substr(0, 1), //工治具类型
			DAA001: $("#DAA001").val(), //指令单号
			lineId: $("#lineId").val(), //线别
		},
		DataType: "json",
		type: "post",
		async: false,
		success: function(data) {
			console.log(JSON.stringify(data));
			if(data.status == 1) {
				alert(data.message);
				return false;
			}
			$("#tb2").datagrid("loadData", data.data);
//			$("#dgScanList-sum")[0].innerHTML = $("#tb2").datagrid("getRows").length;
		},
		error: function(xhr, type, errorThrow) {
			alert("获取数据异常：" + JSON.stringify(errorThrow));
		}
	});
};

//列表删除行
function delRow(MZJ001){
	var rows = $('#tb2').datagrid("getRows");
	var index = -1;
	for (var i = 0; i < rows.length; i++) {
		if(MZJ001 == rows[i]['MZJ001'])
			index = i;
	}
	if(index != -1){
		$('#tb2').datagrid('deleteRow', index);  
	}
}