/*
作者：黄邦文
时间：2019-02-21
描述：工序报工--不良录入
 */
mui.init();
var Total = 0;
//var oldNGID;
//var oldNGName;

mui.plusReady(function(e) {
	var self = plus.webview.currentWebview();
	var curGZKHao = self.extras.curGZKHao;
	var curGXID = self.extras.curGXID;
	var curGXMC = self.extras.curGXMC;
	$("#txtGuanZhiKaHao").val(curGZKHao);
	$("#txtGongXuID").val(curGXID);
	$("#txtGongXuMC").val(curGXMC);
	InitPage();
});

mui.init({
	beforeback: function() {
		var main = plus.webview.getWebviewById('GongXuBaoGong');
		mui.fire(main, "pageflowrefresh", {
		})
		SaveNGMsg();
		return true;
	}
});

$(function() {
	//扫描管制卡号
	InitPage();

	$("#btnReturn").click(function() {
		var main = plus.webview.getWebviewById('GongXuBaoGongMain');
		mui.fire(main, "pageflowrefresh", {
		});
		SaveNGMsg();
		mui.back();
	});
	
	//扫描
	$('#txtGuanZhiKaHao').keydown(function(event) {
		if(event.keyCode != "13")
			return;
		if($('#txtGuanZhiKaHao').val()=='')
			return;
//		$("#txtGongXuID").val('G005');
//		$("#txtGongXuMC").val('产品绑定');
		InitPage();
	});
	
})

//初始化界面
function InitPage() {
	$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/GetNGInfoByGZK',
		data: {
			GuanZhiKaHao: $("#txtGuanZhiKaHao").val(),
			GongXuID: $("#txtGongXuID").val()
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 0) {
				console.log(JSON.stringify(resdata));
				dtBLX = $.parseJSON(resdata.data.BLX);
				//dtGZK = $.parseJSON(resdata.data.GZK);
//				var row=dtGZK[0];
//				oldNGID=row.QAD015;
//				oldNGName=row.QAD016;
				if(dtBLX.length > 0) {
					CreateNGButton(dtBLX);
//					if(oldNGID!=null){
//						var str=oldNGID.split('|');
//						for(var i=0;i<str.length;i++){
//							if(str[i]=='')
//								continue;
//							btnClick(str[i]);
//						}
//					}
				}
			}
			else{
				playerAudio("NG");
				alert(resdata.message);
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
		btn = btn + "<button id='btn" + dtBLX[i]["BAB001"] + "' style='width: 110px;background:#fff;' onclick=btnClick('" + dtBLX[i]["BAB001"] + "')>" + dtBLX[i]["BAB002"] + "</button>";
	}
	$("#div_btn")[0].innerHTML = btn;
	$("span").addClass("mui-badge");
};

function btnClick(id) {
	var bt = '#btn' + id;
	if($(bt).css('background-color') == 'rgb(0, 0, 255)') {
		$(bt).css({'background-color':'white','color':'black'});
	}
	else{
		$(bt).css({'background-color':'blue','color':'white'});
	}
};
//保存不良信息
function SaveNGMsg() {
	var arr = $('button');
	var NGID = '';//不良项ID
	var NGNAME='';//不良项名称
	for(i = 0; i < arr.length; i++) {
		if($('#'+arr[i].id).css('background-color') == 'rgb(0, 0, 255)'){
			NGID = NGID + arr[i].id.substring(3) + '|';
			NGNAME=NGNAME+$('#'+arr[i].id).text()+'|'
		}
	}
	console.log(NGID);
	console.log(NGNAME);
	$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/SaveNGMsg',
		data: {
			GuanZhiKaHao: $("#txtGuanZhiKaHao").val(),
			GongXuID: $("#txtGongXuID").val(),
			GongXuMC: $("#txtGongXuMC").val(),
			NGID: NGID,
			NGNAME:NGNAME,
			UserID: app.userid,
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
			return false;
		}
	});
}