<template>
    <div id="Page">
		<div v-if="this.pageType == 'component'"  class="component-container">
			<component :is="componentLoader"></component>
		</div>		
		<!-- 当程序不使用vue组件的方式写的时候用iframe容器 -->
		<!-- iframe方式会导致子页面无法出发plusReady事件 -->
		<!-- <iframe id = "pageContent" v-if="plusIsInit" 
		:src="htmlPageLoader" frameborder="0" scrolling="auto">			
		</iframe> -->		
    </div>
</template>
<script>	
import LoadingComponent from "components/content/LoadingComponent.vue"
import ErrorComponent from "components/content/ErrorComponent.vue"
import mixinPlus from "mixins/mixinPlus.js"	

export default {
	name: "Page",
   	data() {
		return {
			pageType: "html",
			pageId: "",//当时html页面时需要单独打开一个webView
			pageTitle: "",//程序名称
			path: "",
			basePath: "",//当目标程序文件是Html时需要，为了兼容老模块
			plusIsInit: false
		}
   	},
	computed:{
		//这里异步加载指定目录下的组件，我将所有需要动态加载的组件放到了一个组件目录里
		componentLoader () {
			if(!this.path)
				return LoadingComponent
			console.log(`查询${this.path}的具体路径(Vue组件)`)
			// return () => import(`components/content/${this.path}`)
			return () => ({
			    // 需要加载的组件。应当是一个 Promise
			    component: import(`components/content/${this.path}`),
			    // 加载中应当渲染的组件
			    loading: LoadingComponent,
			    // 出错时渲染的组件
			    error: ErrorComponent,
			    // 渲染加载中组件前的等待时间。默认：200ms。
			    delay: 200,
			    // 最长等待时间。超出此时间则渲染错误组件。默认：Infinity
			    timeout: 3000
			})
		}
	},
	created() {
		console.log("子页面创建成功")
   	},
	beforeRouteEnter(to, from, next){
		next(vm=>{
			vm.pageType = to.params.pageType
			vm.path = to.params.path
			vm.basePath = to.params.basePath
			vm.pageId = to.params.pageId
			vm.pageTitle = to.params.pageTitle
			console.log("页面类型：" + vm.pageType)
			console.log("页面路径：" + vm.path)
			console.log("页面根路径：" + vm.basePath)
			console.log("程序ID：" + vm.pageId)
			console.log("程序标题：" + vm.pageTitle)			
		})
	},
	beforeRouteLeave(to, from, next) {
		this.$bus.$emit("pageDestory", from)
		this.$destroy()
		next()
	}
}
</script>
<style scoped>
	#Page{
		height: calc(100vh - 44px);
	}
	
	#pageContent{
		width: 100%;
		height: 100%; 
	}
	
	.component-container{
		width: 100%;
		height: 100%; 
		padding: 2px;
	}
</style>
