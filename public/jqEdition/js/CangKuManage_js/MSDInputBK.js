/**
 * 湿敏元件——放入烤箱
 */
var currentSession;
var userid;
$("#barCode").focus();

mui.plusReady(function() {
	app.init();
	currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	userid = currentSession.user_id; 
	document.getElementById('userid').innerHTML = userid;
});

$("#result").hide();
$("#KaoXiang").hide();
$("#hongkao").hide();


var userPicker = new mui.PopPicker();
GetKaoXiang();

/**
 * {选择烤箱}
 */
document.getElementById("txtKaoXiang").addEventListener("click",
	function(e) {
		userPicker.show(function(items) {
			$('#txtKaoXiang').val(items[0]['value']);
			$("#KaoXiang").show();
			document.getElementById('BK').innerHTML = '烤箱名称：'+mui("#txtKaoXiang")[0].value;
			document.getElementById("BK").style.color="lightcoral";
		});
	});

/**
 * {获取烤箱}
 */
function GetKaoXiang() {
	$.ajax({
		url: app.API_URL_HEADER + "/MSDInputBK/GetKaoXiang",
		data: {
		},
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
}


/**
 * {扫描条码事件}
 */
document.getElementById("barCode").addEventListener("keydown",
	function(e) {
		if(e.keyCode != 13)
			return; //需要设置安卓PDA，在扫描内容的尾部自动添加回车符，便于自动化处理。
		var barCode = this.value.trim().toUpperCase();
		if(barCode.trim() == "") {
			mui.alert("请扫码条码");
			return false;
		}
		var temperature=mui("#txtWenDu")[0].value;
		var kaoxiang=mui("#txtKaoXiang")[0].value;
		if(kaoxiang.trim() == "") {
			mui.alert("请选择烤箱");
			return false;
		}
		$.ajax({
			url: app.API_URL_HEADER + "/MSDInputBK/InputBK",
			data: {
				barCode: barCode,
				temperature:temperature,
				kaoxiang:kaoxiang,
				userid:userid
			},
			dataType: "json",
			type: "post",
			async: false,
			success: function(data) {
				if(data.status == 0) {
					if(mui("#txtWenDu")[0].value=="")
					{
						mui("#txtWenDu")[0].value=data.data.temp;
					}
					$("#hongkao").show();
					document.getElementById('temp').innerHTML = '烘烤温度'+data.data.temp+'℃';
					document.getElementById('time').innerHTML = '烘烤时间'+data.data.times+'H';
					$("#result").show();
					document.getElementById('res').innerHTML = '处理成功！';
					document.getElementById("res").style.color="green";
				} else {
					$("#result").show();
					document.getElementById('res').innerHTML = '处理失败！';
					document.getElementById("res").style.color="red";
					mui.alert(data.message);
					return;
				}
			},
			error: function(xhr, type, errorThrown) {
				mui.alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
		$("#barCode").focus().val('');
		return true;
	});