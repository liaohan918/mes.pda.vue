var mac;
var user_id;
var billDate = "";
var keepCyclePicker;
var number;
var checkNumber;
var cacheOperationtype;

//add by HCW 20200326
mui.plusReady(function(e) {
	$('#txtInfo').height($(window).height() - $("#divInfo").height() - $("#NGBtn").height() - 290);
	$('#txtInfo1').height($(window).height() - $("#txtInfo").height() - $("#divInfo").height() - $("#NGBtn").height() - 184);
});

var OperationalLogic = {
		init: function() {
//			var toolbar = [{ //先不用这种方式
//					text: '删除选中的检测',
//					iconCls: 'icon-cancel',
//					handler: function() {
//						var btnArray = ['取消', '确认'];
//						mui.confirm('确认删除选中行？', '警告', btnArray, function(e) {
//							if(e.index == 1) {
//								OperationalLogic.DeleteData(checkNumber);
//								return;
//							}
//							mui.toast("已取消~");
//						});
//					}
//			}];

		$('#Detail').datagrid({
			height: $(window).height() - 182,
			onClickRow: function(index, data) {
				checkNumber = data["CAH001"];
			}
		});
		$('#txtInfo').height($(window).height() - $("#divInfo").height() - $("#NGBtn").height() - 290);
		$('#txtInfo1').height($(window).height() - $("#txtInfo").height() - $("#divInfo").height() - $("#NGBtn").height() - 184);

		$("#txtInfo1").hide();
		$("#NGBtn").hide();
		$("#txtDeviceBarCode").focus();

		OperationalLogic.getKeepCyclePickerData();
		//保养周期选择
		$('#keepCycle').click(function() {
			keepCyclePicker.show(function(items) {
				$('#keepCycle').val(items[0]['value']);
			});
		});

		OperationalLogic.DateInit();
		$("#datDate").val(billDate);

		$('#txtDeviceBarCode').keydown(function(event) {
			if(event.keyCode != "13") {
				return;
			}
			OperationalLogic.deviceBarCodeEnter();
		});

		document.getElementById('DeleteBtn').addEventListener('tap', function() {

			var btnArray = ['取消', '确认'];
			mui.confirm('确认删除选中行？', '警告', btnArray, function(e) {
				if(e.index == 1) {
					OperationalLogic.DeleteData(checkNumber);
					return;
				}
				mui.toast("已取消~");
			});
		});
		document.getElementById('OKBtn').addEventListener('tap', function() {
			OperationalLogic.BtnHandle("OK");
		});
		document.getElementById('NGBtn').addEventListener('tap', function() {
			
			var info = $('#info1').val();
			if($('#info1').val() == ""){
				mui.toast('请输入NG描述后再操作~');
				return;
			}
			OperationalLogic.BtnHandle("NG");

			//NG处理完，异常也清掉
			mui("#NGCheck")[0].checked = false;
			$('#info1').val("");
			OperationalLogic.NGCheck();
		});
		$("#NGCheck").change(function() {
			OperationalLogic.NGCheck();
		});
	},
	getKeepCyclePickerData: function() {
//		keepCyclePicker = new mui.PopPicker();
		var data = {};

		Ajax.httpAsyncPost("/MCSCAHCheck/GetKeepCyclePickerData", data, function(data){
			keepCyclePicker = new mui.PopPicker();
			keepCyclePicker.setData(data.data);
		});
//		var result = ShareAjax("/MCSCAHCheck/GetKeepCyclePickerData", data, false, true, "");
//		//失败处理
//		if(result.status) {
//			playerAudio("NG");
//			mui.alert(result.message);
//			return;
//		}
//		keepCyclePicker.setData(result.data);
	},
	deviceBarCodeEnter: function() {
		var tmpDeviceBarCode = $('#txtDeviceBarCode').val();
		if(tmpDeviceBarCode == "") {
			mui.toast("请扫描设备编码~");
			return;
		}
		var tmpKeepCycle = $('#keepCycle').val();
		if(tmpKeepCycle == "") {
			$('#txtDeviceBarCode').val("");
			mui.toast("请选择保养周期~");
			return;
		}

		if(user_id == null) {
			var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
			user_id = currentSession.user_id;
			mac = Mac.address();

//			mac = "01:88:99:88:da";
//			user_id = "admin";
		}
		var data = {
			DeviceBarCode: tmpDeviceBarCode,
			KeepCycle: $('#keepCycle').val(),
			SeachTime: $('#datDate').val()
		};

		var result = ShareAjax("/MCSCAHCheck/DeviceBarCodeEnter", data, false, true, "");
		//失败处理
		if(result.status) {
			playerAudio("NG");
			$('#txtDeviceBarCode').val('').focus();
			mui.alert(result.message);
			return;
		}
		//重置值
		OperationalLogic.ShareHandle(result);
	},
	BtnHandle: function(btnType) {
		//保养周期与设备编码是否为""
		var tmpKeepCycle = $('#keepCycle').val();
		var tmpDeviceBarCode = $('#txtDeviceBarCode').val();
		if(tmpKeepCycle == '' || tmpDeviceBarCode == ''){
			Audio.playerAudio(Audio.type.NG,Audio.popupType.Toast,"请选择周期与设备编码后，再操作~", null);
			return;
		}
		
		var data = {
			DeviceBarCode: $('#txtDeviceBarCode').val(),
			KeepCycle: $('#keepCycle').val(),
			SeachTime: $('#datDate').val(),
			Mac: mac,
			Number: number,
			BtnType: btnType,
			LoginID: user_id,
			ReasonToNG: $('#info1').val() == null ? "" : $('#info1').val()
		};

		var result = ShareAjax("/MCSCAHCheck/ButtonTap", data, false, true, "");
		//失败处理
		if(result.status) {
			playerAudio("NG");
			mui.alert(result.message);
			return;
		}
		OperationalLogic.ShareHandle(result);
	},
	NGCheck: function() {
		if(mui("#NGCheck")[0].checked) {
			$("#txtInfo1").show().focus();
			$("#NGBtn").show();

		} else {
			$("#txtInfo1").hide();
			$("#NGBtn").hide();
		}
	},
	//	DateChange: function(e) {
	//		var result = mui("#datDate")[0];
	//		var picker = new mui.DtPicker({
	//			type: 'date'
	//		});
	//		picker.show(function(rs) {
	//			result.value = rs.text;
	//			picker.dispose();
	//			billDate = result.value;
	//		});
	//	},
	DateInit: function() {
		var dateTime = GetSysDateTime();
		CurdateTime = dateTime;
		DateTemp = new Date(dateTime.replace(/-/g, "/"));
		var hours = DateTemp.getHours();
		if(hours <= 7) {
			var t = billDate.getTime() - 1000 * 60 * 60 * 24;
			DateTemp = new Date(t);
		}
		billDate = formatDate(DateTemp);
	},
	ShareHandle: function(result) {
		//设置明细，设置信息显示
		var rows = result.data.Detail;
		var rowsLength = rows.length;
		var isEnd = "Y";

		$('#Detail').datagrid('loadData', rows);
		mui('#Detail-sum')[0].innerHTML = rowsLength;
		$('#info').val("");
		for(var i = 0, j = rowsLength; i < j; i++) {
			if("N" == rows[i]["IsCheckNo"]) {
				//				mui("#info")[0].value = "点检项目：\r\n" + rows[i]["CAH005"] + "\r\n衡量标准：\r\n" + rows[i]["CAH007"];
				document.getElementById('txtInfo').innerHTML = '<font color="red" size="3">&nbsp&nbsp点检项目:</font></br>&nbsp&nbsp<font size="3">' + rows[i]["CAH005"] + '</font></br><font color="red" size="3">&nbsp&nbsp衡量标准:</font></br>&nbsp&nbsp<font size="3">' + rows[i]["CAH007"] + '</font>';
				number = rows[i]["CAH001"];
				isEnd = "N";
				//				mui.toast("装载检查项成功~");
				break;
			}
		}
		if("Y" == isEnd) {
			mui.toast("此设备已检查完毕~");
			$('#txtDeviceBarCode').select();
		}

		playerAudio("OK");
	},
	DeleteData: function(LineNumber) {
		var data = {
			Number: LineNumber
		};

		var result = ShareAjax("/MCSCAHCheck/DeleteData", data, false, true, "");
		//失败处理
		if(result.status) {
			//			playerAudio("NG");
			mui.alert(result.message);
			return;
		}

		mui.toast("已删除选中的检测~ ");
		//清除明细
		if("" == LineNumber) {
			$('#Detail').datagrid('loadData', {
				total: 0,
				rows: []
			});
			mui('#Detail-sum')[0].innerHTML = 0;
		} else {
			//重刷
			OperationalLogic.deviceBarCodeEnter();
		}
	}
};

$(function() {
	OperationalLogic.init();
});

//mui.init({
//	beforeback: function() {　　
//		OperationalLogic.IsNeedDeleteDataCheck();
//		return true;
//	}
//});

//mui.plusReady(function() {
//	alert(plus.webview.currentWebview().id);
//});