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
var GW="";
var WGType="";

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
$(function() {
	//----------------------------以上为拍照处理-----------------------------

	var userPicker = new mui.PopPicker();
	//获取工序
//	$.ajax({
//		url: app.API_URL_HEADER + '/IPQC/GetGongXu',
//		data: {
//			cpbm: $('#txtCPBM').val()
//		},
//		dataType: "json",
//		type: "post",
//		success: function(resdata) {
//			console.log(JSON.stringify(resdata));
//			dt = $.parseJSON(resdata.data);
//			userPicker.setData(dt);
//		},
//		error: function(xhr, type, errorThrown) {
//			alert("获取数据异常：" + JSON.stringify(errorThrown));
//		}
//	});
	//选择工序
	$('#txtGongXuName').click(function() {
		if($('#txtLineID').val()==''){
			playerAudio("NG");
			alert("请先选择线别！");
			return;
		}
		if($('#txtCPBM').val()==''){
			playerAudio("NG");
			alert("请先选择产品型号！");
			return;
		}
		userPicker.show(function(items) {
			$('#txtGongXuName').val(items[0]['text']);
			GongXuID = items[0]['value'];
			$('#txtBanBie').val('');
			$.ajax({
				url: app.API_URL_HEADER + '/IPQC/GetGongWei',
				data: {
					scxb: $('#txtLineID').val(),
					gxid: GongXuID
				},
				dataType: "json",
				type: "post",
				success: function(resdata) {
					dt = resdata.data; //$.parseJSON(resdata.data);
					BanBiePicker.setData(dt);
				},
				error: function(xhr, type, errorThrown) {
					alert("获取数据异常：" + JSON.stringify(errorThrown));
				}
			});
		});
	});
	var CPBMPicker = new mui.PopPicker();
	var LinePicker = new mui.PopPicker();
	//获取产线
	$.ajax({
		url: app.API_URL_HEADER + '/GongXuBaoGong/GetLines',
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
			$('#txtLineName').val(items[0]['text']);
			$('#txtLineID').val(items[0]['value']);
			$('#txtSCGD').val('');
			$('#txtCPBM').val('');
			$('#txtGongXuName').val('');
			$('#txtBanBie').val('');
		});
	});

	var BanBiePicker = new mui.PopPicker();
	//获取班别
