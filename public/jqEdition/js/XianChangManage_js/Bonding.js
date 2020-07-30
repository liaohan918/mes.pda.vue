/*
 * 接料——岳志鹏
 */

var userid;
mui.plusReady(function() {
	app.init();
	currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	userid = currentSession.user_id;
});

//设置tabs属性
$('#tabsid').tabs({
	height: $(window).height()-15
});

$(function() {
	$('#dg').datagrid({
		height: $(tabsid).height() - $("#box").height()-75
	}
		//{ data: GetData() } //初始化数据
	).datagrid('clientPaging', GetData);


	//获取产线编码和工单编码
	$.ajax({
		url: app.API_URL_HEADER + "/Bonding/GetLineInfo",
		//url: "http://localhost:27611/api/Bonding/GetLineInfo",
		data: {},
		dataType: "json",
		type: "post",
		async: false,
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			dt = $.parseJSON(resdata.data);
			var rows = [];
			userPicker.setData(dt);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
});

//document.getElementById('userid').innerHTML = currentSession;

var userPicker = new mui.PopPicker();
var userPicker2 = new mui.PopPicker();

/**
 * {扫描旧盘条码事件}
 */
document.getElementById("txtOldBarCode").addEventListener("keydown",
	function(e) {
		if(e.keyCode != 13)
			return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		var barCode = this.value.trim().toUpperCase();
		if(barCode.trim() == "") {
			//			plus.nativeUI.toast("条码输入不能为空",{verticalAlign:'center'});
			playerAudio("NG");
			mui.alert("请扫描旧盘条码");
			mui("#txtOldBarCode")[0].focus();
			mui("#txtOldBarCode")[0].select();
			return false;
		}
		$.ajax({
			url: app.API_URL_HEADER + "/Bonding/GetOldBarInfo",
			//url: "http://localhost:27611/api/Bonding/GetOldBarInfo",
			data: {
				barCode: barCode
			},
			dataType: "json",
			type: "post",
			async: false,
			success: function(data) {
				if(data.status == 0) {
					//					plus.nativeUI.toast(data.data,{verticalAlign:'center'});
					mui("#info")[0].value = data.data.info;
					$("#txtOldBarCode").attr("readonly", "readonly");
					$("#txtNewBarCode").removeAttr("readonly").select().focus();
					playerAudio("OK");
				} else {
					playerAudio("NG");
					mui.alert(data.message);
                    mui("#txtOldBarCode")[0].focus();
					mui("#txtOldBarCode")[0].select();
					return;
				}
			},
			error: function(xhr, type, errorThrown) {
				playerAudio("NG");
				alert("获取数据异常：" + JSON.stringify(errorThrown));
                mui("#txtOldBarCode")[0].focus();
				mui("#txtOldBarCode")[0].select();
			}
		});
		return true;
	});

/**
 * {扫描新盘条码事件}
 */
document.getElementById("txtNewBarCode").addEventListener("keydown",
	function(e) {
		if(e.keyCode != 13)
			return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		var barCode = this.value.trim().toUpperCase();
		if(barCode.trim() == "") {
			//			plus.nativeUI.toast("条码输入不能为空",{verticalAlign:'center'});
			mui.alert("请扫描新盘条码");
			playerAudio("NG");
			mui("#txtNewBarCode")[0].focus();
			mui("#txtNewBarCode")[0].select();
			return false;
		}
		$.ajax({
			url: app.API_URL_HEADER + "/Bonding/GetNewBarInfo",
			//url: "http://localhost:27611/api/Bonding/GetNewBarInfo",
			data: {
				barCode: barCode,
				userid: userid,
				info: mui("#info")[0].value
			},
			dataType: "json",
			type: "post",
			async: false,
			success: function(data) {
				if(data.status == 0) {
//					document.getElementById('position').innerHTML = data.data.position;--左右两边都可以扫吧，不限制相同飞达了
					mui("#info")[0].value = data.data.infomation;
					$("#txtNewBarCode").attr("readonly", "readonly");
					$("#txtBarCode").removeAttr("readonly").select().focus();
					playerAudio("OK");
				} else {
					mui.alert(data.message);
					playerAudio("NG");
                    mui("#txtNewBarCode")[0].focus();
					mui("#txtNewBarCode")[0].select();
					return;
				}
			},
			error: function(xhr, type, errorThrown) {
				playerAudio("NG");
				alert("获取数据异常：" + JSON.stringify(errorThrown));
                mui("#txtNewBarCode")[0].focus();
				mui("#txtNewBarCode")[0].select();
			}
		});
		return true;
	});

/**
 * {扫描左/右物料条码事件}
 */
document.getElementById("txtBarCode").addEventListener("keydown",
	function(e) {
		if(e.keyCode != 13)
			return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
//		var barCode = this.value.trim().toUpperCase();
//			var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
			var neighborBarCode = this.value.trim().toUpperCase();
			var newBarCode = $("#txtNewBarCode").val();
			var oldBarCode = $("#txtOldBarCode").val();
		if(neighborBarCode.trim() == "") {
			mui.alert("请扫描左边或者右边的物料条码");
			playerAudio("NG");
            mui("#txtBarCode")[0].focus();
			mui("#txtBarCode")[0].select();
			return false;
		}
		$.ajax({
//			url: app.API_URL_HEADER + "/Bonding/GetBarInfo",
			url: app.API_URL_HEADER + "/Bonding/GetNeighborBarInfo",	
			//url: "http://localhost:27611/api/Bonding/GetBarInfo",
//			url: "http://localhost:27611/api/Bonding/GetNeighborBarInfo",	
			data: {
				oldBarCode:oldBarCode,
				newBarCode:newBarCode,
//				barCode: barCode,
				neighborBarCode:neighborBarCode,
				user_id:userid,
//              user_id:"G98138"
			},
			dataType: "json",
			type: "post",
			async: false,
			success: function(data) {
				if(data.status == 0) {
					mui.toast(data.message);
					$("#txtBarCode").val("").attr("readonly", "readonly");
					$("#txtNewBarCode").val("").attr("readonly", "readonly");
					$("#txtOldBarCode").removeAttr("readonly").select().focus();
					playerAudio("OK");
				} else {
					mui.alert(data.message);
					playerAudio("NG");
 					mui("#txtBarCode")[0].focus();
					mui("#txtBarCode")[0].select();
					return;
				}
			},
			error: function(xhr, type, errorThrown) {
				playerAudio("NG");
				alert("获取数据异常：" + JSON.stringify(errorThrown));
				mui("#txtBarCode")[0].focus();
				mui("#txtBarCode")[0].select();
			}
		});
		return true;
	});

/*
 * 上一步按钮
 */
document.getElementById("btn_Last").addEventListener("click",
	function(e) {
		if($('#txtOldBarCode').attr('readonly') == "readonly" && $('#txtNewBarCode').attr('readonly') != "readonly") { // 显示 
			$("#txtOldBarCode").removeAttr("readonly").select().val("").focus();
			$("#txtNewBarCode").val("").attr("readonly", "readonly");
		} else if($('#txtNewBarCode').attr('readonly') == "readonly") {
			$("#txtNewBarCode").removeAttr("readonly").select().val("").focus();
			$("#txtBarCode").val("").attr("readonly", "readonly");
		}
	});

/**
 * {选择产线编码}
 */
document.getElementById("lineNo").addEventListener("click",
	function(e) {
		userPicker.show(function(items) {
			$('#lineNo').val(items[0]['value']);
			GetWOInfo();
		});
	});

function GetWOInfo() {
	$.ajax({
		url: app.API_URL_HEADER + "/Bonding/GetWOInfo",
		//url: "http://localhost:27611/api/Bonding/GetWOInfo",
		data: {
			line: $("#lineNo").val()
		},
		dataType: "json",
		type: "post",
		async: false,
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			dt = $.parseJSON(resdata.data);
			var rows = [];
			userPicker2.setData(dt);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

/**
 * {选择工单编码}
 */
document.getElementById("workOrder").addEventListener("click",
	function(e) {
		userPicker2.show(function(items) {
			$('#workOrder').val(items[0]['value']);
			var line = mui("#lineNo")[0].value;
			var workOrder = mui("#workOrder")[0].value;
			if(line.trim() == "") {
				mui.alert("请选择产线编码");
				playerAudio("NG");
				return false;
			}
			//		if(workOrder.trim() == "") {
			//			mui.alert("请选择工单编码");
			//			return false;
			//		}
			GetData();
		});
	});

function GetData() {
	//以下才是以后要的实际操作
	$('#dg').datagrid('loadData', GetInfo());
};

function GetInfo() {
	var dgData = {};
	$.ajax({
		url: app.API_URL_HEADER + "/Bonding/GetInfo", //获取数据:调用webApi服务路径
		//url: "http://localhost:27611/api/Bonding/GetInfo",
		data: {
			paging: true, //是否分页
			pageSize: $('#dg').datagrid('options').pageSize, //页容量
			pageNumber: $('#dg').datagrid('options').pageNumber, //初始化页码
			keys: 'RTB007,RTB008,RTB009,RTB010,RTB011', //分页主键
			line: $("#lineNo").val(), //语句查询参数3 ：jquery
			workOrder: $("#workOrder").val()
		},
		dataType: "json", //数据类型
		type: "post", //"get" 请求方式
		async: false, //是否异步
		success: function(data) { //成功后操作，返回行集合(data)
			if(data.status == 0) {
				var rows = [];
				$.each(data.data.tbData, function(index, item) { //遍历，整理数据
					rows.push({ //将行数据添加(push)到rows对象
						RTB014: item['RTB014'],
						RTB010: item['RTB010'],
						RTB011: item['RTB011'],
						RTB012: item['RTB012'],
						RTB013: item['RTB013'],
						RTB015: item['RTB015'],
						RTB016: item['RTB016'],
						RTB017: item['RTB017'],
						RTB018: item['RTB018'],
						RTB019: item['RTB019'],
						RTB020: item['RTB020'],
						RTB021: item['RTB021'],
						RTB022: item['RTB022'],
						RTB023: item['RTB023'],
					});
				});
				dgData.rows = rows;
				dgData.sumDataNo = data.data.sum;
				if(data.data.sum<=0)
				{
					mui.toast("此指令编码不存在接料预警!");
				}
			} else {
				mui.alert(data.message);
			}
		},
		error: function(xhr, type, errorThrown) { //请求异常，抛出异常，处理异常
			//console.log(errorThrown);
			playerAudio("NG");
			alert("获取数据异常：" + JSON.stringify(errorThrown)); //弹框提示异常信息
		}
	});
	return dgData;
}

/**
 * 设置tabs的显示隐藏,除了传过来的tab,其他都隐藏
 * 先舍去~
 * @param {需要显示的tab标题} tbsName
 */
//function SetTabState(tbsName) {
//	$('#tabsid').tabs('enableTab', tbsName); // 启用选项卡面板	
//	$('#tabsid').tabs('select', tbsName); // 启用选项卡面板
//	var tabs = $('#tabsid').tabs('tabs');
//	$.each(tabs, function(index, item) {
//		var title = item.panel('options').title;
//		if(title == tbsName)
//			return true;
//		$('#tabsid').tabs('disableTab', title); //禁用选项卡面板
//	});
//}