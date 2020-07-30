import {requestSp} from 'network/request.js'

//获取用户信息
function getUserInfo(userId){
	return requestSp({
		params:{
			spname: "APP_GetUserName",
			returnvalue: 1,
			_sp_UserNumber: userId
		}
	})
}

//获取用户账套
function getUserCompany(userId){
	return requestSp({
		params:{
			spname: "APP_GetFactory",
			returnvalue: 1,
			_sp_UserNumber: userId
		}
	})
}

//登录操作
function execLogin(userId, password){
	return requestSp({
			params: {
				spname: "APP_Login",
				returnvalue: 1,
				_sp_UserNumber: userId,
				_sp_Password: password
			}
		})
}

export default {
	getUserInfo,
	getUserCompany,
	execLogin
}