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
var Lines="";
$(function() {
	//$('#txtWenTiInfo').height($(window).height() - $('#info1').height() - $('#info3').height() - $('#info4').height() - $('#info5').height() - 125);
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

	//----------------------------以上为拍照处理-----------------------------
	DateInit();
	/**
	 * 日期切换事件
	 */
	$('#txtApplyDate').click(function() {
		ChangeDate();
	});

	var BanBiePicker = new mui.PopPicker();
	//获取线别
	$.ajax({
		url: app.API_URL_HEADER + '/IPQC/GetLines',
		data: {},
		dataType: "json",
		type: "post",
		success: function(resdata) {
			dt = resdata.data;
			BanBiePicker.setData(dt);
		},
		error: function(xhr, type, errorThrown) {
			alert("获取数据异常：" + JSON.stringify(errorThrown));
		}
	});
	//选择班别
	$('#txtBanBie').click(function() {
		BanBiePicker.show(function(items) {
			$('#txtBanBie').val(items[0]['text']);
			Lines=items[0]['value'];
			$('#txtBillNo').val('');
		});
	});

	var BillNoPicker = new mui.PopPicker();
	//选择单号
	$('#btnAdd').click(function() {
		//选择单号
		$.ajax({
			url: app.API_URL_HEADER + '/IPQC/GetBillNo',
			data: {
				BillDate: $('#txtApplyDate').val(),
				BanBie: Lines
			},
			dataType: "json",
			type: "post",
			success: function(resdata) {
				dt = resdata.data;
				BillNoPicker.setData(dt);
				BillNoPicker.show(function(items) {
					$('#txtBillNo').val(items[0]['value']);
					GetIPQCInfo(items[0]['value']);
				});
			},
			error: function(xhr, type, errorThrown) {
				alert("获取数据异常：" + JSON.stringify(errorThrown));
			}
		});

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
	$('#txtApplyDate').val(billDate);
}

/** 
 * {选择交易日期}
 */
function ChangeDate() {
	var result = mui("#txtApplyDate")[0];
	var picker = new mui.DtPicker({
		type: 'date'
	});
	picker.show(function(rs) {
		$('#txtApplyDate').val(rs.text);
		picker.dispose();
	});
};

function DelPic(target) {
	if(target.tagName == 'IMG' &&
		target.currentSrc.length > 0 &&
		document.getElementById(target.id).parentNode.id != 'photolist') {
		if(confirm('确定删除图片吗?')) {
			$.ajax({
				url: app.API_URL_HEADER + '/IPQC/DelPhoto',
				data: {
					Type:'Solution', 
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
		mui.toast('请选择IPQC单号！');
		$('#txtBillNo').focus();
		return false;
	}
	if($('#txtSolutionInfo').val() == '') {
		playerAudio('NG');
		mui.toast('请录入对策！');
		$('#txtSolutionInfo').focus();
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
	task.addData("BillNo", $('#txtBillNo').val());
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
function appendFile(p) {
	var n = p.substr(p.lastIndexOf('/') + 1);
	files.push({
		name: n,
		path: p
	});
	upload();
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

function SaveInfo() {
	$.ajax({
		url: app.API_URL_HEADER + '/IPQC/SaveSolutionInfo',
		data: {
			BillNo: $('#txtBillNo').val(),
			GongHao: app.userid,
			SolutionInfo: $('#txtSolutionInfo').val(),
			FileList: fileList
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

function GetIPQCInfo(BillNo) {
	$.ajax({
		url: app.API_URL_HEADER + '/IPQC/GetIPQCInfo',
		data: {
			BillNo: $('#txtBillNo').val()
		},
		dataType: "json",
		type: "post",
		success: function(res) {
			if(res.status == '0') {
				$('#txtWenTiInfo').val(res.data.info);
				console.log(res.data);
				var resfiles = res.data.FileCollect; //
				console.log(resfiles.length);
				var XPath = res.data.XPath;
				//---问题图片
				$("#photolist").html('');
				$(resfiles).each(function(index, item) {
					var src = app.API_URL + XPath + 'SLT' + item;
					var img = "<img id='" + item + "' class='m-pic-content m-pic' style='padding-left:5px' src='" + src + "' onclick='ShowLargeImg(this)'  />";
					$("#photolist").append(img);
				});
				$('#txtSolutionInfo').val(res.data.SolutionInfo);
				//---改善图片
				$("#insert").html('').append("<img id='photodefault' src='../../fonts/PhotoDefault.jpg' onclick='SelectPhoto()' />");
				var resSolutionfiles = res.data.SolutionFile;
				$(resSolutionfiles).each(function(index, item) {
					var src = app.API_URL + XPath + 'SLT' + item;
					var img = "<img id='" + item + "' class='m-pic-content m-pic' style='padding-left:5px' src='" + src + "' onclick='ShowLargeImg(this)'  />";
					$("#insert").append(img);
					files.push({
						name: item,
						path: item
					});
					fileList = fileList + item + "|";
				});
				console.log(fileList);
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