//作者：吴冰荣
//时间：2018-09-14
//描述：IC上料
$(function() {
	$('#txtInfo').height($(window).height() - $("#form").height() - $("#txtFeedIC").height() - $("#txtTrayCode").height() - 50);
	$('#TrayCodeInfo').hide();
	//产线下拉选项
	var linePicker = new mui.PopPicker();
	//指令下拉选项
	var woPicker = new mui.PopPicker();
	//指令下拉选项
	var deviceNOPicker = new mui.PopPicker();
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
			BindDeviceNOInfo(deviceNOPicker);
		});
	});
	
	//选择设备编码
	$('#cbbDeviceNO').click(function() {
		if(mui('#cbbWO')[0].value == ""){
			alert("请先选择指令编码或者扫描条码~");
			return;
		}
		deviceNOPicker.show(function(items) {
			$('#cbbDeviceNO').val(items[0]['value']);
			btnConfirm_Click();
			$('#txtFeedIC').focus();
		});
	});
//	
	//扫描工单条码回车
	$('#txtICReelID').keydown(function(event) {
		if(event.keyCode == "13") {
			var tmpBarCode = mui('#txtICReelID')[0].value;
			if(tmpBarCode == "") {
				return;
			}
			$.ajax({
				url: app.API_URL_HEADER + "/PCBFeed/MergeOperation",
				data: {
					txtPCBReelID : mui('#txtICReelID')[0].value,
					OperationType : "BindcbbInfo"
				},
				dataType: "json", //数据类型
				type: "post", //"get" 请求方式
				async: false, //是否异步
				success: function(data) { //成功后操作，返回行集合(data)
					if("1" == data.status) {
						alert("警告：" + data.message);
						return;
					}
					$('#cbbLine').val(data.data[0]["DAF020"]);
					$('#cbbWO').val(data.data[0]["DAH020"]);
					$('#cbbDeviceNO').val(data.data[0]["DAG037"]);
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
	
	//扫描物料条码回车（IC上料）
	$('#txtFeedIC').keydown(function(event) {
		if(event.keyCode == "13") {
			var tmpBarCode = mui('#txtFeedIC')[0].value;
			if(tmpBarCode == "") {
				alert("请扫描物料条码再进行操作");
				return;
			}
			
			if(mui('#cbbWO')[0].value == "" || mui('#cbbLine')[0].value == "" || mui('#cbbDeviceNO')[0].value == ""){
				alert("请选择产线或者指令或者设备编码，再进行操作~");
				return;
			}
			
			$.ajax({
				url: app.API_URL_HEADER + "/PCBFeed/TxtFeedICKeyPress",
				data: {
					cbbWOValue : mui('#cbbWO')[0].value,
					cbbLineValue : mui('#cbbLine')[0].value,
					cbbDeviceNOValue : mui('#cbbDeviceNO')[0].value,
					ReelID : mui('#txtFeedIC')[0].value
				},
				dataType: "json", //数据类型
				type: "post", //"get" 请求方式
				async: false, //是否异步
				success: function(data) { //成功后操作，返回行集合(data)
					if("1" == data.status) {
						alert("警告：" + data.message);
						return;
					}
					$('#txtRemark').val(mui('#txtRemark')[0].value + data.data);
					$('#TrayCodeInfo').show();
					$('#txtTrayCode').focus();
				},
				error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
					//console.log(errorThrown);
					alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
				}
			});
		}
	});
	
	//扫描TRAY编码回车（IC上料）
	$('#TrayCodeInfo').keydown(function(event) {
		if(event.keyCode == "13") {
			var tmpBarCode = mui('#txtFeedIC')[0].value;
			var tmpTrayCode = mui('#txtTrayCode')[0].value;
			if(tmpTrayCode == ""){
				return;
			}
			if(tmpBarCode == "") {
				alert("请扫描物料条码再进行操作");
				return;
			}
			$('#txtTrayCode').val("");
			var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
			var user_id = currentSession.user_id;
//			var user_id = "G90567";
			$.ajax({
				url: app.API_URL_HEADER + "/PCBFeed/TxtTrayCodeKeyPress",
				data: {
					cbbWOValue : mui('#cbbWO')[0].value,
					cbbLineValue : mui('#cbbLine')[0].value,
					cbbDeviceNOValue : mui('#cbbDeviceNO')[0].value,
					ReelID : tmpBarCode,
					TrayCodeInfoValue : tmpTrayCode,
					LoginID : user_id
				},
				dataType: "json", //数据类型
				type: "post", //"get" 请求方式
				async: false, //是否异步
				success: function(data) { //成功后操作，返回行集合(data)
					if("1" == data.status) {
						$('#TrayCodeInfo').hide();
						alert("警告：" + data.message);
						return;
					}
					$('#txtRemark').val("");
					$('#TrayCodeInfo').hide();
					$('#txtFeedIC').val("");
					$('#txtFeedIC').focus();
					alert(data.message);
				},
				error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
					//console.log(errorThrown);
					alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
				}
			});
		}
	});

});

//得到指令编码数据
function getCbbWOData(woPicker) {
//	var cbbLineValue = mui('#cbbLine')[0].value;
//	if(cbbLineValue == "") {
//		alert("请先选择产线编码！");
//		return;
//	}
	$.ajax({
		url: app.API_URL_HEADER + "/PCBFeed/MergeOperation",
		data: {
			cbbLineValue : mui('#cbbLine')[0].value,
			OperationType : "BindWOInfo"
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false, //是否异步
		success: function(data) { //成功后操作，返回行集合(data)
			if("1" == data.status) {
				alert("警告：" + data.message);
			} else {
				woPicker.setData(data.data);
			}
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
		}
	});
}

//得到设备编码数据
function BindDeviceNOInfo(deviceNOPicker) {
	$.ajax({
		url: app.API_URL_HEADER + "/PCBFeed/MergeOperation",
		data: {
			cbbWOValue : mui('#cbbWO')[0].value,
			OperationType : "BindDeviceNOInfo"
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false, //是否异步
		success: function(data) { //成功后操作，返回行集合(data)
			if("1" == data.status) {
				alert("警告：" + data.message);
			} else {
				if(data.data== null || data.data == "") {
					alert("无设备编码信息，请确认~");
					return;
				}
				deviceNOPicker.setData(data.data);
			}
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
		}
	});
}

//确认按钮事件
function btnConfirm_Click(){
	var cbbLineValue = mui('#cbbLine')[0].value;
	var cbbWOLineValue = mui('#cbbWO')[0].value;
	var cbbDeviceNOValue = mui('#cbbDeviceNO')[0].value;
	if(cbbLineValue == "" || cbbWOLineValue == "" || cbbDeviceNOValue == "") {
		alert("请先选择产线编码或指令编码或设备编码~");
		return;
	}	
	$('#txtRemark').val("线别编码:" + cbbLineValue + "\r\n" + "工单编码:" + cbbWOLineValue + "\r\n" + "设备编码:" + cbbDeviceNOValue + "\r\n");	
//	$('#tabsid').tabs('select', 'IC上料');
}