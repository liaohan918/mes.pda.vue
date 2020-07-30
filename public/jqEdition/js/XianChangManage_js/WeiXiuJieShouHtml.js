var data;//待接收出库单，后台返回
$(function(){
	$('#txtSongXiuID').focus();
	$('#txtSongXiuID').keydown(function(e){
		if(e.keyCode !=13)
		    return;
	    txtSongXiuID_keyDown();
	    
	});
	
	$('#btn_ok').click(function(){
		insData();
	});
});

//扫描送修条码
function txtSongXiuID_keyDown(){
	var check = $("#checkCancel").prop("checked") == true ? "1" : "0";
	var QAI002 = $('#txtSongXiuID').val();
	if(check == "1"){
		//1.取消接收处理
		 //说明：1.1 如果是空白条码，返回界面时弹窗提示，让用户确认当前维修出库条码是否已经流转到下一个工序，
		 //         因为空白条码在AOI接收后，不会跟随管制卡流转，所以系统无法判断，需要用户自行确认
		 //      1.2 如果是管制卡条码，程序可以找到该条码当前所在的工序，判断能否取消接收
		cancelJieShou(QAI002);
	}else{
		getChuKuData(QAI002);
	}
	
}

//取消接收
function cancelJieShou(QAI002){
		$.ajax({
		url: app.API_URL_HEADER + '/WeiXiu/CancelJieShou',
//		url: "http://localhost:27611/api" + '/WeiXiu/CancelJieShou',
		data: {
//			check : check,
			QAI002 : $('#txtSongXiuID').val()
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			if(resdata.status == 1){
				playerAudio('NG');
				$('#txtSongXiuID').focus().select();
				alert(resdata.message);
			}else if(resdata.status == -1){
				var bool = confirm(resdata.message);
				if(bool){
					playerAudio('OK');
					$('#txtSongXiuID').focus().select();
					mui.toast('取消接收成功！');
                    delRow(QAI002);				
				}else{
					//不取消
					unCancelJieShou();
				}
			}else{
				playerAudio('OK');
				mui.toast('取消接收成功！');
				delRow(QAI002);
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//撤销 取消接收 操作--后台已经取消了，前提再询问用户，所以需要在发送一个请求，做撤销处理。针对无管制卡的接收
function unCancelJieShou(){
	$.ajax({
		url: app.API_URL_HEADER + '/WeiXiu/UnCancelJieShou',
//		url: "http://localhost:27611/api" + '/WeiXiu/UnCancelJieShou',
		data: {
//			check : check,
			QAI002 : $('#txtSongXiuID').val()
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			if(resdata.status == 1){
				playerAudio('NG');
				$('#txtSongXiuID').focus().select();
				alert(resdata.message);
			}else{
				playerAudio('OK');
				$('#txtSongXiuID').focus().select();
				//mui.toast(resdata.message);
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//获取维修出库数据
function getChuKuData(QAI002){
	$.ajax({
		url: app.API_URL_HEADER + '/WeiXiu/GetChuKuData',
//		url: "http://localhost:27611/api" + '/WeiXiu/GetChuKuData',
		data: {
//			check : check,
			QAI002 : $('#txtSongXiuID').val()
		},
		dataType: "json",
		type: "get",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			if(resdata.status == 1){
				playerAudio('NG');
				$('#txtSongXiuID').focus().select();
				alert(resdata.message);
			}else{
				playerAudio('OK');
				data = $.parseJSON(resdata.data);
				//mui.toast(resdata.message);
				$('#info').val(resdata.message);
				$('#txtSongXiuID').focus().select();
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//新增接收记录
function insData(){
    $("#checkCancel").prop("checked", false); 
	$.ajax({
		url: app.API_URL_HEADER + '/WeiXiu/InsData',
//		url: "http://localhost:27611/api" + '/WeiXiu/InsData',
		data: {
//			check : check,
			QAI002 : $('#txtSongXiuID').val()
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			if(resdata.status == 1){
				playerAudio('NG');
				$('#txtSongXiuID').focus().select();
				alert(resdata.message);
			}else{
				playerAudio('OK');
				$('#txtSongXiuID').focus().select();
				mui.toast(resdata.message);
				//列表新增行
				addRow();
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//列表新增行
function addRow(){
	$('#dgWOMQAI').datagrid('appendRow',{
		SongXiuGX: data[0]["QAI004"],
		JiXing: data[0]["QAI009"],
		ShuLiang: data[0]["QAI012"],
		TiaoMa: data[0]["QAI002"]
	});
}

//列表删除行
function delRow(QAI002){
	var rows = $('#dgWOMQAI').datagrid("getRows");
	var index = -1;
	for (var i = 0; i < rows.length; i++) {
		if(QAI002 == rows[i]['TiaoMa'])
			index = i;
	}
	if(index != -1){
		$('#dgWOMQAI').datagrid('deleteRow', index);  
	}
}
