mui.init({
	//下拉刷新、上拉加载
	//	pullRefresh: {
	//		container: "#login_body", //下拉刷新容器标识，querySelector能定位的css选择器均可，比如：id、.class等
	//		down: {
	//			style: 'circle', //必选，下拉刷新样式，目前支持原生5+ ‘circle’ 样式
	//			color: '#2BD009', //可选，默认“#2BD009” 下拉刷新控件颜色
	//			height: '50px', //可选,默认50px.下拉刷新控件的高度,
	//			range: '100px', //可选 默认100px,控件可下拉拖拽的范围
	//			offset: '0px', //可选 默认0px,下拉刷新控件的起始位置
	//			auto: true, //可选,默认false.首次加载自动上拉刷新一次
	//			callback: pullfresh //必选，刷新函数，根据具体业务来编写，比如通过ajax从服务器获取新数据；
	//		}
	//	}
});

function pullfresh() {
	//	app.init();
	//alert("刷新");loader
};

if (app.isPAD()) {
	mui(".mui-content")[0].classList.add("pad");
} else {
	mui(".mui-content")[0].classList.add("app");
};

//自定义变量
waitingDialog = null;
downloadProgress = 0;
//plus ready.
mui.plusReady(function() {
	//读取本地存储，检查是否为首次启动，进行展示指南
	// var showGuide = plus.storage.getItem("lauchFlag");
	// if(!showGuide) {
	// 	mui.openWindow({
	// 				id: 'guide',
	// 				url: 'guide.html',
	// 				styles: {
	// 					popGesture: "none"
	// 				},
	// 				show: {
	// 					aniShow: 'none'
	// 				},
	// 				waiting: {
	// 					autoShow: false
	// 				}
	// 			});
	// }

	// var firstRun=false;
	mui("#title")[0].innerHTML = app.APP_NAME_CN;
	mui("#emp_no")[0].focus();
	AppInit();
	//console.log("login");
	console.log("AppID:"+plus.runtime.appid)
	plus.runtime.getProperty(plus.runtime.appid, function(appinfo) {
		console.log("成功获取App信息")
		document.getElementById("appversion").innerText = appinfo.version;
	});

	var FactoryPicker = new mui.PopPicker(); //账套选择
	/**
	 * 获取用户名字、账套
	 */
	document.getElementById("emp_no").addEventListener("DOMFocusOut", function() {
		if (document.getElementById("emp_no").value == "") return;
		// console.log(app.API_URL_HEADER + app.API_METHOD_SYSAPI_ESP);		
		mui.ajax(app.API_URL_HEADER + app.API_METHOD_SYSAPI_ESP, {
			data: {
				spname: "APP_GetUserName",
				returnvalue: 1,
				_sp_UserNumber: document.getElementById("emp_no").value
			},
			dataType: "json",
			type: "post",
			timeout: 0,
			success: function(resp) {
				if (resp.status != 0) {
					mui("#emp_no")[0].focus();
					plus.nativeUI.alert(resp.message, null, app.APP_NAME_CN);
				} else {
					if (resp.data.length > 0) {
						document.getElementById("emp_name").value = resp.data[0].PAA002;
					}
				}
			},
			error: function(xhr, type, errorThrown) {
				plus.nativeUI.toast("无法连接到服务器。");
			}
		});
		//动态设置账套 2020-02-17 杨俊燃
		$.ajax({
			url: app.API_URL_HEADER + app.API_METHOD_SYSAPI_ESP,
			data: {
				spname: "APP_GetFactory",
				returnvalue: 1,
				_sp_UserNumber: document.getElementById("emp_no").value
			},
			dataType: "json",
			type: "post",
			success: function(data) {
				var Factory = document.getElementById('txtFactory');
				FactoryPicker.setData(data.data);
				FactoryPicker.pickers[0].setSelectedValue(plus.storage.getItem("Factory"));
				Factory.value = FactoryPicker.pickers[0].getSelectedText() || "";
				plus.storage.setItem("FactoryName", FactoryPicker.pickers[0].getSelectedText() || "");
				plus.storage.setItem("Factory", FactoryPicker.pickers[0].getSelectedValue() || "");
				Factory.addEventListener('tap', function(e) {
					FactoryPicker.pickers[0].setSelectedValue(plus.storage.getItem("Factory"), 1000);
					FactoryPicker.show(function(items) {
						var text = items[0].text;
						if (Factory.value == text)
							return;
						Factory.value = text ? text : "";
						plus.storage.setItem("Factory", items[0].value);
						plus.storage.setItem("FactoryName", items[0].text);
					});
				});

			},
			error: function(xhr, type, errorThrown) {
				plus.nativeUI.toast("无法连接到服务器。");
			}
		});
	});

	/**
	 * 账号回车事件
	 */
	document.getElementById("emp_no").addEventListener("keydown",
		function(e) {
			if (e.keyCode != 13) return;
			mui("#password")[0].focus();
		});

	/**
	 * 登录
	 */
	document.getElementById("button_login").addEventListener("click",
		function() {
			ExecuteLogin();
		});

	/**
	 * 输入好密码后回车登陆操作
	 */
	document.getElementById("password").addEventListener("keydown",
		function(e) {
			if (e.keyCode != 13) return;
			ExecuteLogin();

		});

	//关闭启动屏幕
	plus.navigator.closeSplashscreen();
});

