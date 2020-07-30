var lineData = {
		rows: [],
		sumDataNo: 0
};
//当前时间（服务器）
var nowDate; 
//当次选择的计划时间（防止多余的请求数据）
var lastSelect = "";
//被选择的行
var checkRows;
//设备保养编号选择器
var billPicker; 
//保养类别选择器
var careTypePicker;
//保养周期选择器
var careCyclePicker;

var currentSession;
//登录人ID
var user_id;
//var user_id = "AAAA";
mui.plusReady(function() {
	app.init();
	currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
    user_id = currentSession.user_id;
});
/**
 * 窗口初始化
 */
$(function(){	
	$("#edtCAH001").focus();	
	
    billPicker = new mui.PopPicker();
    careTypePicker = new mui.PopPicker();
    careCyclePicker = new mui.PopPicker();
	//获得未保养的保养计划
	getMCSCAHUnCare();
    //保养编码点击事件
	$('#edtCAH001').click(function() {
		billPicker.show(function(items) {
			var tempCAH001 = $('#edtCAH001').val();
			if(tempCAH001 != items[0]['text']){
				formReset();
				$('#edtCAH001').val(items[0]['text']);
				getMCSCAHDetail(items[0]['text']);
			}
		});
	});
});

//获得未保养的保养编号
function getMCSCAHUnCare(){
	$.ajax({
		url:app.API_URL_HEADER + "/MCSCAH/getMCSCAHUnCare",
		data : {},
		success : function(resdata){
			if(resdata.status == 1){
				return;
			}
			var dt = $.parseJSON(resdata.data);
			billPicker.setData(dt);
		},
		error:function(xhr, type, errorThrown){
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//获得设备保养编号相关明细
function getMCSCAHDetail(billNo){
	$.ajax({
		url:app.API_URL_HEADER + "/MCSCAH/getMCSCAHDetail",
		data : {
			billNo:billNo
		},
		success : function(resdata){
			if(resdata.status == 1){
				return;
			}
			var dt = $.parseJSON(resdata.data);
			$('#edtCAH002').val(dt[0].CAH002);//设备编号
			$('#edtCAH003').val(dt[0].CAH003);//设备名称
			$('#edtCAH004').val(dt[0].CAH004);//设备型号
			$('#edtCAH011').val(dt[0].BaoYangType);//保养类别
			$('#edtCAC011').val(dt[0].CAC011);//产线编号
			$('#edtCAH006').val(dt[0].BaoYangPeriod);//保养周期
			$('#edtCAH005').val(dt[0].CAH005);//保养项目
			$('#edtCAH007').val(dt[0].CAH007);//保养要求		
		},
		error:function(xhr, type, errorThrown){
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//提交表单
function commit(){
	var billNo = $('#edtCAH001').val();//保养编号
	if(billNo == ""){
		alert('请选择设备保养编号');
		playerAudio("NG");
		return;	
	}
	var radios = document.getElementsByName('CAH008');
	var careResult = "OK";//保养结果
	for (var i = 0, length = radios.length; i < length; i++) {
		if (radios[i].checked) {
			// 弹出选中值
			careResult = radios[i].value;
			// 选中后退出循环
			break;
		}
	}
	var appearance = $('#edtCAH012').val();//发生现象
	var doMethod = $('#edtCAH013').val();//处理方法
	$.ajax({
		url:app.API_URL_HEADER + "/MCSCAH/UpdateMCSCAH",
		data : {
			userId : user_id,
			billNo : billNo,
			appearance : appearance,
			doMethod : doMethod,
			careResult : careResult
		},
		success : function(resdata){
			if(resdata.status == 1){
				mui.toast("提交失败:" + resdata.message);
				playerAudio("NG");
				return;
			}			
			mui.toast("提交成功");
			playerAudio("OK");	
			formReset();
			getMCSCAHUnCare();
			return;
		},
		error:function(xhr, type, errorThrown){
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//重置表单
function formReset(){
  document.getElementById("form").reset()
}
	      