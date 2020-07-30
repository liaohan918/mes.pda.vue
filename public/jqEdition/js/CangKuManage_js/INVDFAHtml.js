/*
作者：黄邦文
 时间：2019.10.16
 描述：仓库调拔
 */
mui.plusReady(function() {
	$('#dgWLMX').datagrid({
		height: $(window).height() - $("#head1").height() - 50
	});
	$('#divTxtInfo').height($(window).height() - $("#head1").height() - $("#btnBindKW").height() - $("#txtStoreCode").height() -
		$("#txtBarCode").height() - 90);
});
	
$(function() {
	// $('#dgWLMX').datagrid({
	// 	height: $(window).height() - $("#head1").height() - 50
	// });
	// $('#divTxtInfo').height($(window).height() - $("#head1").height() - $("#btnBindKW").height() - $("#txtStoreCode").height() -
	// 	$("#txtBarCode").height() - 90);

	var userPicker = new mui.PopPicker();
	//获取单号
	$.ajax({
		url: app.API_URL_HEADER + '/INVDFA/GetDBHao',
		data: {
			DJType: "1202"
		}, //主要区别单号的获取条件,在对应的界面有设置这个参数
		dataType: "json",
		type: "post",
		success: function(resdata) {
			dt = $.parseJSON(resdata.data);
			userPicker.setData(dt);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
	//选择单号
	$('#txtDBHao').click(function() {
		userPicker.show(function(items) {
			$('#txtDBHao').val(items[0]['value']);
			GetData(items[0]['value']);
		});

	});

	//选择单号
	$('#txtStoreCode').keydown(function(event) {
		if(event.keyCode == "13") {
			btnBindKW_Click();
		}
	});

	//扫描条码回车
	$('#txtBarCode').keydown(function(event) {
		if(event.keyCode == "13") {
			var tmpBarCode = mui('#txtBarCode')[0].value;
			if(tmpBarCode == "") {
				return;
			}
			$.ajax({
				url: app.API_URL_HEADER + "/INVDFA/TxtBarCodeKeyPress",
				data: {
					txtBarCode: mui('#txtBarCode')[0].value,
					txtDBHao: mui('#txtDBHao')[0].value //,
					//txtCKYuan: mui('#txtCKYuan')[0].value
				},
				dataType: "json", //数据类型
				type: "post", //"get" 请求方式
				async: false, //是否异步
				success: function(data) { //成功后操作，返回行集合(data)
					if("1" == data.status) {
						playerAudio("NG");
						alert("警告：" + data.message);
						$('#txtBarCode').val("");
						$('#txtBarCode').focus();
						return;
					}
					$('#txtInfo').val(data.message);
					$('#txtStoreCode').focus();
				},
				error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
					//console.log(errorThrown);
					alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
				}
			});
		}
	});
});

//得到明细表数据与仓库数据
function GetData(DBHao) {
	$.ajax({
		url: app.API_URL_HEADER + '/INVDFA/LoadData2', //获取数据:调用webApi服务路径
		data: {
			DBHao: DBHao,
			DBType: '1202'
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: true, //是否异步
		success: function(data) {
			//console.log(JSON.stringify(data)); //在控制台输出日志
			data = $.parseJSON(data.data);
			//赋值库位
			//			$('#txtCKYuan').val(data.GetDBCKMsg[0].DFA009);
			//			$('#txtCKMD').val(data.GetDBCKMsg[0].DFA008);
			var rows = data.GetDBWLMX;
			$('#dgWLMX').datagrid('loadData', rows); //给表格设置数据源(rows)
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
		}
	});
}

//绑定库位
function btnBindKW_Click() {
	var Position = mui('#txtStoreCode')[0].value;
	if(Position == "") {
		playerAudio("NG");
		alert("请先扫描库位条码！");
		$('#txtStoreCode').focus();
		return;
	}
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	var user_id = app.userid;
	$.ajax({
		url: app.API_URL_HEADER + "/INVDFA/BtnBindKWClick",
		data: {
			_sp_BillNo: mui('#txtDBHao')[0].value,
			_sp_BarCode: mui('#txtBarCode')[0].value,
			_sp_Position: mui('#txtStoreCode')[0].value,
			_sp_UserID: user_id //,
			//txtCKMD: mui('#txtCKMD')[0].value
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false, //是否异步
		success: function(data) { //成功后操作，返回行集合(data)
			if("1" == data.status) {
				playerAudio("NG");
				alert("警告：" + data.message);
				if(data.message.substring(0, 4) == "0001") {
					$('#txtStoreCode').val('').focus();
					return;
				} else {
					$('#txtBarCode').val("");
					$('#txtBarCode').focus();
					return;
				}
			} else {
				playerAudio("OK");
				mui.toast("调拨成功~");
				$('#txtBarCode').val("");
				$('#txtInfo').val("");
				$('#txtBarCode').focus();
			}
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
		}
	});
}