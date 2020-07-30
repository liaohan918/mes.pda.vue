mui.init();
var PickerWO = new mui.PopPicker();
$(function() {
	var userPicker = new mui.PopPicker();
	//获取产线
	$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/GetLines',
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			dt = $.parseJSON(resdata.data);
			userPicker.setData(dt);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
	//选择产线
	$('#txtLineID').click(function() {
		userPicker.show(function(items) {
			$('#txtLineName').val(items[0]['text']);
			$('#txtLineID').val(items[0]['value']);
			GetWOMsg();
			$('#txtWO').click();
			//返回 false 可以阻止选择框的关闭
			//return false;
		});

	});
	//选择指令
	$('#txtWO').click(function() {
		PickerWO.show(function(items) {
			$('#txtWO').val(items[0]['text']);
			$('#txtProductCode').val(items[0]['value']);
			$('#txtLOT').focus();
			//返回 false 可以阻止选择框的关闭
			//return false;
		});

	});

	$("#dgGrid").datagrid({
		height: $(window).height() - $("#form").height()
	});

	$('#txtLOT').keydown(function(e) {
		if(e.keyCode != 13) return;
		CheckGZK();
	});
	$('#txtLOTQty').keydown(function(e) {
		if(e.keyCode != 13) return;
		WOLOTBIND();
	});

	$('#btnSave').click(function() {
		WOLOTBIND();
	})

})

function GetWOMsg() {
	//获取指令
	$.ajax({
		url: app.API_URL_HEADER + '/WOBINDLOT/GetWOMsg',
		data: {
			Line: $('#txtLineID').val()
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			dt = $.parseJSON(resdata.data);
			PickerWO.setData(dt);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

function GetWOData() {
	//获取指令绑定数据
	$.ajax({
		url: app.API_URL_HEADER + '/WOBINDLOT/GetWOData',
		data: {
			ZLH: $('#txtWO').val()
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			if(resdata.status == 0) {
				$('#dgGrid').datagrid('loadData', $.parseJSON(resdata.data));
			} else {
				$('#dgGrid').datagrid('loadData', []);
			}

		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

function WOLOTBIND() {
	//获取指令
	$.ajax({
		url: app.API_URL_HEADER + '/WOBINDLOT/WOLOTBIND',
		data: {
			ZLH: $('#txtWO').val(),
			GZK: $('#txtLOT').val(),
			SL: $('#txtLOTQty').val(),
			UserID: app.userid
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			if(resdata.status == 0) {
				mui.toast('数据保存成功!');
				$('#txtLOTQty').val('');
				$('#txtLOT').val('').focus();
				GetWOData();
			} else {
				alert('数据保存失败!' + resdata.message);
			}

		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

function CheckGZK() {
	if($('#txtWO').val() == "") {
		mui.toast('请先选择指令！');
		$('#txtWO').click();
	}
	//获取指令
	$.ajax({
		url: app.API_URL_HEADER + '/WOBINDLOT/CheckGZK',
		data: {
			CPBM: $('#txtProductCode').val(),
			GZK: $('#txtLOT').val()
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			if(resdata.status == 0) {
				$('#txtLOTQty').val('').focus();
			} else {
				mui.toast(resdata.message);
				$('#txtLOT').val('').focus();
			}

		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}