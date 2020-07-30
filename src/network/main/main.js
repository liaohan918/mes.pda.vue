import {request,requestSp} from 'network/request.js'
import {getMenu} from 'common/util.js'
import Vue from '@/main.js'

//获取一级系统目录
function getSysMenu(appSys, userId){
	return getMenu("sys", appSys, userId)
}

//获取二级系统目录
function getExeMenu(subSysId, userId){
	return getMenu("menu", subSysId, userId)
}

//获取二级系统目录下的程序文件
function getExeGroupMenu(groupId, userId){
	return getMenu("exe", groupId, userId)
}

export default {
	getSysMenu,
	getExeMenu,
	getExeGroupMenu
}