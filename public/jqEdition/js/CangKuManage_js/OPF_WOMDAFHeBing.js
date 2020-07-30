/*
作者：庄卓杰
时间：2019-06-11
描述：委外单合并
 */
var billNo = "";//单据号
var PartNo = ""; //产品编码

mui.plusReady(function() {
	mui("#txtBillNo")[0].focus();
	//add by HCW 20200318
	$('#dgCHK').datagrid({
		height: $(window).height() - $("#infos").height() - 75
	});
});
$(function() { 
	$('#dgCHK').datagrid({
		height: $(window).height() - $("#infos").height() - 75,
		rowStyler: function(index, row) { //自定义行样式
		},
		onSelect: function(rowIndex, rowData) {},
		onLoadSuccess: function() {
			$('#dgCHK').datagrid('selectAll');
		}
	});
})

document.getElementById('txtBillNo').addEventListener('keydown', function(e) {
	if (event.keyCode != 13)
		return;
	billNo = mui("#txtBillNo")[0].value;
	var num = $('#dgCHK').datagrid('getData').rows.length;
	if (billNo.trim() == "") {
		playerAudio("NG");
		alert("请扫描委外单号！");
		mui('#txtBillNo')[0].focus();
		return;
	}
	if (billNo.indexOf("CK") == -1) {
		playerAudio("NG");
		alert("该单号不是委外单号！");
		mui('#txtBillNo')[0].focus();
		return;
	}
	// 获取第一个委外单号和判断是否存在委外单

	for (var i = 0; i < num; i++) {
		if (billNo == $('#dgCHK').datagrid('getData').rows[i].DAF021) {
			playerAudio("NG");
			alert("该单号已存在！");
			mui('#txtBillNo')[0].focus();
			return;
		}
	}

	$.ajax({
		url: app.API_URL_HEADER + "/OPF_WOMDAFHeBing/getOPF_WOMDAFInfo",
		data: {
			PartNo: PartNo,
			CKBillNo: billNo
		},
		DataType: "json",
		type: "post",
		async: false,
		success: function(data) {
			if (data.status != 0) {
				playerAudio("NG");
				mui.alert(data.message, "", "", function() {
					mui("#txtBillNo")[0].focus();
					mui("#txtBillNo")[0].select();
				});
				return;
			} else {
				$('#dgCHK').datagrid('appendRow', {
					DAF021: data.data.DAF021,
					DAF023: data.data.DAF023,
					DAF002: data.data.DAF002
				});
				PartNo = data.data.DAF023;
				mui("#txtBillNo")[0].focus();
				mui("#txtBillNo")[0].select();
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
});

document.getElementById('btnHeBing').addEventListener('click', function(e) {
	var num = $('#dgCHK').datagrid('getData').rows.length;
	if (num < 2) {
		playerAudio("NG");
		alert("没有需要合并的委外单");
		mui('#txtBillNo')[0].focus();
		return;
	}
	var DAF021 = $('#dgCHK').datagrid('getData').rows[0].DAF021;
	var DAF002 = $('#dgCHK').datagrid('getData').rows[0].DAF002;
	var WOMDAFdata = '';
	for (var i = 0; i < num; i++) {
		if (i == 0)
			WOMDAFdata += $('#dgCHK').datagrid('getData').rows[i].DAF021;
		else
			WOMDAFdata += "," + $('#dgCHK').datagrid('getData').rows[i].DAF021;
	}
	$.ajax({
		url: app.API_URL_HEADER + "/OPF_WOMDAFHeBing/heBingOPF_WOMDAF",
		data: {
			WOMDAFdata: WOMDAFdata,
		},
		DataType: "json",
		type: "post",
		async: false,
		success: function(data) {
			if (data.status != 0) {
				playerAudio("NG");
				mui.alert(data.message, "", "", function() {
					mui("#txtBillNo")[0].focus();
					mui("#txtBillNo")[0].select();
				});
				return;
			} else {
				playerAudio("OK");
				mui.toast("合并成功！");
				$("#dgCHK").datagrid("loadData", {
					total: 0,
					rows: []
				});
				mui("#txtBillNo")[0].focus();
				mui("#txtBillNo")[0].select();
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
});

document.getElementById('btnDelete').addEventListener('click', function(e) {
	playerAudio("OK");
	mui.toast("清除成功！");
	$("#dgCHK").datagrid("loadData", {
		total: 0,
		rows: []
	});
	PartNo = "";
	mui("#txtBillNo")[0].focus();
	mui("#txtBillNo")[0].select();
});
