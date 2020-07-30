<template>
	<div id="Main">
		<!-- 顶部导航栏 -->
		<nav-bar>
			<div class="title" slot="center"><b>{{title}}</b></div>
			<div slot="right" @click="refreshMenu"><i class="el-icon-refresh"></i></div>
		</nav-bar>
		<Scroll class="content">
			<router-view />
		</Scroll>
	</div>
</template>
<script>
	import NavBar from 'components/common/navbar/NavBar.vue'
	import Main from 'network/main/main.js'
	import Scroll from 'components/common/scroll/Scroll.vue'
	import mixinPlus from 'mixins/mixinPlus.js'

	export default {
		name: "Main",
		mixins: [mixinPlus],
		components: {
			NavBar,
			Scroll
		},
		data() {
			return {
				title: this.$store.state.userInfo.companyName

			}
		},
		methods: {
			plusReady() {
				//重写实际终端返回功能，以防点击返回后直接关闭程序
				var first = null
				var webview = plus.webview.currentWebview(); //获取当前页面的webview对象
				plus.key.addEventListener('backbutton', function() {
					webview.canBack(e => { // canBack函数用于查询Webview窗口是否可后退
						if (e.canBack) { //判断是否可以后退
							webview.back() // 调用当前webview的后退
						} else { // else代码块表示不能后退，也就意味着回退到首页了
							if (!first) { //连按两次退出程序的功能实现
								first = new Date().getTime()
								plus.nativeUI.toast('再按一次退出应用');
								setTimeout(function() {
									first = null
								}, 1000)
							} else {
								if (new Date().getTime() - first < 1000) { //这里的1000是指两次按键的时间间隔在1秒内就退出应用
									plus.runtime.quit() //退出应用
								}
							}
						}
					})
				}, false);
			},
			getSysMenu() {
				Main.getSysMenu(this.$store.state.appSys, this.$store.state.userInfo.userId)
					.then(res => {
						this.$store.commit("setSysMenu", res.data)
					}).catch(error => {
						console.log(error)
						this.$message.error("获取一级目录失败")
					})
			},
			refreshMenu() {
				this.getSysMenu()
				// this.$router.replace("/Main/SysMenu");
			}
		},
		created() {
			this.getSysMenu()
		},
		mounted() {

		}
	}
</script>
<style scoped>
	#Main {
		height: 100vh;
		position: relative;
	}

	.content {
		overflow: hidden;
		position: absolute;
		top: 44px;
		bottom: 49px;
		width: 100%;
		padding: 0 5px;
	}
</style>
