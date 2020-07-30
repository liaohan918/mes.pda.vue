mui.init({

});

/**
 * 过滤用户菜单
 */
mui.plusReady(function() {
	mui("#title")[0].innerHTML = app.APP_NAME_CN + "-"+plus.storage.getItem("FactoryName");
	GetHomeMenu();
	var currentSession = app.loadconfig(app.CONFIG_CURRENT_SESSION);
	mui("#userName")[0].innerHTML = currentSession.user_name; //登陆用户名
	mui("#userNumber")[0].innerHTML = "账号：" + currentSession.user_id; //登陆用户账号
	mui("#appName")[0].innerHTML = "关于" + app.APP_NAME_CN; //登陆用户账号
	plus.runtime.getProperty(plus.runtime.appid, function(inf) {
		mui("#version")[0].innerHTML = inf.version; //当前APP版本
	});
});

function GetHomeMenu() {
	var data = GetUserMenu('sys', app.APP_Sys_Number);
	if(data.status != 0) {
		mui.alert(JSON.stringify(data.message));
		return;
	}
	SetUserMenu_Menu(data.data, mui("#mlist")[0]);
	mui("#menu_sum")[0].innerHTML = data.data.length;
	initScrollWrapper(); //使用区域滚动组件，需手动初始化scroll控件
}

document.getElementById("refresh_home").addEventListener("tap",
	function(e) {
		GetHomeMenu();
		mui.toast('菜单刷新成功！');
	});

//返回
mui.back = function() {
	if(confirm('是否要退出系统？')) {
		plus.runtime.quit();
	}
};