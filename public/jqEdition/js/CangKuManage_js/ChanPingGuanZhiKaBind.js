/*
作者：黄邦文
时间：2019-05-21
描述：产品管制卡绑定
*/
mui.init();
var PidPrefix = "";
var BidPrefix = "";

$(function() {
	// $('#barinfo').height($(window).height() - $("#form").height() - 130);
	$('#dgGrid').datagrid({
		height: $(window).height() - $("#form").height() - $("#divBtn").height()
	});

	getBarcodeRule();
	$('#txtCPBarcode').focus();
	$('#txtCPBarcode').keydown(function(e) {
		if(e.keyCode != 13) return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		RefleshData();
	});

	$('#txtGZKHao').keydown(function(e) {
		if(e.keyCode != 13) return;
		if(mui("#chkbox")[0].checked == true) {
			FreeBindData();
		} else {
			if($('#txtGZKHao').val().indexOf($('#txtProductCode').val()) < 0) {
				playerAudio('NG');
				mui.alert("管制卡与产品编号不匹配");
				$('#txtGZKHao').val('').focus();
			} else {
				$.ajax({
					url: app.API_URL_HEADER + '/ChanPingGuanZhiKaBind/GetGZKInfo',
					data: {
						GZKH: $('#txtGZKHao').val()
					},
					dataType: "json",
					type: "post",
					async: false,
					success: function(res) {
						console.log(JSON.stringify(res));
						if(res.status == 0) {
							$("#txtGZKTotal").val(res.data.ZongShu); //总数
							$("#txtGZKPackQty").val(res.data.YiBindShu); //已绑定
							$("#txtGZKShengYu").val(res.data.ShengYuShu); //剩余数
							CalcuteGZKShengYu();
							//$("#txtGZKHao").focus();
							playerAudio("OK");
						} else {
							$('#txtGZKHao').val('').focus();
							playerAudio("NG");
						}
					},
					error: function(xhr, type, errorThrown) {
						// resDZRL = 0;
						alert("获取数据异常：" + JSON.stringify(errorThrown));
						$('#txtGZKHao').val('').focus();
						playerAudio("NG");
					}
				});
				//$('#txtZRSL').focus();
			}
		}
	});

	//装入数量回车后进行绑定
	$('#txtZRSL').keydown(function(e) {
		if(e.keyCode != 13) return;
		BindData();
	});
	//管制卡计算剩余数量
	$('#txtGZKTotal').change(function() {
		CalcuteGZKShengYu();
	});

	$('#btn_clear').click(function() {
		ClearData();
	});
});

//计算管制卡的剩余数量
function CalcuteGZKShengYu() {
	var GZKTotal = $("#txtGZKTotal").val(); //管制卡数量
	var GZKPackQty = $("#txtGZKPackQty").val(); //已绑定数量
	if(GZKTotal == "") GZKTotal = 0;
	if(GZKPackQty == "") GZKPackQty = 0;
	$("#txtGZKShengYu").val(GZKTotal - GZKPackQty); //剩余数量
	if(parseInt($("#txtGZKShengYu").val())  > parseInt($("#txtCanPacking").val())) {
		$("#txtZRSL").val($("#txtCanPacking").val());
	} else {
		$("#txtZRSL").val($("#txtGZKShengYu").val());
	}
	if($("#txtGZKShengYu").val()==0 && GZKTotal!=0)
	{
		playerAudio("NG");
		mui.toast('管制卡已绑定完成！');
		$("#txtGZKTotal").val('0');
		$("#txtGZKPackQty").val('0');
		$("#txtGZKHao").val('').focus();
		return;
	}
	
	if(GZKTotal == 0) {
		//playerAudio("NG");
		mui.toast('管制卡总数不能为0');
		$("#txtGZKTotal").focus().select();
	} else {
		$("#txtZRSL").focus().select();
	}

}

