var gongXuPicker; 
var linesPicker;
var buLiang;
var isZL=true;
var strRule;//空白条码前缀
var userid;
var SpanMsg;
mui.plusReady(function() {
	app.init();
	currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	userid = currentSession.user_id;
});

$(function(){
	//设置tabs属性
	$('#tabsid').tabs({
		onSelect: function(title, index) {
			clearData();
			setAttributes('');
			addAllClick();
			if(title == "指令") {
				isZL=true;
				//获取线别数据
				getLines();
			}
			if(title == "非指令") {
				isZL=false;
			}
		}
	});
	
	//如果是指令，则获取产线
	if(isZL){
		getLines();
	}
	
	//获取工序数据
	getGongXu();
	
	//获取不良项目
	getBuLiang();
	
	//获取送修条码规则
	getSXBarCodeRules();
	
	addAllClick();
	
	//送修条码回车
	$('#txtSXBarCode').keydown(function(e){
		if(e.keyCode !=13)
		    return;
		addAllClick();
		//1.当前条码已存在：①存在且已接收，提示【不能修改】；②存在单未接收，提示【是否需要修改】
		//2.当前条码不存在,先不做判断，点击确认时：检查是否符合送修条码的规则 || 是否符合自定义条码是规则（E作为前缀）
		//检查是否送修条码/条码是否已存在
		//当条码存在且未接收时，判断该条码是否时通过该模块发出的，区分指令和非指令
		checkIsExist();
	});
	
	//管制卡回车
	$('#txtGZKHao').keydown(function(e){
		if(e.keyCode !=13)
		    return;
		getGZKJingXing();
	});
	
	//点击确认按钮
	$('#btn_ok').click(function(){
		var b1 = checkInput()
		if(!b1){
			playerAudio('NG');
			return;
		}
		var b2 = checkSXBarCodeRules();
		if(!b2){
			playerAudio('NG');
			alert('送修条码不符合规则');
			return;
		}
		if($('#txtShuLiang').val() == '' || $('#txtShuLiang').val()<=0){
			playerAudio('NG');
			alert('数量不能为空且不能为0！');
			return;
		}
		//1.WOMQAI插入记录
		if(insWOMQAI())
			SaveNGMsg();   //保存不良信息
        addAllClick();
   		setAttributes('');
   
		//2.界面送修列表，新增行 --再说吧
		var index = getRowIndex($('#txtSXBarCode').val());
		if(index != -1)
			$('#dgWOMQAI').datagrid('deleteRow', index);  
		insRow();
		
		//清空文本数据,设置焦点
        clearData();
        $('#txtSXBarCode').focus();
		
	});
	
	//点击清除按钮
	$('#btn_clear').click(function(){
		clearData();
        addAllClick();	
		setAttributes('');
	});
	
	/*
	 * 不良项录入
	 */
	$("#btnAdd").click(function() {
		if(checkInput() == false)
			return;
		var extras = {
			curSXTiaoMa: $('#txtSXBarCode').val(),
			curGXHao: $("#txtGongXuID").val(),
			curGXMC: $("#txtGongXuMC").val()
		};
		newpage(this, extras);
	});
	window.addEventListener("pageflowrefresh", function(e) {
		//获得事件参数
		$('#txtShuLiang').val(e.detail.BLPShu);
		SpanMsg=e.detail.SpanMsg;
	});
});

