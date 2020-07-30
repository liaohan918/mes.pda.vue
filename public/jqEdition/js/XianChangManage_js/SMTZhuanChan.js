/*
作者：黄邦文
时间：2019-08-01
描述：相同物料不同占位转产处理
 */
mui.init();
mui.plusReady(function(e) {});

$(function() {
	$('#txtZhiLing').focus();

	$('#dgDTMX').datagrid({
		height: $(window).height() - $("#item1").height() - 45,
		//		rowStyler: function(index, row) { //自定义行样式
		//			if(row.DFC007 != 0) {
		//				return 'color:red;font-weight:bold;';
		//			} else {
		//				return 'background-color:lightgreen;';
		//			}
		//		},
		onSelect: function(rowIndex, rowData) {
			if(!rowData)
				return;
			//			var DFC004 = rowData.DFC004; //物料编码
			//			var DFC007 = rowData.DFC007; //差异数量
			//			if(rowData["DFC007"] > 0) {
			//				GetKuWeiMsg(DFC004);
			//			}
		},
	});
	$('#dgDZMX').datagrid({
		height: $(window).height() - $("#item1").height() - 170
	});

	//扫描上一指令号
	$('#txtLastZhiLing').keydown(function(event) {
		if(event.keyCode != "13")
			return;
		$.ajax({
			url: app.API_URL_HEADER + '/SMTZhuanChan/GetLastZhiLingMsg',
			data: {
				LastZhiLing: $('#txtLastZhiLing').val()
			},
			dataType: "json",
			type: "post",
			success: function(resdata) {
				if(resdata.status == 0) {
					console.log(JSON.stringify(resdata));
					if(resdata.data.NextZL == "") {
						playerAudio("NG");
						mui.alert('上一指令没有做预转产，不能转产物料!');
					} else {
						$('#txtCPBM').val(resdata.data.CPBM);
						$('#txtNextZhiLing').val(resdata.data.NextZL);
						$('#dgDTMX').datagrid('loadData', resdata.data.LastZL);
						$('#dgDZMX').datagrid('loadData', resdata.data.NextList);
					}
				} else {
					playerAudio("NG");
					mui.alert(resdata.message);
				}
			},
			error: function(xhr, type, errorThrown) {
				playerAudio("NG");
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
	});
	//扫描物料条码
	$('#txtWLTM').keydown(function(event) {
		if(event.keyCode != "13")
			return;
		var wltm = $('#txtWLTM').val();
		var res = false;

		$.ajax({
			url: app.API_URL_HEADER + '/SMTZhuanChan/GetWlbmByBarcode',
			data: {
				wltm: wltm
			},
			dataType: "json",
			type: "post",
			success: function(resdata) {
				if(resdata.status == 0) {
					console.log(JSON.stringify(resdata));
					if(resdata.data.length > 0) {
						var wlbm = resdata.data[0]["DAB020"];
						var datarow = $('#dgDZMX').datagrid('getData').rows;
						$.each(datarow, function(index, item) {
							if(wlbm == item["DAG004"])
								res = true;
						});
						if(res == false) {
							playerAudio("NG");
							mui.alert('扫描的物料条码不在未备明细中，不能转产，只能退仓!');
							$('#txtWLTM').val('');
						} else {
							$('#txtFDTM').focus();
						}
					} else {
						playerAudio("NG");
						mui.toast("无此条码的信息！");
						$('#txtWLTM').val('');
					}
				} else {
					playerAudio("NG");
					mui.alert(resdata.message);
					$('#txtWLTM').val('');
				}
			},
			error: function(xhr, type, errorThrown) {
				playerAudio("NG");
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});

	});

	//扫描飞达条码
	$('#txtFDTM').keydown(function(event) {
		if(event.keyCode != "13")
			return;
		$('#txtSBTM').focus();
	});

	//扫描设备条码
	$('#txtSBTM').keydown(function(event) {
		if(event.keyCode != "13")
			return;
		$.ajax({
			url: app.API_URL_HEADER + '/SMTZhuanChan/BindZhuanChan',
			data: {
				lastzl: $('#txtLastZhiLing').val(),
				nextzl: $('#txtNextZhiLing').val(),
				wltm: $('#txtWLTM').val(),
				fdtm: $('#txtFDTM').val(),
				sbtm: $('#txtSBTM').val(),
				userid: app.userid
			},
			dataType: "json",
			type: "post",
			success: function(resdata) {
				if(resdata.status == 0) {
					console.log(JSON.stringify(resdata));
					playerAudio("OK");
					mui.toast("物料上料成功！");
					$('#dgDZMX').datagrid('loadData', resdata.data);
				} else {
					playerAudio("NG");
					mui.alert(resdata.message);
					$('#txtSBTM').select();
				}
			},
			error: function(xhr, type, errorThrown) {
				playerAudio("NG");
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
	});
})