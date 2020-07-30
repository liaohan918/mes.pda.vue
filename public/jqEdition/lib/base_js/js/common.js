//*******************************************
//初始化控件操作

initScrollWrapper();

/**
 * 使用区域滚动组件，需手动初始化scroll控件
 */
function initScrollWrapper() {
		mui('.mui-scroll-wrapper').scroll({
			scrollY: true, //是否竖向滚动
			scrollX: false, //是否横向滚动
			startX: 0, //初始化时滚动至x
			startY: 0, //初始化时滚动至y
			indicators: true, //是否显示滚动条
			deceleration: 0.0004, //阻尼系数,系数越小滑动越灵敏
			bounce: true //是否启用回弹
		});
}

//*******************************************
//窗口操作等

/**
 *  选项卡点击事件
 */
mui("body").on("tap", ".mui-table-view-cell a", function(e) {
	//处理链接
	var linktype = this.getAttribute("data-linktype");
	//打开网络页面
	if(linktype == "netpage") {
		var title = this.getAttribute("data-title");
		var target = this.getAttribute("data-target");
		var targetPage = plus.webview.getWebviewById("netpage");
		if(targetPage) {
			mui.fire(targetPage, "loadnetpage", {
				title: title,
				pageurl: target
			});
			targetPage.show("slide-in-right", 150);
		}
		//打开新页面
	} else if(linktype == "newpage") {
		newpage(this);
	} else if(linktype == "cachedpage") {
		var target = this.getAttribute("data-pageid");
		var targetPage = plus.webview.getWebviewById(target);
		targetPage.show('slide-in-right', 150);
	} else if(linktype == "action") {
		var action = this.getAttribute("data-action");
		//do something
		if(action == "noaction") {
			plus.nativeUI.toast(this.innerText.trim() + "服务暂未开启");
		} else if(action == "exitlogin") {
			plus.nativeUI.confirm("确定要重新登录吗？", function(e) {
				if(e.index == 0) {
					//restart app.
					plus.runtime.restart();
				}
			}, app.APP_NAME_CN);
		} else if(action == "exitapp") {
			if(confirm('是否要退出系统？')) {
				plus.runtime.quit();
			}
		}
	}
});

/**
 * 打开新页面
 * @param {出发DOM控件：this} e
 * @param {传到新窗口的参数} extras
 */
function newpage(e, extras) {
	var id = e.getAttribute("data-pageid");
	var url = e.getAttribute("data-pageurl");
	var title = e.getAttribute("data-pagetitle");
	if(title) {
		mui.openWindow({
			url: url,
			id: id,
			styles: { // 窗口参数 参考5+规范中的WebviewStyle,也就是说WebviewStyle下的参数都可以在此设置
				//top: '15px', //String类型,窗口垂直向下的偏移量.支持百分比、像素值，默认值为0px.未设置top属性值时,优先通过bottom和height属性值来计算窗口的top位置.
				titleNView: { // 窗口的标题栏控件
					autoBackButton: true, //显示左侧返回按钮
					titleText: title, // 标题栏文字,当不设置此属性时，默认加载当前页面的标题，并自动更新页面的标题
					titleColor: "#000000", // 字体颜色,颜色值格式为"#RRGGBB",默认值为"#000000"
					titleSize: "17px", // 字体大小,默认17px
					backgroundColor: "#F7F7F7", // 控件背景颜色,颜色值格式为"#RRGGBB",默认值为"#F7F7F7"
					progress: { // 标题栏控件的进度条样式
						color: "#00FF00", // 进度条颜色,默认值为"#00FF00"  
						height: "2px" // 进度条高度,默认值为"2px"         
					},
					splitLine: { // 标题栏控件的底部分割线，类似borderBottom
						color: "#CCCCCC", // 分割线颜色,默认值为"#CCCCCC"  
						height: "1px" // 分割线高度,默认值为"2px"
					}
				}
			},
			//errorPage: 'none', //String类型,窗口加载错误时跳转的页面地址.当Webview窗口无法加载指定的url地址时(如本地页面不存,或者无法访问的网络地址),此时会自动跳转到指定的错误页面地址(仅支持本地页面地址).设置为"none"则关闭跳转到错误页面功能,此时页面显示Webview默认的错误页面内容.默认使用5+ Runtime内置的错误页面.
			extras: { //新窗口的额外扩展参数,可用来处理页面间传值
				extras: extras //自定义
			}
		});
	} else {
		mui.openWindow(url, id, {
			waiting: {
				autoShow: false
			},
			extras: { //新窗口的额外扩展参数,可用来处理页面间传值
				extras: extras //自定义
			}
		});
	}
}