//	$.ajax({
//		url: app.API_URL_HEADER + '/IPQC/GetBanBie',
//		data: {},
//		dataType: "json",
//		type: "post",
//		success: function(resdata) {
//			dt = resdata.data; //$.parseJSON(resdata.data);
//			BanBiePicker.setData(dt);
//		},
//		error: function(xhr, type, errorThrown) {
//			alert("获取数据异常：" + JSON.stringify(errorThrown));
//		}
//	});
	//选择班别
	$('#txtBanBie').click(function() {
		if($('#txtLineID').val()==''){
			playerAudio("NG");
			alert("请先选择线别！");
			return;
		}
		if($('#txtGongXuName').val()==''){
			playerAudio("NG");
			alert("请先选择工序！");
			return;
		}
		BanBiePicker.show(function(items) {
			$('#txtBanBie').val(items[0]['text']);
			GW=items[0]['value'];
		});
	});

	var WeiGuiTypePicker = new mui.PopPicker();
	//获取违规类别
	$.ajax({
		url: app.API_URL_HEADER + '/IPQC/GetWeiGuiType',
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			dt = resdata.data;
			WeiGuiTypePicker.setData(dt);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
	//选择违规类别
	$('#txtWeiGuiLeiBie').click(function() {
		WeiGuiTypePicker.show(function(items) {
			$('#txtWeiGuiLeiBie').val(items[0]['text']);
			WGType=items[0]['value'];
		});
	});

	//选择产品型号
	$('#btnAdd').click(function() {
		//获取产品型号
		$.ajax({
			url: app.API_URL_HEADER + '/IPQC/GetCPBMByLine',
			data: {
				scxb: $('#txtLineID').val()
			},
			dataType: "json",
			type: "post",
			success: function(resdata) {
				dt = resdata.data;
				CPBMPicker.setData(dt);
				CPBMPicker.show(function(items) {
					$('#txtCPBM').val(items[0]['value']);
					$('#txtSCGD').val(items[0]['DAA001']);
					$('#txtLineID').val(items[0]['DAA042']);
					$('#txtLineName').val(items[0]['MIH004']);
					$('#txtGongXuName').val('');
					$('#txtBanBie').val('');
					CPMC = items[0]['value'];
					$.ajax({
						url: app.API_URL_HEADER + '/IPQC/GetGongXu',
						data: {
							cpbm: CPMC
						},
						dataType: "json",
						type: "post",
						success: function(resdata) {
							console.log(JSON.stringify(resdata));
							dt = $.parseJSON(resdata.data);
							userPicker.setData(dt);
						},
						error: function(xhr, type, errorThrown) {
							alert("获取数据异常：" + JSON.stringify(errorThrown));
						}
					});
				});
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});

	});
	//录入违规人姓名
	$('#txtWeiGuiName').keypress(function(e) {
		if(e.keyCode != 13) return;
		GetGongHaoByName($('#txtWeiGuiName').val(), $('#txtWeiGuiName'), $('#txtWeiGuiNo'));
		$('#txtZeRenName').focus();
	});
	//录入责任者姓名
	$('#txtZeRenName').keypress(function(e) {
		if(e.keyCode != 13) return;
		GetGongHaoByName($('#txtZeRenName').val(), $('#txtZeRenName'), $('#txtZeRenNo'));
	});

	//刷新页面
	$('#btnReset').click(function() {
		var _page = plus.webview.currentWebview();
		if(_page) {
			_page.reload(true);
		}
	});

	//提交数据
	$('#btnSubmit').click(function() {
		if(CheckData() == false)
			return;
		SaveInfo();
	});

});
 
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
	GetNameByGongHao(app.userid, $('#txtApplyerNo'), $('#txtApplyerNo'));
}

