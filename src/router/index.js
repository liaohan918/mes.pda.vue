import Vue from 'vue'
import VueRouter from 'vue-router'

//登录界面
const Login = () => import("views/login/Login.vue")
//首页
const Main = () => import("views/main/Main.vue")
//我的
const Profile = () => import("views/profile/Profile.vue")
//系统界面
const SysMenu = () => import("views/main/childComps/SysMenu.vue")
//二级菜单界面
const ExeMenu = () => import("views/main/childComps/ExeMenu.vue")
//二级界面九宫格
const ExeMenuSwiper = () => import("views/main/childComps/ExeMenuSwiper.vue")
//程序本身界面
const Page = () => import("views/main/childComps/Page.vue")

Vue.use(VueRouter)

	const routes = [
	{
		path:'',
		redirect: '/index.html'
	},
	{
		path: '/index.html',
		name: 'Login',
		component: Login,
		meta: {
			hideMainTabBar: true,
			keepAlive: true
		}
	},
	{
		path: '/Main',
		name: 'Main',
		component: Main,
		meta: {
			hideMainTabBar: false,
			keepAlive: true
		},
		children: [
			{
				path: '',
				redirect: 'SysMenu'
			},
			{
				path: 'SysMenu',
				name: 'SysMenu',
				component: SysMenu,
				meta: {
					hideMainTabBar: false,
					keepAlive: true
				}
			}
		]
	},
	{
		path: '/Profile',
		component: Profile,
		name: 'Profile',
		meta: {
			hideMainTabBar: false,
			keepAlive: true
		}
	},
	{
		path: '/ExeMenu',
		name: 'ExeMenu',
		component: ExeMenu,
		meta: {
			hideMainTabBar: true,
			keepAlive: false
		},
		children: [
			{
				path: '',
				redirect: 'ExeMenuSwiper'
			},
			{
				path: 'ExeMenuSwiper',
				name: 'ExeMenuSwiper',
				component: ExeMenuSwiper,
				meta: {
					hideMainTabBar: true,
					keepAlive: false
				}
			},
			{
				path: 'Page',
				name: 'Page',
				component: Page,
				meta: {
					hideMainTabBar: true,
					keepAlive: false
				}
			}
		]
	}
]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
