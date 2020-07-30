//
//	作者：280639273@qq.com
//	时间：2018-09-12
//	描述：元盛1F--5F调拨
//

var tableinfo = null; //当前的条码信息表

$(function() {
	
	 $("#IsMachining").click(function(){
	  	
		    if($("#IsMachining").prop("checked"))
			{
				$("#display" ).css("display", "none"); 
			}
			else
			{
				$("#display" ).css("display", "block"); 
			}
  	    })
	
	var userPicker = new mui.PopPicker();
	$.ajax({
		url: app.API_URL_HEADER + '/INVDFA_01/LoadData',
		data: {}, 
		dataType: "json",
		type: "post",
		success: function(resdata) 
		{
			//console.log(JSON.stringify(resdata));
			dt = $.parseJSON(resdata.data);
			userPicker.setData(dt);
		},
		error: function(xhr, type, errorThrown) 
		{
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});

		//选择单号
	$('#txtDJLX').click(function() {
		userPicker.show(function(items) {
			$('#txtDJLX').val(items[0]['value']);
			$('#txtDJMC').val(items[0]['text']);
			//GetData(items[0]['value']);
		});

	});
	
	$('#gridINVDFA').datagrid({
		rowStyler: function(index, row) {
			if(row.DFB012 != 'A01') {
				return 'background-color:Green;font-weight:bold;';//
			} else  {
				return 'background-color:Yellow;font-weight:bold;';//
			}
		}
	});
	$('#gridINVDFA_01').datagrid({
		rowStyler: function(index, row) {
			if(row.WRK == 0) {
				return 'background-color:Green;font-weight:bold;';//
			} else  {
				return 'background-color:Yellow;font-weight:bold;';//
			}
		}
	});
	
	$('#tabsid').tabs({
	tools: [{
		iconCls: 'icon-reload',
		handler: function() {		
	 			GetDBHAO();
	 			mui("#WLTM")[0].focus();
		}
	}]
	});
	
});

function GetDBHAO() {
	
		var Position = mui('#txtDJLX')[0].value;
	if(Position == "") {
		$('#txtDJLX').focus();
		playerAudio("NG");
		var b = confirm("请选择单据类型");
		if(b){
			$("#txtDFA002").val("");
		}
		return;
	}
	document.getElementById("txtDFA002").select();
	DJLX = document.getElementById('txtDJLX').value;
	DH = document.getElementById('txtDFA002').value;
	$.ajax({
		url: app.API_URL_HEADER + '/INVDFA_01/GetDBHAO',
		data: {
			txtDJLX: DJLX,
			txtDFA002 : DH
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(resdata) {
			if(resdata.status == 1) {
				playerAudio("NG");
				mui.alert(resdata.message,function(){ 						
 						mui("#txtDFA002")[0].focus();
						$("#txtDFA002").val("");
 					});
				return;
			}
			else
			{
				playerAudio("OK");
				console.log(JSON.stringify(resdata));
				$('#gridINVDFA').datagrid('loadData', resdata.data.tbData);
				$('#gridINVDFA_01').datagrid('loadData', resdata.data.HuiZong);
				mui('#head2')[0].innerHTML = "总数量：[" +(parseInt(resdata.data.st[0]["wei"])+parseInt(resdata.data.st[0]["yi"]))+"]"+"</br>已扫条码：[" +resdata.data.st[0]["yi"]+"]  " + "  未扫条码：[" +resdata.data.st[0]["wei"]+"]";
			}
		},
		error: function(xhr, type, errorThrown) {
			playerAudio("NG");
			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
			return;
		}
	});
}


function GetStore() {
	
	
	if(!$("#IsMachining").prop("checked"))
	return;

	var Position = mui('#txtKW')[0].value;
	if(Position == "") {
		playerAudio("NG");
		alert("请先扫描库位条码！");
		$('#txtKW').focus();
		return;
	}
	
	if($("#txtDFA002").val() == "") {
		    playerAudio("NG");
			mui.toast("调拨单号为空!");
			return;
	}
	
	//var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	//var user_id = currentSession.user_id;
	
	$.ajax({
			url: app.API_URL_HEADER + '/INVDFA_01/GetStore',
			data:{
					DanHao:$("#txtDFA002").val(), //调拨单号
					DBKW:$("#txtKW").val(), //库位
					DJLX:$("#txtDJLX").val(), 
					WLTM:$("#WLTM").val(),
					logID: app.userid()//登录ID
				},
			DataType:"json",
			type:"post",
			async:false,
			//timeout:15000,
			success:function(data){
							console.log(JSON.stringify(data));
		 				if(data.status == 1){
		 					playerAudio("NG");
		 					mui.alert(data.message);//错误信息弹框
		 					return;
		 				}
		 				if(data.status ==2){
		 					playerAudio("NG");
		 					mui.alert(data.message);
		 					return;
		 				}
		 				else if(data.status == 0)
		 				{
		 					$("#txtDFA002")[0].focus();
		 					$("#txtDFA002").val("");
		 					playerAudio("OK");
		 					mui.toast(data.message);
		 					$('#gridINVDFA').datagrid('loadData', { total: 0, rows: [] });
		 					$('#gridINVDFA_01').datagrid('loadData', { total: 0, rows: [] });
					   }
				},
				error: function(xhr, type, errorThrown) 
				{
					playerAudio("NG");
	 				alert("获取数据异常：" + JSON.stringify(errorThrown));
	 				return;
	 			}
		 });
	
}



function GetWLTM() 
{
	var Position = mui('#txtDJLX')[0].value; //单据类型
	var Position1 = mui('#txtDFA002')[0].value //单据号
	if(Position == "") {
		$('#txtDJLX').focus();
		playerAudio("NG");
		var b = confirm("请选择单据类型");
		if(b){
			$("#txtDFA002").val("");
		}
		return;
	}
	
	if($("#txtDFA002").val() == "") {
		    playerAudio("NG");
			mui.toast("调拨单号为空!");
			$("#WLTM").val("");
			$('#txtDFA002').focus();
			return;
	}
	
	if($("#txtKW").val() == "") {
		    playerAudio("NG");
			mui.toast("库位为空!");
			$('#txtKW').focus();
			return;
	}
	
	//var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	//var user_id = currentSession.user_id;
	
	$.ajax({
		url: app.API_URL_HEADER + '/INVDFA_01/GetWLTM',
		data: {
					DanHao:$("#txtDFA002").val(), //调拨单号
					DBKW:$("#txtKW").val(), //库位
					DJLX:$("#txtDJLX").val(), 
					WLTM:$("#WLTM").val(), 
					logID:app.userid()//登录ID
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(resdata) {
			if(resdata.status == 1) {
			playerAudio("NG");
				mui.alert(resdata.message,function(){ 						
 						mui("#WLTM")[0].focus();
						$("#WLTM").val("");
 					});
				return;
			}
			else
			{
			playerAudio("OK");
			console.log(JSON.stringify(resdata));
			$("#WLTM").val("");
	 		mui.toast("入库成功！");
	 		mui('#head2')[0].innerHTML = "总数量：[" +(parseInt(resdata.data.st[0]["wei"])+parseInt(resdata.data.st[0]["yi"]))+"]"+"</br>已扫条码：[" +resdata.data.st[0]["yi"]+"]  " + "  未扫条码：[" +resdata.data.st[0]["wei"]+"]";
	 		$("#WLTM").focus();
			}
		},
		error: function(xhr, type, errorThrown) {
		playerAudio("NG");
			mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
			return;
		}
	});
}

		