//*******************************************
//用户菜单操作等

/**
 * 获取程序分组
 * @param {view窗口ID} viewId
 * @param {程序分组} exe_group
 */
function loadExeGroup(viewId, exe_group) {
	var data = GetUserMenu('menu', viewId);
	if(data.status != 0) {
		mui.alert(JSON.stringify(data.message));
		return;
	}
	//	var exe_group = mui("#exe_group")[0]; //程序分组
	exe_group.innerHTML = "";
	SetUserMenu_Exe_Group(data.data, exe_group);
	//杨俊燃  2018-11-21
	//注：安卓5.0出现九宫格高度问题，暂是发现是 $mui.style="..." 这个操作没有执行成功，可能不兼容吧
	//至于mui解决办法应该是有的，就等着你去发现了，我先用jq的操作执行咯~以下为未执行成功，导致界面异常的示例代码
	//slider_group.style = "height: " + JSON.stringify($(window).height() - 20) + "px;";
	$("#exe_group").height($(window).height() - 20)
	$("#exe_group .mui-slider-group").height($(window).height() - 20);
	$("#exe_group .mui-slider-indicator").css("margin-top", "5px");
	$("#exe_group .mui-scroll-wrapper").css("top", "40px");
	$("#exe_group li").css("font-size", "20px");
	//刷新九宫格
	var sliderApi = mui(exe_group).slider();
	sliderApi.refresh();
	initScrollWrapper();
}

/**
 * 获取用户菜单权限
 * @param {类型：系统-sys,菜单-meun,程序-exe} type
 * @param {系统编号} type
 */
function GetUserMenu(type, SysNumber) {
	var results = {};
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	//console.log(JSON.stringify(currentSession));
	var user_id = currentSession.user_id
	var data = {
		spname: "APP_GetUserMenu", //获取用户菜单权限
		returnvalue: 1,
		_sp_Type: type, //类型
		_sp_SysNumber: SysNumber, //系统编号
		_sp_UserNumber: user_id //用户编号
	};
	var responseData = AjaxOperation(data, "获取用户菜单权限", true, app.API_METHOD_SYSAPI_ESP)
	if(responseData.state) {
		//console.log("获取用户菜单权限" + JSON.stringify(responseData));
		results = responseData.data;
	}
	return results;
}

/**
 * 设置用户菜单
 * @param {数据源} data
 * @param {ul表格容器} list
 */
function SetUserMenu_Menu(data, list) {
	list.innerHTML = ""; //移除所有列表
	mui.each(data, function(index, item) {
		var PRA001 = item['PRA001']; //程序编号
		var PRA002 = item['PRA002']; //上级系统编号
		var PRA003 = item['PRA003']; //程序名称
		var PRA009 = item['PRA009']; //程序路径

		var li = document.createElement("li");
		li.className = "mui-table-view-cell mui-media mui-col-xs-6 mui-col-sm-3";
		li.id = PRA001;
		var a = document.createElement("a");
		a.setAttribute("data-linktype", "newpage");
		a.setAttribute("data-pageid", PRA001);
		a.setAttribute("data-pageurl", PRA009);
		a.setAttribute("data-pagetitle", PRA003);
		//**********************
		//		var img = document.createElement("img");
		//		img.src = "images/Menu_img/faliao.png";
		//		img.className = "mui-media-icon mui-pull-caption head-img";
		//		img.style = "width: 40px;";
		//		a.appendChild(img);
		a.innerHTML =
			"<svg class='iconfont-icon' aria-hidden='true'>" +
			"<use xlink:href='#" + PRA001 + "'></use>" +
			"</svg>"; //添加图表
		var a_div = document.createElement("div");
		a_div.className = "mui-media-body";
		a_div.innerHTML = PRA003;
		a.appendChild(a_div);
		li.appendChild(a);
		list.appendChild(li);
	});
}

