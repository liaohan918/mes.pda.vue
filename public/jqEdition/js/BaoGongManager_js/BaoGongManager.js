/**
 * 过滤用户菜单
 */
mui.plusReady(function() {
	var viewId = plus.webview.currentWebview().id;
	var exe_group = mui("#exe_group")[0]; //程序分组
	loadExeGroup(viewId,exe_group);
});