/**
 * 登陆操作
 */
function ExecuteLogin() {
	var Factory = plus.storage.getItem("Factory");
	if (typeof Factory == "undefined" || Factory == null || Factory == "") {
		plus.nativeUI.toast("请选择帐套！");
		return;
	}
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	//缓存用户账号  杨俊燃 2018年11月7日17:14:10
	var emp_no = document.getElementById("emp_no").value;
	plus.storage.setItem("UserID", emp_no);

	//当前选择的语言 杨俊燃  2019-07-09 12:46
	//	var multilingual = document.getElementById("txtMultilingual").value;
	//	plus.storage.setItem("Multilingual", multilingual);

	//console.log('登陆进行记住账号操作:' + emp_no);

	mui.ajax(app.API_URL_HEADER + app.API_METHOD_SYSAPI_ESP, {
		data: {
			spname: "APP_Login",
			returnvalue: 1,
			_sp_UserNumber: emp_no,
			_sp_Password: document.getElementById("password").value
		},
		dataType: "json",
		type: "post",
		timeout: 0,
		success: function(resp) {
			//console.log(JSON.stringify(resp));
			if (resp.status != 0) {
				plus.nativeUI.alert(resp.message, null, app.APP_NAME_CN);
			} else {
				//记录登录信息
				currentSession = currentSession || {};
				currentSession.user_id = emp_no;
				currentSession.user_name = document.getElementById("emp_name").value;
				//console.log(app.formatJSON(currentSession));
				app.saveconfig(app.CONFIG_CURRENT_SESSION, currentSession);

				//跳转到主页
				var target_page = plus.webview.getWebviewById("index");
				if (!target_page) {
					target_page = mui.preload({ //openWindow
						url: "index.html",
						id: "index",
						styles: {
							popGesture: "none"
						},
						show: {
							autoShow: false
						}
					});
				}
				if (target_page) {
					target_page.show("slide-in-right", 200);
				};
			}
		},
		error: function(xhr, type, errorThrown) {
			plus.nativeUI.toast("无法连接到服务器。");
		}
	});
}

/**
 * APP初始化，检查更新
 */
function AppInit() {
	app.init(
		function(networktype) {
			//console.log(networktype);
			document.getElementById("networktype").innerText = networktype;
			//查看是否有记住用户账号，如果有记住默认使用该账号 杨俊燃 2018年11月7日17:18:20
			var recordUserID = plus.storage.getItem("UserID");
			if (recordUserID) {
				document.getElementById("emp_no").value = recordUserID;
				mui("#emp_no")[0].select();
				//console.log('记住的账号' + recordUserID);
			}

			//检查更新
			setTimeout(function() {
				var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
				var user_id = 1;
				if (currentSession && currentSession.login && currentSession.login.usersysid) {
					user_id = currentSession.login.usersysid;
				}
				plus.runtime.getProperty(plus.runtime.appid, function(appinfo) {
					var data = {
						PRA001: app.APP_Sys_Number
					};
					var responseData =
						AjaxOperation(data, "获取APP版本信息", true, "/MESPDABase/CheckAPPUpdate");
					
					if (!responseData.state) {
						//console.log("结果失败" + JSON.stringify(responseData));
						return;
					}
					//console.log("结果成功" + appinfo.version + "=" + responseData.data.data.appVersion + "=" + JSON.stringify(responseData));
					if (appinfo.version != responseData.data.data.appVersion) {
						//console.log("版本不同进行更新操作" + JSON.stringify(appinfo) + '1111' + JSON.stringify(responseData.data.data.appVersion));
						if (confirm('检测到新版本,是否立即更新？')) {
							downWgt();
						}
						//return;
					}

					//检测语言库版本是否一致
					var M_Version = plus.storage.getItem("MultilingualVersion"); //当前语言版本
					if (M_Version) {
						//console.log("存在语言库，检测版本是否一致" + M_Version + "=" + responseData.data.data.MultilingualVersion);
						//存在语言库，检测版本不一致
						if (M_Version != responseData.data.data.MultilingualVersion) {
							//重新写入语言库
							GetMultilingual();
						}
					} else {
						//console.log("没有记录过语言库重新写入语言库");
						//没有记录过语言库重新写入语言库
						GetMultilingual();
					}
					//记录语言库版本
					plus.storage.setItem("MultilingualVersion", responseData.data.data.MultilingualVersion);

				});
			}, 1000);
		}, true);
};