/**
 * 设置程序分组列表
 * @param {程序分组数据} data
 * @param {程序分组容器} exe_group
 */
function SetUserMenu_Exe_Group(data, exe_group) {
	var slider_group = document.createElement("div");
	slider_group.className = "mui-slider-group";
	//	slider_group.style = "height: " + JSON.stringify($(window).height() - 20) + "px;";
	var slider_indicator = document.createElement("div");
	slider_indicator.className = "mui-slider-indicator";
	//	slider_indicator.style = "margin-top: 5px;";
	//console.log("集合"+JSON.stringify(data));
	//{"PRA001":"APP0101","PRA002":"APP01","PRA003":"物料管理","PRA005":1,"PRA009":""}
	mui.each(data, function(index, item) {
		var data_exe = GetUserMenu('exe', item["PRA001"]); //程序明细
		//console.log("分组"+JSON.stringify(data_exe));
		//1.添加分组项
		var div_item = document.createElement("div");
		div_item.className = "mui-slider-item";
		var div_link = document.createElement("div");
		div_link.className = "link-area";
		var div_ul = document.createElement("ul");
		div_ul.className = "mui-table-view";
		var div_ul_li = document.createElement("li");
		div_ul_li.className = "mui-table-view-cell";
		div_ul_li.style = "font-size: 20px;";
		div_ul_li.innerHTML = item["PRA003"];
		var div_span = document.createElement("li");
		div_span.className = "mui-badge mui-badge-primary";
		div_span.innerHTML = data_exe.data.length;
		var div_wrapper = SetUserMenu_Exe(data_exe); //获得全部分组的菜单DOM
		div_ul_li.appendChild(div_span);
		div_ul.appendChild(div_ul_li);
		div_link.appendChild(div_ul);
		div_item.appendChild(div_link);
		div_item.appendChild(div_wrapper);
		slider_group.appendChild(div_item);

		//添加分组图标
		var div_indicator = document.createElement("div");
		div_indicator.className = (index == 0) ? "mui-indicator mui-active" : "mui-indicator";
		slider_indicator.appendChild(div_indicator);
	});
	exe_group.appendChild(slider_group);
	exe_group.appendChild(slider_indicator);
};

/**
 * 设置程序列表
 * @param {当前小分组程序集合} data_exe
 */