//WOMQAI插入记录
function insWOMQAI(){
	$.ajax({
		url: app.API_URL_HEADER + '/SongXiu/InsWOMQAI',
		data: {
			QAI002:$('#txtSXBarCode').val(),
			QAI003:$('#txtGongXuID').val(),
			QAI004:$('#txtGongXuMC').val(),
			QAI005:$('#txtNextGongXuID').val(),
			QAI006:$('#txtNextGongXuMC').val(),
			QAI007:$('#txtLineID').val(),
			QAI008:isZL?$('#txtZhiLingID').val():$('#txtGZKHao').val(),
			QAI009:$('#txtJiXingID').val(),
			QAI012:$('#txtShuLiang').val(),
			QAI017:'',
//			QAI017:$('#txtBLCode').val(),
			user_id:userid
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			if(resdata.status == 1) {
				playerAudio('NG')
				alert(resdata.message);
				return false;
			}else{
				playerAudio('OK');
				mui.toast(resdata.message);
				return true;
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
			return false;
		}
	});
}

//通过管制卡获取机型
function getGZKJingXing(){
	if($('#txtGZKHao').val() == ''){
		mui.toast('管制卡不能为空!');
		return false;
	}
	$.ajax({
		url: app.API_URL_HEADER + '/SongXiu/GetGZKJingXing',
		data: {
			GZKHao:$('#txtGZKHao').val()
		},
		dataType: "json",
		type: "get",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			if(!resdata.status){
				$('#txtJiXingID').val(resdata.data.JingXing);
			}
			else{
				playerAudio('NG');
				mui.toast(resdata.message)
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//获取工序
function getGongXu(){
	gongXuPicker = new mui.PopPicker();
	//获取工序
	$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/GetGongXu',
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			dt = $.parseJSON(resdata.data);
			gongXuPicker.setData(dt);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//获取产线
function getLines(){
	linesPicker = new mui.PopPicker();
	//获取产线
	$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/GetLines',
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			dt = $.parseJSON(resdata.data);
			linesPicker.setData(dt);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//获取不良项目
function getBuLiang(){
	buLiang = new mui.PopPicker();
	//获取产线
	$.ajax({
		url: app.API_URL_HEADER + '/SongXiu/GetBuLiang',
		data: {},
		dataType: "json",
		type: "get",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			dt = $.parseJSON(resdata.data);
			buLiang.setData(dt);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//获取指令
function getZhiLing(){
	$.ajax({
		url: app.API_URL_HEADER + '/SongXiu/GetZhiLing',
		data: {
			Lines:$('#txtLineID').val()
		},
		dataType: "json",
		type: "get",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			if(!resdata.status){
				$('#txtZhiLingID').val(resdata.data.DAA001);
				$('#txtJiXingID').val(resdata.data.DAA014);
			}
			else{
				playerAudio('NG');
				mui.toast(resdata.message)
			}
			
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//产线选择
function txtLineID_click(){
	linesPicker.show(function(items) {
		$('#txtLineID').val(items[0]['value']);
		getZhiLing();
	});
}

//当前工序选择
function txtGongXuID_click(){
	gongXuPicker.show(function(items) {
		$('#txtGongXuID').val(items[0]['value']);
		$('#txtGongXuMC').val(items[0]['text']);
	});
}

//送修工序选择
function txtNextGongXuID_click(){
	gongXuPicker.show(function(items) {
		$('#txtNextGongXuID').val(items[0]['value']);
		$('#txtNextGongXuMC').val(items[0]['text']);
	});
}

//获取送修条码规则
function getSXBarCodeRules(){
	$.ajax({
		url: app.API_URL_HEADER + '/SongXiu/getSXBarCodeRules',
		data: {},
		
		dataType: "json",
		type: "get",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			if(resdata.status == 1) {
				playerAudio('NG');
				alert(resdata.message);
			}else{
				strRule = resdata.data;
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//检查管制卡规则
function checkSXBarCodeRules(){
	//直接判断管制卡号里是否存在产品型号
	if($('#txtSXBarCode').val().indexOf(strRule) == -1) {
//		mui.toast('管制卡对应的产品型号与机型不符，请核对！');
		$('#txtSXBarCode').focus().select();
		return false;
	}else{
		return true;
	}
}

//检查条码是否已存在送修单
function checkIsExist(){
	$.ajax({
		url: app.API_URL_HEADER + '/SongXiu/CheckIsExist',
		data: {
			QAI002:$('#txtSXBarCode').val()
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			if(resdata.status == 1) {
				playerAudio('NG');
				alert(resdata.message);
				clearData();
				$('#txtSXBarCode').focus();
				return false;
			}else if(resdata.status == -1){
				dt = $.parseJSON(resdata.data);
				if(isZL&&dt[0]['QAI007']==''){
					playerAudio('NG');
					mui.toast('已存在该送修单，且不是通过指令申请');
					return false;
				}
				if(!isZL&&dt[0]['QAI007']!=''){
					playerAudio('NG');
					mui.toast('已存在该送修单，且不是通过非指令申请');
					return false;
				}
				
				var bool = confirm(resdata.message);
				if(bool){
					playerAudio('OK');
					if(isZL){
						$('#txtLineID').val(dt[0]['QAI007']);
						$('#txtZhiLingID').val(dt[0]['QAI008']);
					}
					$('#txtGongXuID').val(dt[0]['QAI003']);
					$('#txtGongXuMC').val(dt[0]['QAI004']);
					$('#txtNextGongXuID').val(dt[0]['QAI005']);
					$('#txtNextGongXuMC').val(dt[0]['QAI006']);
					$('#txtJiXingID').val(dt[0]['QAI009']);
					$('#txtShuLiang').val(dt[0]['QAI012']);
//					$('#txtBLCode').val(dt[0]['QAI017']);
					//$('#txtShuLiang').focus().select();
					
					//事件移除
                    removeAllClick();
                    
                    //设置颜色
                    setAttributes('#777777');
				}else{
					clearData();
					$('#txtSXBarCode').focus();
					//设置颜色
                    setAttributes('');
				}
			}else{
				playerAudio('OK');
				//$('#txtShuLiang').focus();
				//设置颜色
                setAttributes('');
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//添加所有点击事件
function addAllClick(){
	if(isZL){
		document.getElementById("txtLineID").addEventListener("click", txtLineID_click, false);
	}
	document.getElementById("txtGongXuID").addEventListener("click", txtGongXuID_click, false);
	document.getElementById("txtNextGongXuID").addEventListener("click", txtNextGongXuID_click, false);
	//document.getElementById("txtBLCode").addEventListener("click", txtBLCode_click, false);
}

//移除所有的点击事件
function removeAllClick(){
	if(isZL){
		document.getElementById("txtLineID").removeEventListener("click", txtLineID_click, false);
	}
	document.getElementById("txtGongXuID").removeEventListener("click", txtGongXuID_click, false);
	document.getElementById("txtNextGongXuID").removeEventListener("click", txtNextGongXuID_click, false);
	//document.getElementById("txtBLCode").removeEventListener("click", txtBLCode_click, false);
}

//设置属性
function setAttributes(color){
	if(isZL){
		$("#txtLineID").css("background-color",color);
	}
	$("#txtGongXuID").css("background-color",color);
	$("#txtGongXuMC").css("background-color",color);
	$("#txtNextGongXuID").css("background-color",color);
	$("#txtNextGongXuMC").css("background-color",color);
    //$("#txtBLCode").css("background-color",color);
}

//列表插入行
function insRow(){
	$('#dgWOMQAI').datagrid('appendRow',{
		SongXiuGX: $('#txtNextGongXuID').val(),
		JiXing: $('#txtJiXingID').val(),
		ShuLiang: $('#txtShuLiang').val(),
		TiaoMa: $('#txtSXBarCode').val()
	});
}

//查找临时表中相同的送修单的位置
function getRowIndex(QAI002){
	var rows = $('#dgWOMQAI').datagrid("getRows");
	for (var i = 0; i < rows.length; i++) {
		if(QAI002 == rows[i]['TiaoMa'])
			return i;
	}
	return -1;
}

//检查文本框是否为空
function checkInput(){
	if(isZL){
		if($('#txtLineID').val() == ''){
			mui.toast('产线不能为空!');
			return false;
		}
		if($('#txtZhiLingID').val() == ''){
			mui.toast('生产指令不能为空!');
			return false;
		}
	}
	if($('#txtSXBarCode').val() == ''){
		mui.toast('送修条码不能为空!');
		return false;
	}
	if($('#txtGongXuID').val() == ''){
		mui.toast('当前工序不能为空!');
		return false;
	}
	if($('#txtNextGongXuID').val() == ''){
		mui.toast('投入工序不能为空!');
		return false;
	}
	if($('#txtJiXingID').val() == ''){
		mui.toast('机型不能为空!');
		return false;
	}
	return true;
}

//清空文本框
function clearData(){
	if(isZL){
		$('#txtLineID').val('');
		$('#txtZhiLingID').val('');
	}else{
		$('#txtGZKHao').val('');
	}
	$('#txtSXBarCode').val('');
	$('#txtGongXuID').val('');
	$('#txtGongXuMC').val('');
	$('#txtNextGongXuID').val('');
	$('#txtNextGongXuMC').val('');
	$('#txtJiXingID').val('');
	$('#txtShuLiang').val('0');
	SpanMsg='';
}

//保存不良信息
function SaveNGMsg() {
	$.ajax({
		url: app.API_URL_HEADER + '/SongXiu/SaveNGMsg',
		data: {
			SXTiaoMa: $("#txtSXBarCode").val(),
			GongXuID: $("#txtGongXuID").val(),
			GongXuMC: $("#txtGongXuMC").val(),
			SpanMsg: SpanMsg,
			UserID: app.userid,
			BLPShu: $("#txtShuLiang").val()
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 0) {
				playerAudio("OK");
				mui.toast('不良项提交成功！');
			} else {
				playerAudio("NG");
				mui.toast('不良项提交失败！');
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
			//			return false;
		}
	});
}