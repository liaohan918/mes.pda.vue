var userid;
mui.plusReady(function() {
	app.init();
	currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	userid = currentSession.user_id;
});

$(function(){
	$('#txtSongXiuID').focus();
	$('#txtSongXiuID').keydown(function(e){
		if(e.keyCode !=13)
		    return;
	    txtSongXiuID_keyDown();
	    
	});
	
	$('#btn_ok').click(function(){
		var check = $("#checkCancel").prop("checked") == true ? "1" : "0";
		if(check == "1"){
			cancelJieShou();
		}
		else{
			insData();
		}
	});
});

//扫描送修条码
function txtSongXiuID_keyDown(){
	var QAI002 = $('#txtSongXiuID').val();
	getChuKuData(QAI002);
}

//取消接收
function cancelJieShou(){
	var bool = confirm('是否取消接收！');
	if(bool){
		$.ajax({
			url: app.API_URL_HEADER + '/SongXiu/CancelJieShou',
			data: {
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
					mui.toast('取消接收成功！');
					delRow($('#txtSongXiuID').val());
				}
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
	}
}

//获取送修单数据
function getChuKuData(QAI002){
	$.ajax({
		url: app.API_URL_HEADER + '/SongXiu/GetSongXiuData',
		data: {
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
				//data = $.parseJSON(resdata.data);
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
		url: app.API_URL_HEADER + '/SongXiu/InsData',
		data: {
			QAI002 : $('#txtSongXiuID').val(),
			//QAI016:$('#txtShuLiang').val(),
			QAI016:'',
			user_id:userid
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
				data = $.parseJSON(resdata.data);
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
		ShuLiang: data[0]["QAI016"],
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