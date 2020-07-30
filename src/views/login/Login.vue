<template>
	<div id='Login'>
		<el-form :model="form" labelWidth="80px" label-position="left" ref="form">
			<el-form-item label="账号:">
				<el-input type="text" placeholder="请输入账号" v-model="form.userId" @focusout.native="getUserInfo"></el-input>
			</el-form-item>
			<el-form-item label="用户名">
				<el-input type="text" placeholder="用户名" v-model="form.userName" readonly></el-input>
			</el-form-item>
			<el-form-item label="密码:">
				<el-input :type="showPassword? 'text' : 'password'" placeholder="请输入密码" v-model="form.password">
					<i class="el-icon-view" slot="suffix" @click="showPassword=!showPassword" />
				</el-input>
			</el-form-item>
			<el-form-item label="账套:">
				<el-select type="text" placeholder="请输入账套" v-model="form.company" @change="companyChange">
					<el-option v-for="(item,index) in company" :key="index" :label="item.text" :value="item">
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="语言:">
				<el-select type="text" placeholder="请输入语言" v-model="form.language" @change="languageChange">
					<el-option v-for="(item,index) in languageArray" :key="index" :label="item.text" :value="item.value">
					</el-option>
				</el-select>
			</el-form-item>
			<el-button type="primary" class="btnLogin" @click="execLogin">登录</el-button>
		</el-form>
		<div class="bottom">
			<div class="bottom-status">
				<div class="left">{{getNetType}}</div>
				<div class="right">{{getLocalVersion}}</div>
			</div>
		</div>
	</div>
</template>
<script>
	import mixinPlus from 'mixins/mixinPlus.js'
	import Login from 'network/login/login.js'
	import {
		getAppInfo,
		getNetType,
		checkUpdate
	} from 'common/util.js'
	import {
		Loading
	} from 'element-ui'

	export default {
		name: "Login",
		mixins: [mixinPlus],
		data() {
			return {
				form: {
					userId: "",
					userName: "",
					password: "",
					company: "",
					companyName: "",
					language: ""
				},
				netType: "异常",
				localVersion: "未知",
				showPassword: false,
				languageArray: [{
						text: "中文",
						value: "zh-cn"
					},
					{
						text: "日文",
						value: "ja-jp"
					}
				],
				company: [],
				localUserInfo: null,
				canLogin: false //网络环境是否允许登录
			}
		},
		computed: {
			//获得网络类型
			getNetType() {
				return "网络类型: " + this.netType
			},
			//获得当前版本
			getLocalVersion() {
				return "当前版本: " + this.localVersion
			}
		},
		created() {
			this.form.language = this.languageArray[0].value
		},
		methods: {
			//检测版本是否需要更新和网络连接情况
			plusReady() {
				let loadingInstance = Loading.service({
					fullscreen: true,
					text: "获取网络连接方式"
				});
				getNetType((result) => {
					if (result.netType === "0") {
						this.netType = "外网"
						this.$store.commit("setBaseUrl", this.$store.state.outerNetUrl)
						this.canLogin = true
					} else if (result.netType === "1") {
						this.netType = "内网"
						this.$store.commit("setBaseUrl", this.$store.state.interNetUrl)
						this.canLogin = true
					} else {
						this.netType = "异常"
						this.$message.error('网络异常');
					}	
					loadingInstance.close();					
					getAppInfo(appInfo => {
						if (appInfo)
							this.localVersion = appInfo.version	
						if(this.netType != "异常"){
							//检查更新
							if(checkUpdate(appInfo.version))
								this.$message({
									message: '发现新的程序，是否需要更新',
									type: 'success'
								});
						}
					})
				})	
			},
			getUserInfo() {
				Login.getUserInfo(this.form.userId)
					.then(res => {
						this.form.userName = res.data[0].PAA002
						Login.getUserCompany(this.form.userId)
							.then(res => {
								console.log(JSON.stringify(res))
								this.company = res.data
								this.form.company = res.data[0]
							}).catch(error => {
								console.log(error)
								this.$message.error('用户账套信息不存在！');
							})
					}).catch(error => {
						console.log(error)
						this.$message.error('用户不存在！');
					})
			},
			execLogin() {
				// if(!this.canLogin){					
				// 	this.$message.error('登录异常,请检查网络是否连接！')
				// 	return
				// }
				Login.execLogin(this.form.userId, this.form.password)
					.then(res => {
						if (res.status != 0) {
							this.$message.error(res.message)
							return
						}
						this.$message({
							message: '登录成功',
							type: 'success'
						});
						this.saveUserInfo()
						this.$router.replace('/Main/SysMenu');
					}).catch(error => {
						console.log(error)
						this.$message.error('登录失败')
					})
			},
			saveUserInfo() {
				this.$store.commit("setUserInfo", this.form)
			},
			companyChange(value) {
				this.form.companyName = value.text
			},
			languageChange(value) {
				this.form.language = value
			}
		}
	}

</script>
<style scoped="">
	#Login {
		margin-top: 50px;
		padding: 0 20px;
	}

	.btnLogin {
		width: 100%;
	}

	.el-form-item {
		margin-bottom: 10px;
	}

	.bottom {
		width: 100%;
		position: absolute;
		bottom: 10px;
		right: 0;
		left: 0;
		color: #606266;
		font-size: 14px;
	}

	.bottom-status {
		padding: 0 20px;
	}

	.bottom .left {
		float: left;
	}

	.bottom .right {
		float: right;
	}
</style>
