var gongXuPicker; 
var linesPicker; 
var jiXingPicker; 
var strRule;//空白条码前缀
$(function(){
	$('#txtGZKHao').focus();
	$('#txtGongXuID').val('1020');
	$('#txtGongXuMC').val('MRB');
	$('#txtJiXingID').val('26666D/A-Z/A');
	
//	insRow();

//  setAttributes();

	//获取工序数据
	getGongXu();
//	//获取线别数据
	getLines();
//	//获取机型数据
	getJiXing();
//	//获取空白条码前缀
	getGZKRules();
	
	addAllClick();
//	document.getElementById("txtNextGongXuID").removeEventListener("click", f, false);

	//管制卡回车
	$('#txtGZKHao').keydown(function(e){
		if(e.keyCode !=13)
		    return;
		//1.当前条码已存在：①存在且已接收，提示【不能修改】；②存在单未接收，提示【是否需要修改】
		//2.当前条码不存在,先不做判断，点击确认时：检查是否符合管制卡号的规则 || 是否符合自定义条码是规则（E作为前缀）
		
		//检查是否管制卡/条码是否已存在
		checkIsExist();
	});
	
	//点击确认按钮
	$('#btn_ok').click(function(){
		var b1 = checkInput()
		if(!b1){
			playerAudio('NG');
			return;
		}
		var b2 = checkGZKRules();
		if(!b2){
			playerAudio('NG');
			alert('管制卡与机型不匹配或条码不符合规则');
			return;
		}
		//1.WOMQAI插入记录
		insWOMQAI();
        addAllClick();
        
		//2.界面送修列表，新增行 --再说吧
		var index = getRowIndex($('#txtGZKHao').val());
		if(index != -1)
			$('#dgWOMQAI').datagrid('deleteRow', index);  
		insRow();
		
		//清空文本数据,设置焦点
        clearData();
        $('#txtGZKHao').focus();
		
	});
	
	//点击清除按钮
	$('#btn_clear').click(function(){
		clearData();
		$('#txtGZKHao').focus();
        addAllClick();	
//		
	});
	
});

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
//获取机型
function getJiXing(){
	jiXingPicker = new mui.PopPicker();
	//获取产线
	$.ajax({
		url: app.API_URL_HEADER + '/WeiXiu/GetJiXing',
		data: {},
		dataType: "json",
		type: "get",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			dt = $.parseJSON(resdata.data);
			jiXingPicker.setData(dt);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

function getGZKRules(){
	$.ajax({
		url: app.API_URL_HEADER + '/WeiXiu/getGZKRules',
		data: {},
		
		dataType: "json",
		type: "get",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			if(resdata.status == 1) {
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

//检查条码是否已存在出库单
function checkIsExist(){
	$.ajax({
		url: app.API_URL_HEADER + '/WeiXiu/CheckIsExist',
		data: {
			QAI002:$('#txtGZKHao').val()
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			if(resdata.status == 1) {
				playerAudio('NG');
				alert(resdata.message);
				clearData();
				$('#txtGZKHao').focus();
				addAllClick();
				return false;
			}else if(resdata.status == -1){
				playerAudio('OK');
				var bool = confirm(resdata.message);
				if(bool){
					dt = $.parseJSON(resdata.data);
					$('#txtNextGongXuID').val(dt[0]['QAI005']);
					$('#txtNextGongXuMC').val(dt[0]['QAI006']);
					$('#txtLineID').val(dt[0]['QAI007']);
					$('#txtJiXingID').val(dt[0]['QAI009']);
					$('#txtShuLiang').val(dt[0]['QAI012']);
					$('#txtShuLiang').focus().select();
					
					//事件移除
                    removeAllClick();
                    
                    //设置颜色
                    setAttributes('#777777');
				}else{
					clearData();
					$('#txtGZKHao').focus();
					addAllClick();
					//设置颜色
                    setAttributes('');
				}
			}else{
				playerAudio('OK');
				$('#txtShuLiang').focus();
				
				addAllClick();
				//设置颜色
                setAttributes('');
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//检查文本框是否为空
function checkInput(){
	if($('#txtGZKHao').val() == ''){
//		playerAudio('NG');
		mui.toast('管制卡/条码不能为空!');
		return false;
	}
	if($('#txtGongXuID').val() == ''){
//		playerAudio('NG');
		mui.toast('当前工序不能为空!');
		return false;
	}
	if($('#txtNextGongXuID').val() == ''){
//		playerAudio('NG');
		mui.toast('投入工序不能为空!');
		return false;
	}
	if($('#txtJiXingID').val() == ''){
//		playerAudio('NG');
		mui.toast('机型不能为空!');
		return false;
	}
	if($('#txtShuLiang').val() == '' || $('#txtShuLiang').val()<=0){
//		playerAudio('NG');
		mui.toast('数量不能为空且需大于0!');
		return false;
	}
	return true;
}

//检查管制卡规则
function checkGZKRules(){
	//直接判断管制卡号里是否存在产品型号
	if($('#txtGZKHao').val().indexOf($('#txtJiXingID').val()) == -1 && $('#txtGZKHao').val().indexOf(strRule) == -1) {
//		mui.toast('管制卡对应的产品型号与机型不符，请核对！');
		$('#txtGZKHao').focus().select();
		return false;
	}else{
		return true;
	}
}

//WOMQAI插入记录
function insWOMQAI(){
	$.ajax({
		url: app.API_URL_HEADER + '/WeiXiu/InsWOMQAI',
//		url: "http://localhost:27611/api" + '/WeiXiu/InsWOMQAI',
		data: {
			QAI002:$('#txtGZKHao').val(),
			QAI003:$('#txtGongXuID').val(),
			QAI004:$('#txtGongXuMC').val(),
			QAI005:$('#txtNextGongXuID').val(),
			QAI006:$('#txtNextGongXuMC').val(),
			QAI007:$('#txtLineID').val(),
			QAI009:$('#txtJiXingID').val(),
			QAI012:$('#txtShuLiang').val()
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			console.log(JSON.stringify(resdata));
			if(resdata.status == 1) {
				playerAudio('NG')
				alert(resdata.message);
			}else{
				playerAudio('OK');
				mui.toast(resdata.message);
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

//列表插入行
function insRow(){
	$('#dgWOMQAI').datagrid('appendRow',{
		SongXiuGX: $('#txtNextGongXuID').val(),
		JiXing: $('#txtJiXingID').val(),
		ShuLiang: $('#txtShuLiang').val(),
		TiaoMa: $('#txtGZKHao').val()
	});
}

//投入工序选择
function txtNextGongXuID_click(){
		gongXuPicker.show(function(items) {
		$('#txtNextGongXuID').val(items[0]['value']);
		$('#txtNextGongXuMC').val(items[0]['text']);
	});
}

//产线选择
function txtLineID_click(){
	linesPicker.show(function(items) {
		$('#txtLineID').val(items[0]['value']);
		//$('#txtNextGongXuMC').val(items[0]['value']);
	});
}

//机型选择
function txtJiXingID_click(){
    jiXingPicker.show(function(items) {
		$('#txtJiXingID').val(items[0]['text']);
	});
}

//添加所有点击事件
function addAllClick(){
	document.getElementById("txtNextGongXuID").addEventListener("click", txtNextGongXuID_click, false);
	document.getElementById("txtLineID").addEventListener("click", txtLineID_click, false);
	document.getElementById("txtJiXingID").addEventListener("click", txtJiXingID_click, false);
}

//移除所有的点击事件
function removeAllClick(){
	document.getElementById("txtNextGongXuID").removeEventListener("click", txtNextGongXuID_click, false);
	document.getElementById("txtLineID").removeEventListener("click", txtLineID_click, false);
	document.getElementById("txtJiXingID").removeEventListener("click", txtJiXingID_click, false);
}

function getRowIndex(QAI002){
	var rows = $('#dgWOMQAI').datagrid("getRows");
	for (var i = 0; i < rows.length; i++) {
		if(QAI002 == rows[i]['TiaoMa'])
			return i;
	}
	return -1;
}

//设置属性
function setAttributes(color){
	$("#txtNextGongXuID").css("background-color",color);
	$("#txtNextGongXuMC").css("background-color",color);
    $("#txtLineID").css("background-color",color);//"#777777"
    $("#txtJiXingID").css("background-color",color);
}

//清空文本框
function clearData(){
	$('#txtGZKHao').val('');
	$('#txtNextGongXuID').val('');
	$('#txtNextGongXuMC').val('');
	$('#txtLineID').val('');
//	$('#txtJiXingID').val('');--暂时不清吧，因为现在都是 26666
	$('#txtShuLiang').val('');
}