function SetUserMenu_Exe(data_exe) {
	var div_wrapper = document.createElement("div");
	div_wrapper.className = "mui-scroll-wrapper";
	//	div_wrapper.style = "top: 40px";
	var div_scroll = document.createElement("div");
	div_scroll.className = "mui-scroll";
	var div_ul = document.createElement("div");
	div_ul.className = "mui-table-view mui-grid-view mui-grid-9";
	//{"PRB001":"ReadyMaterialHtml","PRB002":"APP0102","PRB003":"前加工备料","PRB005":1,"PRB009":"ReadyMaterialHtml.html"}
	mui.each(data_exe.data, function(index_exe, item_exe) {
		var PRB001 = item_exe['PRB001']; //程序编号
		var PRB002 = item_exe['PRB002']; //上级系统编号
		var PRB003 = item_exe['PRB003']; //程序名称
		var PRB009 = item_exe['PRB009']; //程序路径
		var PRB016 = item_exe['PRB016']; //图标ID
		var div_li = document.createElement("li");
		div_li.className = "mui-table-view-cell mui-media mui-col-xs-4 mui-col-sm-3";
		var a = document.createElement("a");
		a.setAttribute("data-linktype", "newpage");
		a.setAttribute("data-pageid", PRB001);
		a.setAttribute("data-pageurl", PRB009);
		a.setAttribute("data-pagetitle", PRB003);
		//*************************
		//var img = document.createElement("img");
		//img.src="../../images/Menu_img/faliao.png";
		//img.className="mui-media-object mui-pull-caption head-img";
		//img.style="width: 40px;";
		//a.appendChild(img);
		a.innerHTML =
			"<svg class='iconfont-icon' aria-hidden='true'>" +
			"<use xlink:href='#" + PRB016 + "'></use>" +
			"</svg>";
		var a_div = document.createElement("div");
		a_div.className = "mui-media-body";
		if(PRB003.length > 6) {
			var marquee = document.createElement("marquee");
			marquee.setAttribute("behavior", "alternate");
			marquee.setAttribute("scrolldelay", "700");
			marquee.innerHTML = PRB003
			a_div.appendChild(marquee);
		} else {
			a_div.innerHTML = PRB003;
		}
		a.appendChild(a_div);
		div_li.appendChild(a);
		div_ul.appendChild(div_li);
	});
	div_scroll.appendChild(div_ul);
	div_wrapper.appendChild(div_scroll);
	return div_wrapper;
};

//*******************************************
//其他公用方法

/**
 * 得到最大单号 绑定
 * @param 单别 billType 
 * @param 创建时间  为空默认为当前日期 createDate 
 * @return 执行结果 result 
 */
function GetMaxBillNO(billType, createDate) {
	if(!billType) {
		mui.alert("请输入单别！"); 
		return "";
	}   
	if(!createDate) {
		createDate = '';
	}
	var rul = "/B/GetMaxBillNO?strBillType=" + billType + "&strBillDate=" + createDate;
	return AjaxOperation({}, "", true, rul).data;
}

/**
 * 获得服务期日期、时间
 * @return 日期[sys_date]和时间[sys_time]对象 result 
 */
function GetSysDateTime() {
	var responseData = AjaxOperation({}, "获取服务器时间", true, "/b/sysDateTime")
	if(!responseData.state) { //不获取服务器日期时间，返回手机端日期时间
		var D = new Date();
		var d = formatDate(D);
		var h = D.getHours(); //获取当前小时数(0-23)   
		var m = D.getMinutes(); //获取当前分钟数(0-59)
		var t = h + ":" + m; //获取当前时间 
		var date = {};
		date.sys_date = d;
		date.sys_time = t;
		plus.nativeUI.toast("单头建立日期时间改为获取本机时间", {
			verticalAlign: 'center'
		});
		return date;
	}
	return responseData.data.data;
}
/**
 * Javascript 将字符串日期格式化为 yyyy-mm-dd
 * @param 日期时间 date
 */
function formatDate(date) {
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();
	if(month.length < 2) month = '0' + month;
	if(day.length < 2) day = '0' + day;
	return [year, month, day].join('-');
}

/**
 * ajax 数据操作
 * @param 请求数据 data
 * @param 异常提示 errorMsg
 * @param 是否返回值 returnvalue ：true/false
 * @param 调用api类型 api
 */
function AjaxOperation(data, errorMsg, returnvalue, api) {
	var results = {};
	results.state = false;
	$.ajax(app.API_URL_HEADER + api, { //更新卡板号
		data: data,
		dataType: "json",
		type: "post",
		timeout: 15000,
		async: false,
		success: function(resp) {
			results.state = resp.status == 0;
			if(returnvalue) { //返回结果
				results.data = resp;
			}
			if(resp.status != 0 && errorMsg != "") {
				mui.alert(resp.message, errorMsg);
				return;
			}
		},
		error: function(xhr, type, error) {
			//console.log(error);
			mui.alert(JSON.stringify(error));
		}
	});
	return results;
};

/*
 * 播放声音
 * Type(类型：NG/OK)
 */
