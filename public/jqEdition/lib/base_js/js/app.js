/**
 * APP全局配置
 */
app = {};

(function() {
	/**
	 * MES系统中维护的APP系统编号
	 */
	app.APP_Sys_Number = "APPSYS";

	/**
	 * 多语言库路径
	 */
	app.MULTILINGUAL_PATH = "YSMES.app/i18n/";

	/**
	 * 应用名称
	 */
	app.APP_NAME = "com.shintech.MES";

	/**
	 * 应用中文名称
	 */
	app.APP_NAME_CN = "新络MES";

	/**
	 * 登陆配置(login)
	 */
	app.CONFIG_LOGIN = "login";

	/**
	 * 当前会话配置(current_session)
	 */
	app.CONFIG_CURRENT_SESSION = "current_session";

	/**
	 * 服务的地址
	 */
//	app.API_URL = "http://10.6.0.82:8080";
	app.API_URL = "http://183.60.111.155:43244/api";
//	app.API_URL = "http://localhost:27611/";

	/**
	 * 接口服务的地址头
	 */
//	app.API_URL_HEADER = "http://10.6.0.82:8080/api";
	app.API_URL_HEADER = "http://183.60.111.155:43244/api";
//	app.API_URL_HEADER = "http://localhost:27611/api";

	/**
	 * 接口服务的地址头
	 */
//	app.API_URL_HEADER_BACK = "http://10.6.0.82:8080/api";
	app.API_URL_HEADER_BACK = "http://183.60.111.155:43244/api";
//	app.API_URL_HEADER_BACK = "http://localhost:27611/api";
	
	/**
	 * 接口方法：执行存储过程
	 */
	app.API_METHOD_ESP = "/b/esp";
	
	/**
	 * 执行系统数据库存储过程
	 */
	app.API_METHOD_SYSAPI_ESP = "/SYSApi/esp";

	/**
	 * 接口方法：获取PDF盘点票
	 */
	app.API_METHOD_TEST = "/b/test";

	/**
	 * 接口方法：检查APP更新
	 */
	app.API_CHECK_APP_UPDATE = "http://6xjj.shinnet.cn:9999/system/api/b/CheckAppUpdate";

	/**
	 * 接口方法：检查APP更新
	 */
	app.API_CHECK_APP_UPDATE_BACK = "http://10.0.0.13:9999/system/api/b/CheckAppUpdate";
	//发送请求前触发 2020-02-17 杨俊燃
	$.ajaxSetup({
		beforeSend: function(request) //设置自定义标头
		{
			var Factory = "MES";
			if (typeof plus != "undefined" && plus.storage.getItem("Factory")!=null) {
				Factory = plus.storage.getItem("Factory");
			} 
//			console.log(Factory);
			request.setRequestHeader("Factory", Factory); //选择的账套
		}
	});

	/**
	 * 应用默认配置
	 */
	app.defaultconfig = {
		login: {
			account: "",
			password: "",
			autologin: false
		},
		message: {

		}
	};

	app.init = function(callback, firstRun) {

		//检查网络连接 plus.networkinfo.CONNECTION_NONE == 1时代表内外网都没连上
		if (plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE) {
			plus.nativeUI.alert("没有网络连接，请开启网络连接后再使用。", function() {
				plus.runtime.quit();
			}, app.APP_NAME_CN);
		}

		if (firstRun) {
			console.log("API服务器网络检查中...");
			//判断网络类型并修改服务器地址
			app.showWaiting("正在侦测网络...");
			mui.ajax(app.API_URL_HEADER + app.API_METHOD_TEST, {
				data: {},
				async: true,
				dataType: "json",
				type: "post",
				timeout: 2000,
				success: function(resp) {
					console.log(JSON.stringify(resp));
					if (callback) callback("外网");
					//保存网络检查结果
					var currentSession = JSON.parse(plus.storage.getItem(app.CONFIG_CURRENT_SESSION)) || {};
					currentSession.networktype = "外网";
					console.log(JSON.stringify(currentSession));
					plus.storage.setItem(app.CONFIG_CURRENT_SESSION, JSON.stringify(currentSession));

					app.closeWaiting();
					console.log("外网success");
				},
				error: function(xhr, type, errorThrown) {
					console.log(app.API_URL_HEADER_BACK + app.API_METHOD_TEST);
					mui.ajax(app.API_URL_HEADER_BACK + app.API_METHOD_TEST, {
						data: {},
						async: true,
						dataType: "json",
						type: "post",
						timeout: 2000,
						success: function(resp) {
							console.log("内网success");
							console.log(JSON.stringify(resp));
							app.API_URL_HEADER = app.API_URL_HEADER_BACK;
							app.API_CHECK_APP_UPDATE = app.API_CHECK_APP_UPDATE_BACK;
							if (callback) callback("内网");
							//保存网络检查结果
							var currentSession = JSON.parse(plus.storage.getItem(app.CONFIG_CURRENT_SESSION)) || {};
							currentSession.networktype = "内网";
							console.log(JSON.stringify(currentSession));
							plus.storage.setItem(app.CONFIG_CURRENT_SESSION, JSON.stringify(currentSession));

							app.closeWaiting();
						},
						error: function(xhr, type, errorThrown) {
							app.closeWaiting();
							console.log("外网fail+内网fail");
							plus.nativeUI.alert("网络不通，请检查网络。", null, app.APP_NAME_CN);
						}
					});
				}
			});
		} else {
			console.log("API服务器网络无需检测！！！！");
			var currentSession = JSON.parse(plus.storage.getItem(app.CONFIG_CURRENT_SESSION));
			console.log(JSON.stringify(currentSession));
			if (currentSession.networktype == "内网") {
				app.API_URL_HEADER = app.API_URL_HEADER_BACK;
				app.API_CHECK_APP_UPDATE = app.API_CHECK_APP_UPDATE_BACK;
				if (callback) callback("内网");
			} else {
				if (callback) callback("外网");
			}
		}

	}

	/**
	 * 保存配置
	 * @param {String} key 配置名称
	 * @param {JSObject} configjsonobject 配置内容
	 */
	app.saveconfig = function(key, configjsonobject) {
		if (configjsonobject == undefined || configjsonobject == null) {
			return;
		}
		plus.storage.setItem(key, JSON.stringify(configjsonobject));
	};

	/**
	 * 加载应用程序配置
	 * @param {String} key 配置名称
	 * @example var config = app.loadconfig(app.CONFIG_LOGIN);
	 * @return {JSObject}        
	 */
	app.loadconfig = function(key) {
		if (typeof plus != "undefined")
			return JSON.parse(plus.storage.getItem(key));
		return "";
	};
	/* 
	登陆用户
	*/
	app.userid = function() {
		var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
		if (currentSession == "")
			return "admin"
		return currentSession.user_id;
	}

	/*
	 * 当前选择的多语言
	 */
	app.multilingual = function() {
		var m = app.loadconfig("multilingual");
		if (m == "")
			return "CN" //默认中文
		return m;
	}

	/**
	 * 移除应用程序配置
	 * @param {String} key 配置名称
	 * @example app.removeconfig(app.CONFIG_LOGIN); 
	 */
	app.removeconfig = function(key) {
		return plus.storage.removeItem(key);
	};

	app.showWaiting = function(title) {
		var waiting_title = title || "请稍候";
		if (plus) {
			return plus.nativeUI.showWaiting(waiting_title, {
				background: "rgba(100,100,100,0.8)",
				padding: "50px",
				size: "20px",
				loading: {
					display: "inline"
				}
			});
		}
	}

	app.closeWaiting = function() {
		if (plus) {
			plus.nativeUI.closeWaiting();
		}
	}

	/**
	 * 格式化JSON为便于显示输出的格式
	 * @param {JSObject,String} json 可以是字符串也可以是对象
	 * @return {String}
	 */
	app.formatJSON = function(json) {
		var jsonStr = "";
		if (json.constructor == String) {
			jsonStr = json;
		} else if (json.constructor == Object) {
			jsonStr = JSON.stringify(json);
		}
		var res = "";
		for (var i = 0, j = 0, k = 0, ii, ele; i < jsonStr.length; i++) {
			//k:缩进，j:""个数
			ele = jsonStr.charAt(i);
			if (j % 2 == 0 && ele == "}") {
				k--;
				for (ii = 0; ii < k; ii++) ele = "    " + ele;
				ele = "\n" + ele;
			} else if (j % 2 == 0 && ele == "{") {
				ele += "\n";
				k++;
				for (ii = 0; ii < k; ii++) ele += "    ";
			} else if (j % 2 == 0 && ele == ",") {
				ele += "\n";
				for (ii = 0; ii < k; ii++) ele += "    ";
			} else if (ele == "\"") j++;
			res += ele;
		}
		return res;
	};

	//日期格式化函数
	Date.prototype.format = function(format) {
		var o = {
			"M+": this.getMonth() + 1, //month 
			"d+": this.getDate(), //day 
			"h+": this.getHours(), //hour 
			"m+": this.getMinutes(), //minute 
			"s+": this.getSeconds(), //second 
			"q+": Math.floor((this.getMonth() + 3) / 3), //quarter 
			"S": this.getMilliseconds() //millisecond 
		}
		if (/(y+)/.test(format)) {
			format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		}
		for (var k in o) {
			if (new RegExp("(" + k + ")").test(format)) {
				format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
			}
		}
		return format;
	};

	String.prototype.endWith = function(endStr) {
		var d = this.length - endStr.length;
		return (d >= 0 && this.lastIndexOf(endStr) == d)
	}

	/****
	 * 比较版本，查看是否有更新
	 * @param {String} oldVersion
	 * @param {String} newVersion
	 */
	app.HasUpdate = function(oldVersion, newVersion) {
		var oldVersion_filled, newVersion_filled;
		var a, b, c, tmp;
		if (oldVersion.indexOf(".") > 0) {
			a = oldVersion.substring(0, oldVersion.indexOf("."));
			b = oldVersion.substring(oldVersion.indexOf(".") + 1, oldVersion.length);
			if (b.indexOf(".") > 0) {
				tmp = b.substring(0, b.indexOf("."));
				c = b.substring(b.indexOf(".") + 1, b.length);
				b = tmp;
			} else {
				c = "0";
			}
		} else {
			a = oldVersion;
			b = "0";
			c = "0";
		}
		a = new Array(4 - a.length + 1).join("0") + a;
		b = new Array(4 - b.length + 1).join("0") + b;
		c = new Array(4 - c.length + 1).join("0") + c;
		oldVersion_filled = a + b + c;
		if (newVersion.indexOf(".") > 0) {
			a = newVersion.substring(0, newVersion.indexOf("."));
			b = newVersion.substring(newVersion.indexOf(".") + 1, newVersion.length);
			if (b.indexOf(".") > 0) {
				tmp = b.substring(0, b.indexOf("."));
				c = b.substring(b.indexOf(".") + 1, b.length);
				b = tmp;
			} else {
				c = "0";
			}
		} else {
			a = oldVersion;
			b = "0";
			c = "0";
		}
		a = new Array(4 - a.length + 1).join("0") + a;
		b = new Array(4 - b.length + 1).join("0") + b;
		c = new Array(4 - c.length + 1).join("0") + c;
		newVersion_filled = a + b + c;
		return newVersion_filled > oldVersion_filled;
	};

	app.isPAD = function() {
		if (navigator.userAgent.toUpperCase().indexOf("ANDROID") > -1) {
			return navigator.userAgent.toUpperCase().indexOf("MOBILE") == -1;
		} else {
			return navigator.userAgent.toUpperCase().indexOf("PAD") > -1;
		}
	};
}());
