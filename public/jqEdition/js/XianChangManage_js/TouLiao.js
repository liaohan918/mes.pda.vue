mui.init();

mui.plusReady(function(e){
	$('#dgDTMX').datagrid({
		height: $(window).height() - $("#item1").height() - 45,
		rowStyler: function(index, row) { //自定义行样式
			if(row.xqsl == row.tlsl) {
				return 'background-color:lightgreen;';
			}
		}
	});
	$('#dgYTMX').datagrid({
		height: $(window).height() - $("#item1").height() - 45
	});
});

$(function() {

	$('#txtBillNo').keydown(function(e) {
		if(e.keyCode != 13) return;
		GetWOMsg();
		
	});
	$('#txtBarcode').keydown(function(e) {
		if(e.keyCode != 13) return;
		$.ajax({
			url: app.API_URL_HEADER + app.API_METHOD_ESP,
			data: {
				spname: "App_TouLiao", 
				returnvalue: 1,
				_sp_BillNo: $('#txtBillNo').val(),
				_sp_Barcode: $('#txtBarcode').val(),
				_sp_USER_ID: app.userid
			},
			dataType: "json",
			type: "post",
			async: false,
			success: function(data) {
				console.log(JSON.stringify(data));
				if(data.status==0)
				{
					playerAudio('OK');
					mui.toast('投料成功!');
					$("#txtBarcode").val("");
					GetWOMsg();
				}
				else{
					playerAudio('NG');
					mui.toast('投料失败！'+data.message);
				}
			},
			error: function(xhr, type, errorThrown) {
				playerAudio('NG');
				console.log("获取数据异常：" + JSON.stringify(errorThrown));
				plus.nativeUI.toast("获取数据异常：" + JSON.stringify(errorThrown));

			}
		});
	});
})

function GetWOMsg() {
	//获取指令
	$.ajax({
		url: app.API_URL_HEADER + '/TouLiao/GetMXByBillNo',
		data: {
			BillNo: $('#txtBillNo').val()
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			playerAudio('OK');
			console.log(JSON.stringify(resdata));
			var bldata = $.parseJSON(resdata.data.bldata);
			var tldata = $.parseJSON(resdata.data.tldata);
			$('#dgDTMX').datagrid('loadData', bldata);
			$('#dgYTMX').datagrid('loadData', tldata);
			$('#txtBarcode').focus();
		},
		error: function(xhr, type, errorThrown) {
			playerAudio('NG');
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}