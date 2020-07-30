/*
作者：黄邦文
时间：2018-09-04
描述：散料盘点
 */
mui.init();
var IsCreateMain = "0";
var XuHao = 1;
$(function() {

	//自动产生散料盘点单号
	$.ajax({
		url: app.API_URL_HEADER + '/PanDian/GetMaxBillNo',
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			$('#txtPDDanHao').val(resdata.data);
			playerAudio("OK");
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
			playerAudio("NG");
		}
	});
	$('#txtBarcode').focus();
	$('#txtBarcode').keydown(function(e) {
		if(e.keyCode != 13) return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		var barCode = this.value.trim().toUpperCase();
		if(barCode.trim() == "") {
			playerAudio("NG");
			//			plus.nativeUI.toast("条码输入不能为空",{verticalAlign:'center'});
			alert("条码输入不能为空", {
				verticalAlign: 'center'
			});
			
			return false;
		}

		$.ajax({
			url: app.API_URL_HEADER + '/PanDian/GetSanLiaoTiaoMaMSG',
			data: {
				TiaoMa: barCode
			},
			dataType: "json",
			type: "post",
			success: function(res) {
				console.log(JSON.stringify(res));
				if(res.status == 0) {
					var dt1 = $.parseJSON(res.data);
					if(dt1.length > 0) {
						$('#txtWLBM').val(dt1[0]["WLBM"]);
						$('#txtCKBM').val(dt1[0]["CKBM"]);
						$('#txtKWBM').val(dt1[0]["KWBM"]);
						$('#txtKHBM').val(dt1[0]["KHBM"]);
						$('#txtZMSL').val(dt1[0]["ZMSL"]);
						$('#txtPDSL').val(dt1[0]["ZMSL"]);
						document.getElementById("txtPDSL").focus();
        			    document.getElementById("txtPDSL").select();
						playerAudio("OK");
					} else {
						playerAudio("NG");
						//mui.toast('此条码不存在或者已锁定！');
						alert("此条码不存在或者已锁定！");
						$('#txtBarcode').focus().val('');
					}
				}
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
				playerAudio("NG");
			}
		});
	});

	//更新盘点数据
	$('#txtPDSL').keydown(function(e) {
		if(e.keyCode != 13) return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		//更新初盘数据
		UpdatePD();
	});

	$('#btn_ok').click(function() {
		//更新初盘数据
		UpdatePD();
	});

	$('#btn_clear').click(function() {
		ClearData();
	});
});

//更新盘点数据
function UpdatePD() {
	var pddh = $('#txtPDDanHao').val();
	var barcode = $('#txtBarcode').val();
	var pdsl = $('#txtPDSL').val();
	if(pdsl.trim() == "") {
		playerAudio("NG");
		alert("复盘数量输入不能为空");
		return;
	}
	if(pddh == '') {
		playerAudio("NG");
		alert('请选择要复盘的盘单号！');
		return;
	}
	if(barcode == '') {
		playerAudio("NG");
		alert('请扫描条码！');
		return; 
	}
	//var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var user_id = app.userid;//currentSession.user_id;
	
	$.ajax({
		url: app.API_URL_HEADER + '/PanDian/UpdateSanPan',
		data: {
			PDDH: pddh,
			XuHao: XuHao,
			IsCreateMain: IsCreateMain,
			BarCode: barcode,
			PDSL: pdsl,
			LoginUser: user_id
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			IsCreateMain = "1";
			XuHao++;
			$('#txtBarcode').focus().val('');
			ClearData();
			mui.toast("盘点成功！");
			playerAudio("OK");
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
			playerAudio("NG");
		}
	});
}

function ClearData() {
	$('#txtBarcode').val('');
	$('#txtWLBM').val('');
	$('#txtCKBM').val('');
	$('#txtKWBM').val('');
	$('#txtKHBM').val('');
	$('#txtZMSL').val('');
	$('#txtPDSL').val('0');
}