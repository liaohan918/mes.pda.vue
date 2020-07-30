<template>
    <div class="tab-bar-item" @click="itemClick">
        <div v-if="isActive"><slot name="item-icon-active"></slot></div>
        <div v-else><slot name="item-icon"></slot></div>
        <div :class="{active: isActive}" :style="activeStyle">
            <slot name="item-text"></slot>
        </div>
    </div>
</template>

<script>
export default {
    name:"TabBarItem",
    props:{
        path:String,
        activeColor:{
            type:String,
            defualt:'#1296db'
        }
    },
    data(){
        return{
            //isActive:true
        }
    },
    computed:{
        isActive(){
            return this.$route.path.indexOf(this.path) !== -1;
        },
        activeStyle(){
            return this.isActive ? { color : this.activeColor} : {}
        }
    },
    methods:{
        itemClick(){
			try{
				this.$router.replace(this.path);
			}catch(e){
				console.log(e)
			}
            
        }
    }
}
</script>

<style scoped>
  .tab-bar-item{
      flex:1;
      text-align:center;
      height: 49px;
      font-size: 14px;
  }

  img{
      width: 24px;
      height: 24px;
      margin-top: 5px;
      vertical-align: middle;
      /* margin-bottom: 2px; */
  }
</style>