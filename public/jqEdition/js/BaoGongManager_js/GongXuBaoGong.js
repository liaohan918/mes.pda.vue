/*
作者：黄邦文
时间：2019-02-21
描述：工序报工--选择工序
 */
mui.init();

mui.plusReady(function(e) {
	var self = plus.webview.currentWebview();
	//	var user = self.extras.user;
	//	mui("#txtCurGX")[0].value = user;

});

$(function() {

	var userPicker = new mui.PopPicker();
	//获取工序
	$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/GetGongXu',
		data: {},
		dataType: "json",
		type: "post",
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
	//选择工序
	$('#txtGongXuID').click(function() {
		userPicker.show(function(items) {
			$('#txtGongXuMC').val(items[0]['text']);
			$('#txtGongXuID').val(items[0]['value']);
		});

	});
	var userPicker1 = new mui.PopPicker();
	//获取产线
	$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/GetLines',
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			dt = $.parseJSON(resdata.data);
			var rows = [];
			userPicker1.setData(dt);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
	//选择产线
	$('#txtLineID').click(function() {
		userPicker1.show(function(items) {
			$('#txtLineName').val(items[0]['text']);
			$('#txtLineID').val(items[0]['value']);
			//返回 false 可以阻止选择框的关闭
			//return false;
		});

	});
	//扫描操作人员号
	$('#txtZuoYeRenYuan').keydown(function(event) {
		if(event.keyCode != "13")
			return;
		$.ajax({
			url: app.API_URL_HEADER + '/GongXuBaoGong/GetRenYuan',
			data: {
				RenYuan: $('#txtZuoYeRenYuan').val()
			},
			dataType: "json",
			type: "post",
			success: function(res) {
				console.log(JSON.stringify(res));
				if(res.status == 1) {
					playerAudio('NG');
					mui.toast(res.message);
					$('#txtZuoYeRenYuan').val('').focus();
					return;
				}
				else
				{
					$('#txtSheBeiBianMa').select();
				}
			},
			error: function(xhr, type, errorThrown) {
				playerAudio('NG');
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
		
	})
	
	//扫描设备编码
	$('#txtSheBeiBianMa').keydown(function(event) {
		if(event.keyCode != "13")
			return;
		$.ajax({
			url: app.API_URL_HEADER + '/GongXuBaoGong/GetSheBei',
			data: {
				SheBei: $('#txtSheBeiBianMa').val(),
				GongXuID:$('#txtGongXuID').val()
			},
			dataType: "json",
			type: "post",
			success: function(res) {
				console.log(JSON.stringify(res));
				if(res.status == 1) {
					playerAudio('NG');
					mui.toast(res.message);
					$('#txtSheBeiBianMa').val('').focus();
					return;
				}
			},
			error: function(xhr, type, errorThrown) {
				playerAudio('NG');
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
		
	})
	
	//进入报工界面
	$("#btn_ToBaoGong").click(function() {
		if($('#txtGongXuID').val() == "") {
			playerAudio("NG");
			alert('请选择当前工序！');
			$('#txtGongXuID').click();
			return;
		}
		var extras = {
			curGXMC: $('#txtGongXuMC').val(),
			curGXID: $('#txtGongXuID').val(),
			curZYRY: $('#txtZuoYeRenYuan').val(),
			curSBBM: $('#txtSheBeiBianMa').val(),
			curCXBM: $('#txtLineID').val(),
			curCXMC: $('#txtLineName').val(),
			checkZYRY: $("#checkZYRY").prop("checked") == true ? "1" : "0",
			checkSBBM: $("#checkSBBM").prop("checked") == true ? "1" : "0",
			checkCXBM: $("#checkCXBM").prop("checked") == true ? "1" : "0"
		};
		newpage(this, extras);
	})

})