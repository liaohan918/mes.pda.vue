/*
作者：黄邦文
时间：2019-07-16
描述：IPQC申请
 */
var localurl;
var files = [];
var fileList = "";
var GongXuID = "";
var CPMC = "";

mui.plusReady(function() {
	mui.init({
		gestureConfig: {
			tap: true, //默认为true
			doubletap: true, //默认为false
			longtap: true, //默认为false
			swipe: true, //默认为true
			drag: true, //默认为true
			hold: false, //默认为false，不监听
			release: false //默认为false，不监听
		}
	});
	document.addEventListener('longtap', function(e) {
		var target = e.target;
		DelPic(target);
	});
	DateInit();
});
$(function(){ 
	//设置时间
	SetTime();
	//设置人眼
	SetWorkers(); 
	//设置产线
	SetLine();
	console.log("4");
	//设置工单
	SetOrder();
	//设置判定
	SetReuslt();
	//设置上传
	SetImgUp();
	//刷新页面
	$('#btnCancel').click(function(e) {
		e.preventDefault();
		location.reload();
	});

	//提交数据
	$('#btnSubmit').click(function(e) {
		e.preventDefault();
		if(CheckData() == false)
			return;
		var d = {};
		var t = $("#formSub").serializeArray();
		console.log(t);
		$.each(t, function() {
		  d[this.name] = this.value;
		});
		d.fileList = fileList;
		var data  = JSON.stringify(d);
		$.post(app.API_URL_HEADER + '/IQCPBA/add',data,function(result){
			console.log(result);
			if(result.status==0){
				playerAudio("OK");
				alert("添加成功");
			}else{
				playerAudio("NG");
				alert(result.message);
			}
		},"json")
	});

});

