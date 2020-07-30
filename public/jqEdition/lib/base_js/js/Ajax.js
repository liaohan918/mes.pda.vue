//ajax请求，用回调方式解决异步数据回写问题，
//后续播放OK与NG音频统一在此写，不必每个ajax都写一遍，登录人与MAC地址都可封装在此param中（未做）
(function(window, document) {
	var Ajax = {
		httpAsyncGet: function (url, callback) {
            $.ajax({
                url: app.API_URL_HEADER + url,
                type: "GET",
                dataType: "json",
                async: true,
                cache: false,
                success: function (data) {
                    if (data.status != 0) {
                        mui.alert(data.message);
                    }
                    callback(data);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    mui.alert(errorThrown);
                },
                // beforeSend: function () {
                // },
                complete: function () {
                }
            });
        },
        // get请求方法（同步）:url地址,param参数
        httpGet: function (url, param) {
            var res = {};
            $.ajax({
                url: app.API_URL_HEADER + url,
                data: param,
                type: "GET",
                dataType: "json",
                async: false,
                cache: false,
                success: function (data) {
                    if (data.status != 0) {
                        mui.alert(data.message);
                    }
                    res = data;
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    mui.alert(errorThrown);
                },
                // beforeSend: function () {
                // },
                complete: function () {
                }
            });
            return res;
        },
        // post请求方法（异步）:url地址,param参数,callback回调函数
        httpAsyncPost: function (url, param, callback) {
            $.ajax({
                url: app.API_URL_HEADER + url,
                data: param,
                type: "POST",
                dataType: "json",
                async: true,
                cache: false,
                success: function (data) {
                    if (data.status != 0) {
                        mui.alert(data.message);
                    }
                    callback(data);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                	//Audio.playerAudio(Audio.type.NG,Audio.popupType.Alert,errorThrown, null);
                	
                   mui.alert(errorThrown);
                },
                // beforeSend: function () {
                // },
                complete: function () {
                }
            });
        },
        //数据原封返回给调用者处理
        httpPostOriginal: function (url, param, callback) {
            $.ajax({
                url: app.API_URL_HEADER + url,
                data: param,
                type: "POST",
                dataType: "json",
                async: false,
                cache: false,
                success: function (data) {
                    callback(data);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    mui.alert(errorThrown);
                },
                // beforeSend: function () {
                // },
                complete: function () {
                }
            });
        },
        // post请求方法（同步）:url地址,param参数,callback回调函数
        httpPost: function (url, param, callback) {
            $.ajax({
                url: app.API_URL_HEADER + url,
                data: param,
                type: "POST",
                dataType: "json",
                async: false,
                cache: false,
                success: function (data) {
                    if (data.status != 0) {
                        mui.alert(data.message);
                    }
                    callback(data);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    mui.alert(errorThrown);
                },
                // beforeSend: function () {
                // },
                complete: function () {
                }
            });
        },
        // ajax 异步封装
        httpAsync: function (type, url, param, callback) {
            $.ajax({
                url: app.API_URL_HEADER + url,
                data: param,
                type: type,
                dataType: "json",
                async: true,
                cache: false,
                success: function (res) {
                    if (res.status == 0) {
                        callback(res);
                    }
                    else {
                        mui.alert(res.message);
                        callback(null);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    mui.alert(errorThrown);
                },
                // beforeSend: function () {
                // },
                complete: function () {
                }
            });
        },
	};
	window.Ajax = Ajax;
}(window, document));