// 下载wgt文件
var wgtUrl = app.API_URL + "/_downloads/update.wgt";

function downWgt() {
	plus.nativeUI.showWaiting("下载wgt文件...");
	plus.downloader.createDownload(wgtUrl, {
		filename: "_doc/update/"
	}, function(d, status) {
		if (status == 200) {
			//console.log("下载wgt成功：" + d.filename);
			installWgt(d.filename); // 安装wgt包
		} else {
			//console.log("下载wgt失败！");
			plus.nativeUI.alert("下载wgt失败！");
		}
		plus.nativeUI.closeWaiting();
	}).start();
}

// 更新应用资源
function installWgt(path) {
	plus.nativeUI.showWaiting("安装wgt文件...");
	plus.runtime.install(path, {
		force: true
	}, function() {
		plus.nativeUI.closeWaiting();
		//console.log("安装wgt文件成功！");
		plus.nativeUI.alert("应用资源更新完成！", function() {
			plus.runtime.restart();
		});
	}, function(e) {
		plus.nativeUI.closeWaiting();
		//console.log("安装wgt文件失败[" + e.code + "]：" + e.message);
		plus.nativeUI.alert("安装wgt文件失败[" + e.code + "]：" + e.message);
	});
}

/**
 * 开始下载任务
 * @param {要下载文件资源地址} url
 * @param {下载任务的参数} fileName
 */
function startTask(url, fileName) {
	var task = plus.downloader.createDownload(url, {
		filename: fileName
	});
	task.addEventListener("statechanged", onstatechanged);
	waitingDialog = app.showWaiting("准备下载");
	task.start();
}

/**
 * 下载进度
 * @param {Object} d
 * @param {Object} s
 */
function onstatechanged(d, s) {
	if (d.state == 4) {
		if (s == 200) {
			if (mui.os.android && d.filename.substr(d.filename.length - 3, 3) == "apk") {
				plus.runtime.install(d.filename, {
					force: true
				});
				if (waitingDialog) waitingDialog.close();
			} else {
				plus.runtime.install(d.filename, {
					force: true
				}, function() {
					//plus.nativeUI.closeWaiting();
					if (waitingDialog) waitingDialog.close();
					plus.runtime.restart();
				}, function(e) {
					if (waitingDialog) waitingDialog.close();
					plus.nativeUI.toast("资源更新失败：" + e.message);
					alert("资源更新失败：" + e.message);
				});
			}
		} else {
			waitingDialog.close();
			plus.nativeUI.toast("下载更新失败");
		}
	} else {
		if (d.totalSize > 0) {
			if (parseInt(d.downloadedSize * 100 / d.totalSize) % 5 == 0 && downloadProgress != parseInt(d.downloadedSize * 100 /
					d.totalSize)) {
				downloadProgress = parseInt(d.downloadedSize * 100 / d.totalSize);
				////console.log(d.filename);
				if (downloadProgress > 100) {
					downloadProgress = downloadProgress - 100;
				}
				if (waitingDialog) waitingDialog.setTitle("已下载:" + downloadProgress + "%");
			}
		}
	}
};

/**
 * 重新写入语言库
 */
function GetMultilingual() {
	var responseData =
		AjaxOperation({}, "获取APP语言库信息", true, "/MESPDABase/GetMultilingual");

	$(responseData.data.data.list).each(function(index, item) {
		//		alert(JSON.stringify(item));
		//		alert(app.MULTILINGUAL_PATH + item.name + '.properties');
		plus.io.requestFileSystem(plus.io.PRIVATE_DOC, function(fs) {
			fs.root.getFile(app.MULTILINGUAL_PATH + item.name + '.properties', {
					create: true
				},
				function(fileEntry) {
					fileEntry.file(function(file) {
						var fileWrite = new plus.io.FileWriter;
						fileEntry.createWriter(function(fileWrite) {
							//console.log("开始写入");
							fileWrite.seek(0);
							fileWrite.write(item.strings);
							//console.log("结束写入");
							//读文件 
							//fileWrite.onwrite = function(e) {
							//	//console.log("Write data success!");
							//	var fileReader = new plus.io.FileReader();
							//	//console.log("getFile:" + JSON.stringify(file));
							//	fileReader.readAsText(file, 'utf-8');
							//	fileReader.onloadend = function(evt) {
							//		//console.log("输出结果" + evt.target.result);
							//	}
							//}
						})
					});
				});
		});
	});
	loadProperties(plus.storage.getItem("Multilingual") || "CN");
}