function GetNameByGongHao(GongHao, obj1, obj2) {
	//获取员工姓名
	$.ajax({
		url: app.API_URL_HEADER + '/IPQC/GetNameByGongHao',
		data: {
			GongHao: GongHao
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 0) {
				obj2.val(resdata.data);
			} else {
				playerAudio('NG');
				mui.toast(resdata.message);
				obj1.val('').focus();
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

function GetGongHaoByName(Name, obj1, obj2) {
	//获取员工姓名
	$.ajax({
		url: app.API_URL_HEADER + '/IPQC/GetGongHaoByName',
		data: {
			Name: Name
		},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			if(resdata.status == 0) {
				obj2.val(resdata.data);
			} else {
				playerAudio('NG');
				mui.toast(resdata.message);
				obj1.val('').focus();
			}
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}

function DelPic(target) {
	if(target.tagName == 'IMG' && target.currentSrc.length > 0) {
		if(confirm('确定删除图片吗?')) {
			$.ajax({
				url: app.API_URL_HEADER + '/IPQC/DelPhoto',
				data: {
					Type:Apply,
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
	if($('#txtCPBM').val() == '') {
		playerAudio('NG');
		mui.toast('请录入产品型号！');
		$('#txtCPBM').focus();
		return false;
	}
	if($('#txtGongXuName').val() == '') {
		playerAudio('NG');
		mui.toast('请录入工序！');
		$('#txtGongXuName').focus();
		return false;
	}
	if($('#txtBanBie').val() == '') {
		playerAudio('NG');
		mui.toast('请录入工位！');
		$('#txtBanBie').focus();
		return false;
	}
	if($('#txtWeiGuiName').val() != '' && $('#txtWeiGuiNo').val() == '') {
		playerAudio('NG');
		mui.toast('违规人姓名有误！');
		$('#txtWeiGuiName').focus().select();
		return false;
	}
	if($('#txtZeRenName').val() == '') {
		playerAudio('NG');
		mui.toast('请录入责任人姓名！');
		$('#txtZeRenName').focus();
		return false;
	}
	if($('#txtZeRenName').val() != '' && $('#txtZeRenNo').val() == '') {
		playerAudio('NG');
		mui.toast('责任人姓名有误！');
		$('#txtZeRenName').focus().select();
		return false;
	}

	if($('#txtWeiGuiLeiBie').val() == '') {
		playerAudio('NG');
		mui.toast('请录入违规类别！');
		$('#txtWeiGuiLeiBie').focus();
		return false;
	}
	if($('#txtWenTiInfo').val() == '') {
		playerAudio('NG');
		mui.toast('请录入问题描述！');
		$('#txtWenTiInfo').focus();
		return false;
	}
}

// 上传文件 
function upload() {
	//	if(files.length <= 0) {
	//		plus.nativeUI.alert("没有添加上传文件！");
	//		return;
	//	}
	//if(CheckData()==false) return;

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
	task.addData("BillNo", $('#txtBillNo').val());
	//	task.addData("ApplyerId", app.userid);
	//	task.addData("ApplyerNo", $('#txtApplyerNo').val());
	//	task.addData("ApplyDate", $('#txtApplyDate').val());
	//	task.addData("LineID", $('#txtLineID').val());
	//	task.addData("LineName", $('#txtLineName').val());
	//	task.addData("CPBM", $('#txtCPBM').val());
	//	task.addData("CPMC", CPMC);
	//	task.addData("GongXuID", GongXuID);
	//	task.addData("GongXuName", $('#txtGongXuName').val());
	//	task.addData("BanBie", $('#txtBanBie').val());
	//	task.addData("WeiGuiNo", $('#txtWeiGuiNo').val());
	//	task.addData("WeiGuiName", $('#txtWeiGuiName').val());
	//	task.addData("ZeRenNo", $('#txtZeRenNo').val());
	//	task.addData("ZeRenName", $('#txtZeRenName').val());
	//	task.addData("WenTiLevel", $('input[name="radio1"]:checked').val());
	//	task.addData("WeiGuiLeiBie", $('#txtWeiGuiLeiBie').val());
	//	task.addData("WenTiInfo", $('#txtWenTiInfo').val());

	//	for(var i = 0; i < files.length; i++) {
	//		var f = files[i];
	//		task.addFile(f.path, {
	//			key: f.name //,
	//			//mime:"image/jpeg" 
	//		}); 
	//	}
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

function SaveInfo(GZKList) {

	$.ajax({
		url: app.API_URL_HEADER + '/IPQC/SaveData',
		data: {
			BillNo: $('#txtBillNo').val(),
			ApplyerId: app.userid,
			ApplyerNo: $('#txtApplyerNo').val(),
			ApplyDate: $('#txtApplyDate').val(),
			LineID: $('#txtLineID').val(),
			LineName: $('#txtLineName').val(),
			CPBM: $('#txtCPBM').val(),
			CPMC: CPMC,
			GongXuID: GongXuID,
			GongXuName: $('#txtGongXuName').val(),
			BanBie: GW,
			WeiGuiNo: $('#txtWeiGuiNo').val(),
			WeiGuiName: $('#txtWeiGuiName').val(),
			ZeRenNo: $('#txtZeRenNo').val(),
			ZeRenName: $('#txtZeRenName').val(),
			WenTiLevel: $('input[name="radio1"]:checked').val(),
			WeiGuiLeiBie: WGType,
			WenTiInfo: $('#txtWenTiInfo').val(),
			fileList: fileList,
			SCGD: $('#txtSCGD').val()
		},
		dataType: "json",
		type: "post",
		success: function(res) {
			if(res.status == '0') {
				playerAudio('OK');
				mui.toast('数据提交成功!');
			} else {
				playerAudio('NG');
				mui.toast('数据提交失败!' + res.message);
			}

		},
		error: function(xhr, type, errorThrown) {
			playerAudio('NG');
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
}