function playerAudio(Type) {
	if(typeof plus == "undefined")
		return;
	var p;
	if(Type == "NG") {
		p = plus.audio.createPlayer("../../audio/NG.wav");
	} else {
		p = plus.audio.createPlayer("../../audio/OK.wav");
	}
	p.play(function() {
		//定时停止声音
		setTimeout(function() {
			p.stop();
		}, 100);
	}, function(e) {
		alert("声音异常: " + e.message);
	})
}

/* 当页面的文本失去焦点时，让其再次获取焦点 */
/**
 *  @param {出发DOM控件：this} e
 */
function SetInputFoucs(codeID) {
	var itemTag = document.activeElement.tagName; //获取元素的标签名
	var name = document.activeElement.name; //获取元素的名称	
	//如果控件不是文本
	//如果控件是文本,Name非空时（如checkbox)
	//条码获取焦点
	if((itemTag != 'INPUT') ||
		(itemTag == 'INPUT' && name != '')) {
		$(codeID).focus();
	}
}

mui.plusReady(function() {
	//1.设置多语言
	var multilingual = plus.storage.getItem("Multilingual");
	//var multilingual = 'CN';
	loadProperties(multilingual);
});

/**
 * 设置多语言
 * @param {语言类型} lang
 */
function loadProperties(lang) {
	var lang = lang || navigator.languge || "CN"; //没有传人语言时候，就用浏览器缓存的
	var name = "";
	switch(lang) {
		case 'VN': //越南
			name = 'strings_vn'; //调用国际化函数
			break;
		case 'EN': //英文
			name = 'strings_en'; //调用国际化函数
			break;
		case 'JP': //日文
			name = 'strings_jp'; //调用国际化函数
			break;
		default: //默认：CN-中文
			name = 'strings_cn'; //调用国际化函数
			break;
	}

	var path = plus.io.convertLocalFileSystemURL("_doc/" + app.MULTILINGUAL_PATH);
	$.i18n.properties({
		name: name, //这个是参数path指定路径的首个单词，也就是资源文件名
		path: path, //app.MULTILINGUAL_PATH, //指定国际化映射文件的路径
		mode: 'map', //指定以键值对的形式获取资源 
		language: lang, //指定语言类型中英文，举个例子："zh_CN"为中文
		callback: function() { //加载完成后的回调函数
			var viewId = plus.webview.currentWebview().id;
			//console.log(app.MULTILINGUAL_PATH + name);
			//console.log(name + lang + JSON.stringify($.i18n));
			//console.log("窗口ID=" + viewId);
			//alert(JSON.stringify(plus.webview.getLaunchWebview()));
			//alert(viewId);
			//添加html
			$('[data-i18n]').each(function() { //遍历所有属性是data-i18n
				var key = viewId + "_" + $(this).data("i18n"); 
				if($.i18n.prop(key) != "[" + key + "]") {
					$(this).html($.i18n.prop(key)); //把这个属性值传入翻译后放到页面上
				}
			});
			//添加提示文本
			$('[data-i18n_placeholder]').each(function() { //遍历所有属性是data-i18n
				var key = viewId + $(this).data("i18n_placeholder");
				if($.i18n.prop(key) != "[" + key + "]") {
					$(this).attr('placeholder', $.i18n.prop(key)); //翻译placeholder属性值
				}
			});
			//添加title属性内容
			$('[data-i18n_title]').each(function() { //遍历所有属性是data-i18n
				var key = viewId + $(this).data("i18n_title");
				if($.i18n.prop(key) != "[" + key + "]") {
					$(this).attr('title', $.i18n.prop(key)); //翻译placeholder属性值
				}
			});
			//添加value内容
			$('[data-i18n_value]').each(function() { //遍历所有属性是data-i18n
				var key = viewId + $(this).data("i18n_value");
				if($.i18n.prop(key) != "[" + key + "]") {
					$(this).val($.i18n.prop(key)); //翻译placeholder属性值
				}
			});
		}
	})
}