function SetTime(){
	//获取系统日期
	var dateTime = GetSysDateTime();
	DateTemp = new Date(dateTime.replace(/-/g, "/"));
	billDate = formatDate(DateTemp);
	var dataWorkers = null;
	//设置默认检验日期
	$("#txtCheckTime").val(billDate);
	//检验日期点选
	$("#txtCheckTime").click(function(){ 
		var dtpicker=new mui.DtPicker({"type":"date"}); 
		dtpicker.show(function(items){ 
			$("#txtCheckTime").val(items.text);
			dtpicker.dispose();
		}); 
	});
	//自动生成检验单号
	var billNo = GetMaxBillNO('6110', formatDate(billDate)); //获取单据编号
	console.log(billNo);
	$("#txtBillNo").val(billNo);
} 
function SetWorkers(){
	var PopPicker=new mui.PopPicker(); 
	 $.ajax({
	 	url: app.API_URL_HEADER + '/IQCPBA/GetWorkers',
	 	data: {},
	 	dataType: "json",
	 	type: "post",
	 	success: function(resdata) { 
	 		dataWorkers = $.parseJSON(resdata.data);
	 		PopPicker.setData(dataWorkers);
	 	},
	 	error: function(xhr, type, errorThrown) {
	 		alert("获取数据异常：" + JSON.stringify(errorThrown));
	 	}
	 });
	$("#txtCheckWorker").click(function(){  
		PopPicker.show(function(items){ 			 
			$("#txtCheckWorker").val(items[0].text); 
		}); 
	});
}
function SetLine(){
	var LinePicker = new mui.PopPicker();
	//获取产线
	$.ajax({
		url: app.API_URL_HEADER + '/IQCPBA/GetLines',
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			dt = $.parseJSON(resdata.data);
			LinePicker.setData(dt);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
	//选择产线
	$('#txtLineID').click(function() {
		LinePicker.show(function(items) { 
			$('#txtLineID').val(items[0]['value']);
		});
	});
}
function SetOrder(){
	var OrderPicker = new mui.PopPicker(); 
	//选择产线
	$('#txtOrderID').click(function() {
		var line = $('#txtLineID').val();
		if(line==null || line == undefined || line == ""){
			mui.alert('请先选择产线才能获取到生产指令', '温馨提示'); 
			return;
		}
		//获取工单
		$.ajax({
			url: app.API_URL_HEADER + '/IQCPBA/GetOrdersByLine',
			data: {
				line : line
			},
			dataType: "json",
			type: "post",
			success: function(resdata) {
				dt = $.parseJSON(resdata.data);
				OrderPicker.setData(dt);
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});
		OrderPicker.show(function(items) {  
			$('#txtOrderID').val(items[0]['value']);
			$('#txtCusID').val(items[0]['DAA003']);
			$('#txtPdNum').val(items[0]['DAA014']);
			$('#txtPdName').val(items[0]['DAA015']);
			$('#txtPdSpec').val(items[0]['DAA016']); 
			$('#txtCusOrder').val(items[0]['DAA059']); 
		});
	});
}
function SetReuslt(){
	var ResultPicker = new mui.PopPicker(); 
	ResultPicker.setData([
		{
                        value: 'OK',
                        text: '合格'
                    }, {
                        value: 'NG',
                        text: '不合格'
                    } 
		]);
	$("#txtResult").click(function(){
		ResultPicker.show(function(items) {  
			$('#txtResult').val(items[0]['value']); 
		});
	});
}
function SetImgUp(){
	$("#photodefault").click(function(){
		//alert("ok");
		console.log("拍照");
		SelectPhoto();
	});
}
/**
 * {获取日期}
 */
function DateInit() {
	var dateTime = GetSysDateTime();
	DateTemp = new Date(dateTime.replace(/-/g, "/"));
	billDate = formatDate(DateTemp);
	$('#txtApplyDate').val(billDate); //dateTime.substring(0,16)
	billNo = GetMaxBillNO('6110', formatDate(billDate)); //获取单据编号
	$("#txtBillNo").val(billNo);
//MOD 20200414 G98139 这个方法找不到
//	GetNameByGongHao(app.userid(), $('#txtApplyerNo'), $('#txtApplyerNo'));
}
 
function DelPic(target) {
	if(target.tagName == 'IMG' && target.currentSrc.length > 0) {
		if(confirm('确定删除图片吗?')) {
			$.ajax({
				url: app.API_URL_HEADER + '/IPQC/DelPhoto',
				data: {
					BillNo: $('#txtBillNo').val(),
					FileName: target.id
				},
				dataType: "json",
				type: "post",
				success: function(resdata) {
					console.log(JSON.stringify(resdata));
					if(resdata.status == 0) {
						files.forEach(function(item, index, arr) {
							if(item.name == target.id) {
								arr.splice(index, 1);
								fileList = fileList.replace(item.name + "|", '');
								var child = document.getElementById(target.id);
								child.parentNode.removeChild(child);
								//								child = document.getElementById("li" + target.id);
								//								child.parentNode.removeChild(child);								
								mui.toast('图片删除成功！');
								playerAudio("OK");
							}
						});
					}
				},
				error: function(xhr, type, errorThrown) {
					playerAudio("NG");
					alert("获取数据异常：" + JSON.stringify(errorThrown));
				}
			});
		}
	}
};

//检查数据是否录完整
function CheckData() {
	if($('#txtBillNo').val() == '') {
		playerAudio('NG');
		mui.toast('单据号不能为空！');
		$('#txtBillNo').focus();
		return false;
	} 
	if($('#txtCheckTime').val() == '') {
		playerAudio('NG');
		mui.toast('检验时间不能为空！');
		$('#txtCheckTime').focus();
		return false;
	}
	if($('#txtCheckWorker').val() == '') {
		playerAudio('NG');
		mui.toast('检验人员不能为空！');
		$('#txtCheckWorker').focus();
		return false;
	} 
	if($('#txtLineID').val() == '') {
		playerAudio('NG');
		mui.toast('生产线别不能为空！');
		$('#txtLineID').focus();
		return false;
	}
	if($('#txtOrderID').val() == '') {
		playerAudio('NG');
		mui.toast('生产指令不能为空！');
		$('#txtOrderID').focus();
		return false;
	}
	if($('#txtResult').val() == '') {
		playerAudio('NG');
		mui.toast('判定结果不能为空！');
		$('#txtResult').focus();
		return false;
	}
}

// 上传文件 
function upload() {
	//	if(files.length <= 0) {
	//		plus.nativeUI.alert("没有添加上传文件！");
	//		return;
	//	} 
	console.log("开始上传：");
	var server = app.API_URL_HEADER + '/IPQC/UploadFiles';
	var wt = plus.nativeUI.showWaiting();
	var task = plus.uploader.createUpload(server, {
			method: "POST"
		},
		function(t, status) { //上传完成
			console.log(JSON.stringify(t));
			if(status == 200) {
				console.log("上传成功：" + t.responseText);
				var res = JSON.parse(t.responseText);
				var resfiles = res.data.FileCollect;
				console.log(resfiles);
				var XPath = res.data.XPath;
				$(resfiles).each(function(index, item) {
					var src = app.API_URL + XPath + 'SLT' + item;
					var img = "<img id='" + item + "' class='m-pic-content m-pic' style='padding-left:5px' src='" + src + "' onclick='ShowLargeImg(this)'  />";
					$("#insert").append(img);
					fileList = fileList + item + "|";
				});
				wt.close();
			} else {
				console.log("上传失败：" + status);
				wt.close();
			}
		}
	);
	var f = files[files.length - 1];
	task.addFile(f.path, {
		key: f.name
	});
	task.start();
}
// 拍照添加文件
function appendByCamera() {
	plus.camera.getCamera().captureImage(function(p) {
		appendFile(p);
	});
}
// 从相册添加文件
function appendByGallery() {
	plus.gallery.pick(function(p) {
		appendFile(p);
	});
}

// 添加文件
var index = 1;

function appendFile(p) {
	//var fe = document.getElementById("files");
	//var li = document.createElement("li");
	var n = p.substr(p.lastIndexOf('/') + 1);
	//li.innerText = n;
	//li.id = 'li' + n;
	//fe.appendChild(li);
	files.push({
		name: n,
		path: p
	});
	upload();
	//index++;
	//empty.style.display = "none";
}
// 产生一个随机数 
function getUid() {
	return Math.floor(Math.random() * 100000000 + 10000000).toString();
}
//显示大图片
function ShowLargeImg(obj) {
	var src = $(obj).attr("src").replace('SLT', '');
	console.log(src);
	var large_image = '<img src= ' + src + '></img>';
	$('#dialog_large_image').html($(large_image).animate({
		height: '100%',
		width: '100%'
	}, 500));
	$('#dialog_large_image').css('display', 'block');
}
//大图片不显示
function ClearImg() {
	$('#dialog_large_image').css('display', 'none');
}
//选择图片方式
function SelectPhoto() {
	console.log("拍照")
	if(mui.os.plus) {
		var a = [{
			title: "拍照"
		}, {
			title: "从手机相册选择"
		}];
		plus.nativeUI.actionSheet({
			title: "选择拍照方式",
			cancel: "取消",
			buttons: a
		}, function(b) { /*actionSheet 按钮点击事件*/
			switch(b.index) {
				case 0:
					break;
				case 1:
					appendByCamera(); /*拍照*/
					break;
				case 2:
					appendByGallery(); /*打开相册*/
					break;
				default:
					break;
			}
		})
	}
} 