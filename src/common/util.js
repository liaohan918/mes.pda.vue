import Vue from '@/main.js'
import {request,requestSp} from 'network/request.js'
import mui from 'assets/js/mui.min.js'

//获取App信息
export function getAppInfo(callback){	
	console.log("获取本地程序版本")
	if(plus){		
		plus.runtime.getProperty(plus.runtime.appid, function(appInfo) {
			console.log("当前版本:" + appInfo.version)
			return callback(appInfo)
		});
	}else{
		return callback(null)
	}
}

//获得后台最新程序版本
export function getServerVersion(){
	console.log("获取后台最新程序版本")
	return request({
        url: '/MESPDABase/CheckAPPUpdate'
    })
	// .then((data)=>{
	// 	return data.data.appVersion
	// }).catch((err)=>{
	// 	return "error"
	// })
}

//检测App是否需要更新
export function checkUpdate(localVersion){
	console.log("检测APP是否需要更新")
	if(plus){
		getServerVersion()
			.then(res=>{
				return res.data.appVersion != localVersion
			}).catch(error=>{				
				console.log(error)
				return false
			})
	}else{
		return false
	}
}

//获取当前网络类型 0-外网 1-内网 2-无网络链接
export function getNetType(callback){
	console.log("获取当前网络类型")
	let result = { 
		networkinfo: null,
		netType: "2"
	}
	if(plus){
		//具体参数可查看 https://www.html5plus.org/doc/zh_cn/device.html#plus.networkinfo
		if (plus.networkinfo.getCurrentType() != plus.networkinfo.CONNECTION_NONE) {
			result.networkinfo = plus.networkinfo
			testInterNetConn().then(res => {
				console.log("内网连接成功")
				result.netType = "1"			
				return callback(result)
			}).catch(error => {
				console.log("内网连接失败")
				testOuterNetConn().then(res => {
					console.log("外网连接成功")
					result.netType = "0"					
					return callback(result)
				}).catch(error => {
					console.log("内网和外网都连接失败")
					result.netType = "2"
					return callback(result)
				})
			})
		}else{
			console.log(`获取当前网络类型失败:${plus.networkinfo.getCurrentType()}----getNetType()`)
			return callback(result)
		}
	}else{
		return callback(result)
	}
}

//测试内网能否正常连接后台
export function testInterNetConn(){
	console.log(`测试内网连接:${Vue.$store.state.interNetUrl}`)
	return request({
		baseURL: Vue.$store.state.interNetUrl,
		url: "b/test"
	})
}

//测试外网是否能连接后台
export function testOuterNetConn(){
	console.log(`测试外网连接:${Vue.$store.state.outerNetUrl}`)
	return request({
		baseURL: Vue.$store.state.outerNetUrl,
		url: "b/test"
	})
}

/**
 * 获取用户菜单权限
 * @param {类型：系统-sys,菜单-meun,程序-exe} type
 * @param {系统编号} sysName
 */
export function getMenu(type, sysName, userId){
	let params = {
		spname: "APP_GetUserMenu", //获取用户菜单权限
		returnvalue: 1,
		_sp_Type: type, //类型
		_sp_SysNumber: sysName, //系统编号
		_sp_UserNumber: userId //用户编号
	};
	return requestSp({params})
}

export function playerAudio(Type) {
	if(typeof plus == "undefined")
		return;
	var p;
	if(Type == "NG") {
		p = plus.audio.createPlayer("audio/NG.wav");
	} else {
		p = plus.audio.createPlayer("audio/OK.wav");
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


//兼容老模块,用mui.openWindow打开html
//pageId : 程序编号
//pageUrl : 程序对应文件路径
//pageTitle : 程序名称
//extras : 额外参数
export function openMuiWindow(pageId, pageUrl, pageTitle, extras){
	var id = pageId
	var url = pageUrl
	var title = pageTitle
	console.log(`打开新的html页面,程序ID：${id},url:${url},标题:${title}`)
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