//作者：吴冰荣
//时间：2018-09-28
//描述：PCB上料
$(function() {
	$('#dataGrid1').datagrid({
			height: $(window).height() - $("#form").height() - $("#form2").height() - 55
	});

	//产线下拉选项
	var linePicker = new mui.PopPicker();
	//工单下拉选项
	var woPicker = new mui.PopPicker();

	$.ajax({
		url: app.API_URL_HEADER + '/PCBFeed/MergeOperation',
		data: {
			OperationType : "BindLineInfo"
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if("1" == resdata.status) {
				alert("警告：" + resdata.message);
			} else{
				dt = resdata.data;
				if(dt == null || dt == "") {
					alert("无产线信息，请确认~");
					return;
				}
				linePicker.setData(dt);
				//赋值产线
//				$('#cbbLine').val(dt[0]['value']);
//				getCbbWOData(woPicker);
			}
			
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
	//选择产线
	$('#cbbLine').click(function() {
		linePicker.show(function(items) {
			$('#cbbLine').val(items[0]['value']);
			$('#cbbWO').val("");
			getCbbWOData(woPicker);
			//返回 false 可以阻止选择框的关闭
			//return false;
		});
	});

	//选择指令
	$('#cbbWO').click(function() {
		if(mui('#cbbLine')[0].value == ""){
			alert("请先选择产线编码或者扫描条码~");
			return;
		}
		woPicker.show(function(items) {
			$('#cbbWO').val(items[0]['value']);
			btnConfirm_Click();
//			$('#txtPCBReelID').focus();
		});
	});
	
	//扫描工单条码回车
	$('#txtPCBReelID').keydown(function(event) {
		if(event.keyCode == "13") {
			var tmpBarCode = mui('#txtPCBReelID')[0].value;
			if(tmpBarCode == "") {
				return;
			}
			$.ajax({
				url: app.API_URL_HEADER + "/PCBFeed/MergeOperation",
				data: {
					txtPCBReelID : mui('#txtPCBReelID')[0].value,
					OperationType : "BindcbbInfo"
				},
				dataType: "json", //数据类型
				type: "post", //"get" 请求方式
				async: false, //是否异步
				success: function(data) { //成功后操作，返回行集合(data)
					if("1" == data.status) {
						playerAudio('NG');
						alert("警告：" + data.message);
						$('#txtPCBReelID').val('');
						return;
					}
					$('#cbbLine').val(data.data[0]["DAF020"]);
					$('#cbbWO').val(data.data[0]["DAH020"]);
					
					btnConfirm_Click();
//					$('#txtPCBReelID').focus();
				},
				error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
					//console.log(errorThrown);
					alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
				}
			});
		}
	});
	
	//扫描PCB条码回车
	$('#txtFeedPCB').keydown(function(event) {
		if(event.keyCode == "13") {
			var tmpBarCode = mui('#txtFeedPCB')[0].value;
			if(mui('#cbbLine')[0].value == ""){
				alert("请选择产线编码！");
				playerAudio("NG");
				mui("#txtFeedPCB")[0].value='';
				mui('#cbbLine')[0].focus();
				return;
			}
			if(mui('#cbbWO')[0].value == ""){
				alert("请选择指令编码！");
				playerAudio("NG");
				mui("#txtFeedPCB")[0].value='';
				mui('#cbbWO')[0].focus();
				return;
			}
			if(mui('#txtFeedPCB')[0].value == ""){
				alert("请扫描PCB条码！");
				playerAudio("NG");
				mui('#txtFeedPCB')[0].focus();
				return;
			}
			var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
			var user_id = currentSession.user_id;
//			var user_id = "G90567";
			$.ajax({
				url: app.API_URL_HEADER + "/PCBFeed/TxtFeedPCBKeyPress",
				data: {
					cbbWOValue : mui('#cbbWO')[0].value,
					cbbLineValue : mui('#cbbLine')[0].value,
					ReelID : mui('#txtFeedPCB')[0].value,
					LoginID : user_id
				},
				dataType: "json", //数据类型
				type: "post", //"get" 请求方式
				async: false, //是否异步
				success: function(data) { //成功后操作，返回行集合(data)
					if("1" == data.status) {
						playerAudio("NG");
						alert("警告：" + data.message);
						mui("#txtFeedPCB")[0].focus();
						mui("#txtFeedPCB")[0].select();
						return;
					}
//					$('#txtRemark').val(mui('#txtRemark')[0].value + data.data);
					mui.toast("操作成功~");
					playerAudio("OK");
					mui("#txtFeedPCB")[0].focus();
					mui("#txtFeedPCB")[0].select();
//					$('#txtFeedPCB').focus();
				},
				error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
					//console.log(errorThrown);
					playerAudio("NG");
					alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
					mui("#txtFeedPCB")[0].focus();
					mui("#txtFeedPCB")[0].select();
				}
			});
		}
	});
	
//		$('#tabsid').tabs('close', 2);

});

//得到指令编码数据
function getCbbWOData(woPicker) {
	var cbbLineValue = mui('#cbbLine')[0].value;
	if(cbbLineValue == "") {
		alert("请先选择产线编码！");
		playerAudio("NG");
		return;
	}
	$.ajax({
		url: app.API_URL_HEADER + "/PCBFeed/MergeOperation",
		data: {
			cbbLineValue : cbbLineValue,
			OperationType : "BindWOInfo"
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false, //是否异步
		success: function(data) { //成功后操作，返回行集合(data)
			if("1" == data.status) {
				alert("警告：" + data.message);
				playerAudio("NG");
			} else {
				//playerAudio("OK");
				woPicker.setData(data.data);	
				
			}
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
		}
	});
}

//确认按钮事件
function btnConfirm_Click(){
	var cbbLineValue = mui('#cbbLine')[0].value;
	var cbbWOLineValue = mui('#cbbWO')[0].value;
	if(cbbLineValue == "" || cbbWOLineValue == "") {
		alert("请先选择产线编码或指令编码~");
		playerAudio("NG");
		return;
	}
	$.ajax({
		url: app.API_URL_HEADER + "/PCBFeed/MergeOperation",
		data: {
			cbbLineValue : cbbLineValue,
			cbbWOValue : cbbWOLineValue,
			OperationType : "btnConfirmClick",
			PageSize: $('#dataGrid1').datagrid('options').pageSize,
			PageIndex　:　$('#dataGrid1').datagrid('options').pageNumber,
			KeyField　: "DAH005"
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false, //是否异步
		success: function(data) { //成功后操作，返回行集合(data)
			if("1" == data.status) {
				alert("警告：" + data.message);
			} else {
				if(data.data.DetailedData == ""){
					playerAudio("NG");
					alert("无PCB信息，请确认~")
					return;
				}
//				$('#tabsid').tabs('select', 'PCB信息');
				var dgData = {};
				dgData.rows = data.data.DetailedData;
				dgData.sumDataNo = data.data.TotalCount;
				$('#dataGrid1').datagrid('loadData', dgData);
				playerAudio("OK");
			}
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
		}
	});
}

////选指令
//function btnSelect_Click(){
//	$('#dataGrid1').datagrid('loadData', { total: 0, rows: [] });
//	$('#tabsid').tabs('select', '选指令');
//}

////PCB上料
//function btnFeed_Click(){
//	var woValue = mui('#cbbWO')[0].value;
//	if(woValue == ""){
//		alert("请选择指令~");
//		return;
//	}
//	$('#txtRemark').val("指令编码:" + mui('#cbbWO')[0].value + "\r\n");
//	$('#tabsid').tabs('select', '上料');
//	$('#txtFeedPCB').focus();
//}


