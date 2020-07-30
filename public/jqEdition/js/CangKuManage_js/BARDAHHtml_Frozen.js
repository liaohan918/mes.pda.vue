/*
作者：G103574 向龙飞
时间：2019-07-12
描述：冻结
 */
mui.init()
mui.plusReady(function() {
	$('#barcode2info').height($(window).height() - 138);
	//设置datagrid属性
	$('#datagrid').datagrid({
		height: $(window).height() - $('#infos').height() - 73
	})
});
$(function() {

	SetInputFoucs("#txtBarcode1")
	$('#barcode2info').height($(window).height() - 138);
	//设置datagrid属性
	$('#datagrid').datagrid({
		height: $(window).height() - $('#infos').height() - 73
	})
	//扫描批量条码回车事件
	$('#txtBarcode1').keydown(function(event) {
		var barcode = $('#txtBarcode1').val()
		if (event.keyCode == '13' && barcode != '') {
			//请求服务，拿物料编码、供应商、批次、客户编号、数量，并写到输入框内
			//           DAB020、DAB019、DAB007、DAB030、DAB006
			$.get(app.API_URL_HEADER + '/BARDAH/GetBarcodeInfo', {
				barcode: barcode
			}, function(result) {
				var data = $.parseJSON(result.data)
				if (data.length == 0) {
					mui.toast('条码无效')
					playerAudio("NG");
					$('#txtBarcode1').val('').focus();
					return;
				}
				if(data[0].DAB048=='1')
				{
					playerAudio("NG");
					mui.toast('该条码已经冻结了，无需重复操作!');
					$('#datagrid').datagrid({
						data:[]
					});
					$('#DAB020').val('');
					$('#DAB019').val('');
					$('#DAB007').val('');
					$('#DAB030').val('');
					$('#txtBarcode1').val('').focus();
				}
				else
				{
					playerAudio("OK");
					$('#DAB020').val(data[0].DAB020);
					$('#DAB019').val(data[0].DAB019);
					$('#DAB007').val(data[0].DAB007);
					$('#DAB030').val(data[0].DAB030);
				}
			})
		}
	})

	//查询按钮事件
	$('#btnQuery').click(function() {
		//发送 物料编码、供应商、批次、客户编号 请求服务，并将得到的信息绑定到datagrid中
		//TODO判断物料编码是否为空
		$.get(app.API_URL_HEADER + '/BARDAH/QueryMaterials', {
			materialNo: $('#DAB020').val(),
			supplierNo: $('#DAB019').val(),
			batchNo: $('#DAB007').val(),
			customerNo: $('#DAB030').val()
		}, function(result) {
			var data = $.parseJSON(result.data)
			if (data.length == 0) {
				mui.toast('无此物料')
				playerAudio("NG")
				$('#txtBarcode1').val('').focus()
				return
			}
			$('#datagrid').datagrid({
				data: data
			})
			$('#datagrid').datagrid('checkAll')
			console.log(data)
		})
	})

	//批量冻结按钮事件
	$('#btnFreeze1').click(function() {
		console.log('freeze')
		var checkedRowsBarcodes = []
		var checkedRows = $('#datagrid').datagrid('getChecked')
		for (var i = 0; i < checkedRows.length; i++) {
			checkedRowsBarcodes.push(checkedRows[i].DAB001)
		}
		console.log(checkedRowsBarcodes)
		// var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
		var user_id = app.userid; //currentSession.user_id;
		$.post(app.API_URL_HEADER + '/BARDAH/FreezeBatch', {
			barcodes: checkedRowsBarcodes,
			userid: user_id
		}, function(result) {
			if (result.status == 0) {
				mui.toast("冻结成功!");
				playerAudio("OK")
			} else {
				mui.toast("冻结失败!" + result.message);
				playerAudio("NG")
			}
		})
	})

	//tab选项卡改变事件
	$('#tabsid').tabs({
		onSelect: function(title, index) {
			if (title == "批量") {
				setTimeout(function() {
					SetInputFoucs("#txtBarcode1");
				}, 500);
			}
			if (title == "单个") {
				setTimeout(function() {
					SetInputFoucs("#txtBarcode2");
				}, 500);
			}
		}
	});
	//单个冻结按钮事件
	$('#btnFreeze2').click(function() {
		var barcode = $('#txtBarcode2').val()
		console.log(barcode)
		var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
		var user_id = currentSession.user_id;
		$.post(app.API_URL_HEADER + '/BARDAH/FreezeSingle', {
			barcode: barcode,
			userid: user_id
		}, function(result) {
			if (result.status == 0) {
				playerAudio("OK")
				mui.toast("冻结成功!");
			} else {
				playerAudio("NG")
				mui.toast("冻结失败!" + result.message);
			}
		})
	})

	//扫描单个条码的事件
	$('#txtBarcode2').keydown(function(e) {
		var barcode = $('#txtBarcode2').val()
		if (event.keyCode == '13' && barcode != '') {
			//请求服务，拿物料编码、供应商、批次、客户编号、数量，并展示到界面
			//           DAB020、DAB019、DAB007、DAB030、DAB006
			$.get(app.API_URL_HEADER + '/BARDAH/GetBarcodeInfo', {
				barcode: barcode
			}, function(result) {
				var data = $.parseJSON(result.data)
				if (data.length == 0) {
					mui.toast('条码无效')
					playerAudio("NG")
					$('#txtBarcode2').val('').focus()
					return
				}
				if(data[0].DAB048=='1')
				{
					playerAudio("NG");
					mui.toast('该条码已经冻结了，无需重复操作!');
					$('#txtBarcode2').val('').focus();
					$('#barcode2info').html('');
				}
				else
				{
					var content = '物料条码：' + barcode + '\n' + '物料编码：' + data[0].DAB020 + '\n' + '供应商：' + data[0].DAB045 + '\n' + '批次号：' + data[0].DAB007 +
						'\n' + '数量：' + data[0].DAB006 + '\n' + '客户编号：' + data[0].DAB030 + '\n'
					$('#barcode2info').html(content)
				}
			})
		}
	})


})