//刷新数据
function RefleshData() {
	var barCode = $('#txtCPBarcode').val().trim().toUpperCase();
	if(barCode.trim() == "") {
		playerAudio("NG");
		alert("条码输入不能为空", {
			verticalAlign: 'center'
		});
		return false;
	}
	if(barCode.indexOf(PidPrefix) < 0) {
		playerAudio("NG");
		mui.alert("产品条码不合规则");
		return;
	}

	$.ajax({
		url: app.API_URL_HEADER + '/ChanPingGuanZhiKaBind/GetBarcodeMSG',
		data: {
			barCode: barCode
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(res) {
			console.log(JSON.stringify(res));
			if(res.status == 0) {
				if(res.data.CanPacking > 0) {
					$('#dgGrid').datagrid('loadData', res.data.tbList);
					$("#txtProductCode").val(res.data.ProductCode); //产品编码
					$("#txtStdPacking").val(res.data.StdPacking); //标准量
					$("#txtCanPacking").val(res.data.CanPacking); //可捆包量
					//$("#txtGZKPackQty").val(res.data.BindQty); //可捆包量
					//CalcuteGZKShengYu();
					$("#txtGZKHao").focus();
					playerAudio("OK");
				} else {
					mui.toast('该标签已装满，请选择下一标签!');
					playerAudio("NG");
					$('#txtCPBarcode').val('').focus();					
				}
			} else {
				// resDZRL = 0;
				// $('#barinfo').val(res.message);
				playerAudio("NG");
				alert(res.message);
				$('#txtCPBarcode').val('').focus();
				
			}
		},
		error: function(xhr, type, errorThrown) {
			// resDZRL = 0;
			alert("获取数据异常：" + JSON.stringify(errorThrown));
			$('#txtCPBarcode').val('').focus();
			playerAudio("NG");
		}
	});
}

//绑定数据
function BindData() {
	var CPBarcode = $('#txtCPBarcode').val();
	var GZKBarcode = $('#txtGZKHao').val();
	var ZRSL = $('#txtZRSL').val();
	var TotalSL = $('#txtGZKTotal').val();
	if(CPBarcode.trim() == "") {
		playerAudio("NG");
		alert("请扫描产品标签");
		$("#txtCPBarcode").focus();
		return;
	}
	if(GZKBarcode == '') {
		playerAudio("NG");
		alert('请扫描管制卡号！');
		$("#txtGZKHao").focus();
		return;
	}
	if(ZRSL == '' || ZRSL == 0) {
		playerAudio("NG");
		alert('装入数量不能为空和0！');
		$("#txtZRSL").focus();
		return;
	}
	if(TotalSL == '' || TotalSL == 0) {
		playerAudio("NG");
		alert('管制卡总数不能为空和0！');
		$("#txtZRSL").focus();
		return;
	}
	resDZRL = $("#txtCanPacking").val();
	if(Number(ZRSL) > Number(resDZRL)) {
		playerAudio("NG");
		alert('装入数量:' + ZRSL + '不可大于待装入数量' + resDZRL + '！');
		$("#txtZRSL").select();
		return;
	}

	$.ajax({
		url: app.API_URL_HEADER + '/ChanPingGuanZhiKaBind/BindData',
		data: {
			CPBarcode: CPBarcode,
			GZKBarcode: GZKBarcode,
			ZRSL: ZRSL,
			TotalSL:TotalSL,
			LoginUser: app.userid
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(res) {
			if(res.status == 0) {
				console.log(JSON.stringify(res));
				RefleshData();
				//可装入数=装入数
				if(resDZRL == ZRSL) {
					ClearData();
				}
				$("#txtGZKHao").val('');
				$("#txtZRSL").val('');
				playerAudio("OK");
			} else {
				mui.toast(res.message);
				$("#txtZRSL").select();
				playerAudio("NG");
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
			$("#txtZRSL").select();
			playerAudio("NG");
		}
	});
}

/* 获取条码生成规则 */
function getBarcodeRule() {
	$.ajax({
		url: app.API_URL_HEADER + '/PackingBoxBind/GetRule',
		data: "",
		datatype: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 1) {
				mui.alert(resdata.message);
				return;
			} else {
				PidPrefix = resdata.data.PidPrefix;
				BidPrefix = resdata.data.BidPrefix;
			}
		}
	})
}

//解绑管制卡数据
function FreeBindData() {
	var CPBarcode = $('#txtCPBarcode').val();
	var GZKBarcode = $('#txtGZKHao').val();
	var ZRSL = $('#txtZRSL').val();
	if(CPBarcode.trim() == "") {
		playerAudio("NG");
		alert("请扫描产品标签");
		$("#txtCPBarcode").focus();
		return;
	}
	if(GZKBarcode == '') {
		playerAudio("NG");
		alert('请扫描管制卡号！');
		$("#txtGZKHao").focus();
		return;
	}
	$.ajax({
		url: app.API_URL_HEADER + '/ChanPingGuanZhiKaBind/FreeBindData',
		data: {
			CPBarcode: CPBarcode,
			GZKBarcode: GZKBarcode,
			ZRSL: ZRSL
		},
		dataType: "json",
		type: "post",
		success: function(res) {
			if(res.status == 0) {
				console.log(JSON.stringify(res));
				// mui("#chkbox")[0].checked = false;
				RefleshData();
				$("#txtGZKHao").val('');
				$("#txtZRSL").val('');
				playerAudio("OK");
			} else {
				mui.toast(res.message);
				$("#txtGZKHao").select();
				playerAudio("NG");
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
			$("#txtGZKHao").select();
			playerAudio("NG");
		}
	});
}

function ClearData() {
	$("#form input").val("");
	$('#dgGrid').datagrid('loadData', {
		total: 0,
		rows: []
	});
	$("#chkbox").attr("checked", false);
	$('#txtCPBarcode').val('').focus();
}