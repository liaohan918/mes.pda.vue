var userid;
var FDA001 = "";
mui.init();
mui.plusReady(function() {
//	app.init();
    var self = plus.webview.currentWebview();
	currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	userid = currentSession.user_id;
//	var self = plus.webview.currentWebview();
$('#info').height($(window).height()-190);
	
	
});

$(function(){
	initData();
	
	$("#materialBarcode").keydown(function(e){
		if(e.keyCode != "13")
		    return;
		getMaterialBarcode();
	});
	
	$("#reftMaterialBarcode").keydown(function(e){
		if(e.keyCode != "13")
		    return;
		reftMaterialBarcodeKeyDown();
	});
	
	$("#rightMaterialBarcode").keydown(function(e){
		if(e.keyCode != "13")
		    return;
		rightMaterialBarcodeKeyDown();
	})
});

//初始化，获取默认数据
function initData(){
	var result = AjaxOperation({}, "站位核对", true, "/SMTFDAChange/InitData");
		if(!result.state){
			playerAudio('NG');
			return;
		}
	$("#FDA001").val(result.data.data);	
	$("#info").val(result.data.message);
	$("#materialBarcode").focus();
}

//扫描物料条码，返回其左右料盘的条码
var L_BND014 = "";
var R_BND014 = "";
function getMaterialBarcode(){
	var materialBarcode = $("#materialBarcode").val();
	if(materialBarcode == ""){
		playerAudio("NG");
		alert("物料条码不能为空！");
		$("#materialBarcode").focus();
		return;
	}
	var data = {
			materialBarcode : materialBarcode
		};
	var result = AjaxOperation(data, "站位核对", true, "/SMTFDAChange/GetMaterialBarcode");
		if(!result.state){
			playerAudio('NG');
			return;
		}
	$("#reftMaterialBarcode").focus();
	playerAudio('OK');
	L_BND014 = result.data.data.L;
	R_BND014 = result.data.data.R;
};

function reftMaterialBarcodeKeyDown(){
	var reftMaterialBarcode = $("#reftMaterialBarcode").val();
	if(reftMaterialBarcode == ""){
		playerAudio("NG");
		alert("左盘条码不能为空！");
		$("#reftMaterialBarcode").focus();
		return;
	}
	if(reftMaterialBarcode != L_BND014){
		playerAudio("NG");
		alert("该条码不是条码:" + $("#materialBarcode").val() + "的左盘条码！");
		$("#reftMaterialBarcode").select();
		return;
	}
	playerAudio("OK");
	$("#rightMaterialBarcode").focus();
	
};

function rightMaterialBarcodeKeyDown(){
	var rightMaterialBarcode = $("#rightMaterialBarcode").val();
	if(rightMaterialBarcode == ""){
		playerAudio("NG");
		alert("右盘条码不能为空！");
		$("#rightMaterialBarcode").focus();
		return;
	}
	if(rightMaterialBarcode != R_BND014){
//		alert("R_BND014：" + R_BND014);
		playerAudio("NG");
		alert("该条码不是条码:" + $("#materialBarcode").val() + "的右盘条码！");
		$("#rightMaterialBarcode").select();
		return;
	}
	var data = {
			materialBarcode : $("#materialBarcode").val()
		};
	var result = AjaxOperation(data, "站位核对", false, "/SMTFDAChange/StationCheck");
		if(!result.state){
			playerAudio('NG');
			alert(result.data.message);
			return;
		}
	clearData();
	playerAudio('OK');
	mui.toast("站位核对成功！");
};

function clearData(){
	$("#rightMaterialBarcode").val('');
	$("#reftMaterialBarcode").val('');
	$("#materialBarcode").val('').focus();
}

