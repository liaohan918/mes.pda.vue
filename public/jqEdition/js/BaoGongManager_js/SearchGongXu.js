/*
作者：庄卓杰
时间：2019-12-21
描述：工序查询
 */
mui.init();
mui.plusReady(function(e) {
	$('#dgSCMX').datagrid({
		height: $(window).height() - $("#item1").height() - 50,
		onSelect: function(rowIndex, rowData) {
			if(!rowData)
				return;
		},
	});
	
	$('#dgTMMX').datagrid({
		height: $(window).height() - $("#item1").height() - 50,
		onSelect: function(rowIndex, rowData) {
			if(!rowData)
				return;
			var BarCode = rowData.MAI002; //物料编码
			SearchData(BarCode,2);
		}
	});
	$('#divTxtInfo').height($(window).height() - $("#item1").height() - 50);
});

$(function() {
	$('#txtBarcode').focus();

	// $('#dgSCMX').datagrid({
	// 	height: $(window).height() - $("#item1").height() - 50,
	// 	onSelect: function(rowIndex, rowData) {
	// 		if(!rowData)
	// 			return;
	// 	},
	// });
	
	// $('#dgTMMX').datagrid({
	// 	height: $(window).height() - $("#item1").height() - 50,
	// 	onSelect: function(rowIndex, rowData) {
	// 		if(!rowData)
	// 			return;
	// 		var BarCode = rowData.MAI002; //物料编码
	// 		SearchData(BarCode,2);
	// 	}
	// });
	// $('#divTxtInfo').height($(window).height() - $("#item1").height() - 50);

	//扫描
	$('#txtBarcode').keydown(function(event) {
		if(event.keyCode != "13")
			return;
		if($('#txtBarcode').val()=='')
			return;
		SearchData($('#txtBarcode').val(),1);
	});
	
})


function SearchData(BarCode,Type) {
	$.ajax({
		url: app.API_URL_HEADER + app.API_METHOD_ESP,
		data: {
			spname: "SearchGongXu",
			returnvalue: 1,
			_sp_BarCode: BarCode,
			_sp_Type:Type,
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(data) {
			console.log(JSON.stringify(data));
			if(data.status == 0) {
				playerAudio('OK');
				if(Type==1){
					if(data.data[0][0]["TMType"]==1){
						var row=data.data[0][0];
						var m = "当前条码：" + $('#txtBarcode').val() + 
								"\n条码类型：产品条码/箱条码" +
								"\n指令单号：" + row.QAB003 +
								"\n数量:" + row.QAB017 +
								"\n产品条码:" + row.QAB002 +
								"\n产品编码：" + row.QAB005 +
								"\n产品名称：" + row.QAB006 +
								"\n产品规格：" + row.QAB007 +
								"\n当前工序：" + row.QAB010 + 
								"\n操作人：" + row.PAA002 + 
								"\n操作时间：" + row.QAB015 + 
								"\n下一工序：" + row.NextGX;
						$('#txtInfo').val(m);
						
						mui('#dgSCMX-sum')[0].innerHTML = data.data[1].length;
						mui('#dgTMMX-sum')[0].innerHTML = 0;
						$('#dgSCMX').datagrid('loadData', data.data[1]);
						$('#dgTMMX').datagrid('loadData', []);
					}
					else{
						var row=data.data[0][0];
						var m = "当前条码：" + $('#txtBarcode').val() + 
								"\n条码类型：卡板条码" +
								"\n指令单号：" + row.DAB031 +
								"\n数量:" + row.DAB006 +
								"\n产品编码：" + row.DAB020 +
								"\n产品名称：" + row.DAB021 +
								"\n产品规格：" + row.DAB008 +
								"\n质量状态：" + row.ZLZT + 
								"\n检验状态：" + row.JYZT;
						$('#txtInfo').val(m);
						
						mui('#dgTMMX-sum')[0].innerHTML = data.data[1].length;
						mui('#dgSCMX-sum')[0].innerHTML = 0;
						$('#dgTMMX').datagrid('loadData', data.data[1]);
						$('#dgSCMX').datagrid('loadData', []);
					}
				}
				else{
					mui('#dgSCMX-sum')[0].innerHTML = data.data.length;
					$('#dgSCMX').datagrid('loadData', data.data);
				}
				$('#txtBarcode').val('');
				$('#txtBarcode').focus();
				return;
			} else {
				playerAudio('NG');
				alert('条码查询失败！' + data.message);
				$('#txtBarcode').val('');
				$('#txtBarcode').focus();
				return;
			}
		},
		error: function(xhr, type, errorThrown) {
			playerAudio('NG');
			plus.nativeUI.toast("获取数据异常：" + JSON.stringify(errorThrown));
			$('#txtBarcode').val('');
			$('#txtBarcode').focus();
			return;
		}
	});
}