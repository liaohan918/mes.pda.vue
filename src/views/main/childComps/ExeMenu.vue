<template>
	<div id="ExeMenu">
		<nav-bar class="nav-bar">
			<div slot="left" @click="back"><i class="el-icon-arrow-left"></i></div>
			<div class="title" slot="center"><b>{{title}}</b></div>
		</nav-bar>
		<div class="content">
			<keep-alive>
				<!-- 这里加keepalive为了当从Page返回出来不需要重新加载九宫格 -->
				<router-view/>
			</keep-alive>	
		</div>
	</div>
</template>

<script>
	import {
		Swiper,
		SwiperSlide,
		directive
	} from 'vue-awesome-swiper'
	import 'swiper/css/swiper.css'
	import NavBar from 'components/common/navbar/NavBar.vue'
	import Main from 'network/main/main.js'
	import ImageItemLink from 'components/content/imageItemLink/ImageItemLink.vue'
	// import ExeMenuSwiper from './ExeMenuSwiper.vue'

	export default {
		name: 'ExeMenu',
		components: {
			Swiper,
			SwiperSlide,
			NavBar,
			ImageItemLink
			// ExeMenuSwiper
		},
		data() {
			return {
				sysMenu: this.$route.params.sysMenu,//系统信息
				exeMenu: this.$route.params.exeMenu,//二级子系统菜单
				exeGroup: [],//二级子系统下的程序
				title: ""//顶部标题栏
			}
		},
		computed: {
			
		},
		methods:{
			back(){
				this.$router.go(-1)
			},
			//获取每个子系统下的程序
			getExeGroup(exeGroupId){
				Main.getExeGroupMenu(exeGroupId,this.$store.state.userInfo.userId)
					.then(result=>{	
						this.exeGroup.forEach(item=>{
							if(item.id == exeGroupId){
								item.data = result.data
								return
							}
						})	
					}).catch(error=>{
						console.log(error)
					})
			}
		},
		mounted() {
			
		},
		created() {
			this.exeMenu.forEach(item=>{
				this.exeGroup.push({
					id: item.PRA001,
					text: item.PRA003,
					data: {}
				})
			})
			this.exeMenu.forEach(item=>{
				this.getExeGroup(item.PRA001)
			})			
			//事件总线，监听子组件传来的事件
			this.$bus.$on('pageExeItemClick', value => {
				console.log("点击了程序:" + JSON.stringify(value))
				this.title = value.PRB003
			})
			//事件总线,当子组件为程序页面且被销毁时回调
			this.$bus.$on('pageDestory', value =>{
				this.title = this.sysMenu.PRA003
			})
		},
		beforeRouteLeave (to, from, next) {
		    if (to.name == 'SysMenu') {
				//返回一级目录时销毁此组件，因为该组件被最外层App.vue的keepAlive给缓存了,如果不销毁打开其他二级菜单会显示第一个创建的二级菜单目录
				this.$destroy()
		    }
			next()
		},
		beforeRouteEnter(to, from, next){
			if(from.name == "SysMenu"){
				next(vm=>{
					vm.title = vm.sysMenu.PRA003
					// 默认展示九宫格界面，并传程序分组过去,这里要用replace，不然在九宫格页面点击返回需要点击两次
					vm.$router.replace({
						name: "ExeMenuSwiper",
						params: {
							groups: vm.exeGroup
						}
					})
				})
			}else{
				next()
			}					
		}
	}
</script>

<style scoped>
	#ExeMenu{
		height: 100vh;
		position: relative;
	}
	
	.nav-bar{
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		background-color:white;
		z-index: 9;
	}
	
	.content{
		position: absolute;
		height: calc(100vh - 44px);
		top: 44px;		
		left: 0;
		right: 0;
	}
</style>