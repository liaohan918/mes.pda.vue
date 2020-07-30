var danHaoPicker; 
$(function(){
	
	$('#dgGZJPDB').datagrid({
		rowStyler: function(index, row) {
			if(row.PDB009 == "Y") 
				return 'background-color:Green;font-weight:bold;';//
			if(row.PDB012 == "Y")
				return 'background-color:Orange;font-weight:bold;';//
		}
	});
	
	$('#txtPDDanHao').focus();
	getDanHao();
	
	$('#txtPDDanHao').click(function(e){
		txtPDDanHao_click();
	});
	
	$('#txtBarCode').keydown(function(e){
		if(e.keyCode == 13){
			txtBarCode_keyDown();
		}
	});
});

//获取单号
function getDanHao(){
	danHaoPicker = new mui.PopPicker();
	$.ajax({
		url: app.API_URL_HEADER + '/GZJUSE/GetDanHao',
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			dt = $.parseJSON(resdata.data);
			danHaoPicker.setData(dt);
			txtPDDanHao_click();
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
};

//点选盘点单号
function txtPDDanHao_click(){
	danHaoPicker.show(function(items) {
		$('#txtPDDanHao').val(items[0]['text']);
		$('#txtPDMSG').val(items[0]['value']);
		getDataByDanHao();
		$('#txtBarCode').focus();
	});
}

//根据单号获取盘点明细
function getDataByDanHao(){
	$.ajax({
		url: app.API_URL_HEADER + '/GZJUSE/GetDataByDanHao',
		data: {
			PDB001:$('#txtPDDanHao').val()
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			playerAudio('OK');
			console.log(JSON.stringify(resdata));
			dt = $.parseJSON(resdata.data);
			$('#dgGZJPDB').datagrid('loadData',[]);
			$('#dgGZJPDB').datagrid('loadData',dt);
		},
		error: function(xhr, type, errorThrown) {
			playerAudio('NG');
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//扫描条码
function txtBarCode_keyDown(){
	if($('#txtBarCode').val() == ""){
		alert("条码不能为空！");
		return;
	}
	$.ajax({
		url: app.API_URL_HEADER + '/GZJUSE/BarCode_keyDown',
		data: {
			PDB001:$('#txtPDDanHao').val(),
			PDB002:$('#txtBarCode').val(),
			user_id:app.userid
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			$('#txtBarCode').select();
			console.log(JSON.stringify(resdata));
			if(resdata.status == 0){
				playerAudio('OK');
				getDataByDanHao();
				mui.toast(resdata.message);
				return;
			}else if(resdata.status == 1){
				playerAudio('NG');
				alert(resdata.message);
				return;
			}else{
				dt = $.parseJSON(resdata.data);
				var bool = confirm(resdata.message);
				if(bool){
					addNewBarCode($('#txtPDDanHao').val(),$('#txtBarCode').val());
					
				}
				
				
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//新增一个条码到盘点单中
function addNewBarCode(strPDB001,strMZJ001){
	$.ajax({
		url: app.API_URL_HEADER + '/GZJUSE/AddNewBarCode',
		data: {
			PDB001:strPDB001,
			MZJ001:strMZJ001,
			user_id:app.userid
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			if(resdata.status == 0){
				playerAudio('OK');
				getDataByDanHao();
				mui.toast(resdata.message);
			}else{
				playerAudio('NG');
				alert(resdata.message);
			}
		},
		error: function(xhr, type, errorThrown) {
			playerAudio('NG');
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}
