/*
作者：庄卓杰
时间：2019-02-21
描述：送修不良项录入
 */
mui.init();
var Total = 0;
mui.plusReady(function(e) {
	var self = plus.webview.currentWebview();
	var curSXTiaoMa = self.extras.curSXTiaoMa;
	var curGXHao = self.extras.curGXHao;
	var curGXMC = self.extras.curGXMC;
	$("#txtSXTiaoMa").val(curSXTiaoMa);
	$("#txtGongXuID").val(curGXHao);
	$("#txtGongXuMC").val(curGXMC);
	InitPage();
});

mui.init({
	beforeback: function() {
		BackSongXiu();
		return true;
	}
});

$(function() {
	//扫描管制卡号
	InitPage();

	$("#btnReturn").click(function() {
		mui.back();
	});

})

//返回送修模块
function BackSongXiu(){
	var arr = $('span');
		var spanMsg = '';
		for(i = 0; i < arr.length; i++) {
			if(arr[i].id.substring(0, 4) == "span")
				spanMsg = spanMsg + arr[i].id.substring(4) + '|' + $("#btn" + arr[i].id.substring(4)).text() + '|' + arr[i].innerHTML + ";";
		}
		var main = plus.webview.getWebviewById('SongXiuHtml');
		mui.fire(main, "pageflowrefresh", {
			BLPShu: $('#txtBLPShu').val(),
			SpanMsg:spanMsg
		});
}

//初始化界面
function InitPage() {
	$.ajax({
		url: app.API_URL_HEADER + '/SongXiu/GetNGInfoBySX',
		data: {
			GongXuID: $("#txtGongXuID").val()
		},
		dataType: "json",
		type: "get",
		success: function(resdata) {
			if(resdata.status == 0) {
				console.log(JSON.stringify(resdata));
				dtBLX = $.parseJSON(resdata.data.BLX);
				$("#txtBLPShu").val('0');
				if(dtBLX.length > 0) {
					CreateNGButton(dtBLX);
				}
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

function CreateNGButton(dtBLX) {
	var btn = "";
	for(i = 0; i < dtBLX.length; i++) {
		btn = btn + "<button id='btn" + dtBLX[i]["BAB001"] + "' class='mui-btn-primary' style='width: 110px;' onclick=btnClick('" + dtBLX[i]["BAB001"] + "')>" + dtBLX[i]["BAB002"] + " <span id='span" + dtBLX[i]["BAB001"] + "' class='mui-badge-warning'>0</span></button>";
	}
	$("#div_btn")[0].innerHTML = btn;
	$("span").addClass("mui-badge");
};

function btnClick(id) {
	var span = '#span' + id;
	var bt = '#btn' + id;
	var NGShu = $(span).text();
	if($("#chkIsCancel").prop("checked") == false) {
		$("#txtBLPShu").val(parseInt($("#txtBLPShu").val()) + 1);
		$(span).text(parseInt($(span).text()) + 1);
	} else if($(span).text() > 0) {
		$("#txtBLPShu").val(parseInt($("#txtBLPShu").val()) - 1);
		$(span).text(parseInt($(span).text()) - 1);
	}
};

//保存不良信息
//function SaveNGMsg() {
//	var arr = $('span');
//	var spanMsg = '';
//	for(i = 0; i < arr.length; i++) {
//		if(arr[i].id.substring(0, 4) == "span")
//			spanMsg = spanMsg + arr[i].id.substring(4) + '|' + $("#btn" + arr[i].id.substring(4)).text() + '|' + arr[i].innerHTML + ";";
//	}
//	console.log(spanMsg);
//	$.ajax({
//		url: app.API_URL_HEADER + '/SongXiu/SaveNGMsg',
//		data: {
//			SXTiaoMa: $("#txtSXTiaoMa").val(),
//			GongXuID: $("#txtGongXuID").val(),
//			GongXuMC: $("#txtGongXuMC").val(),
//			SpanMsg: spanMsg,
//			UserID: app.userid,
//			BLPShu: $("#txtBLPShu").val()
//		},
//		dataType: "json",
//		type: "post",
//		success: function(resdata) {
//			if(resdata.status == 0) {
//				playerAudio("OK");
//				mui.toast('不良项提交成功！');
//			} else {
//				playerAudio("NG");
//				mui.toast('不良项提交失败！');
//			}
//		},
//		error: function(xhr, type, errorThrown) {
//			alert("获取数据异常：" + JSON.stringify(errorThrown));
//			//			return false;
//		}
//	});
//}