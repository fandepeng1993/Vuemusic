<template>
  <div class="search-list" v-show="searches.length">
    <ul>
      <li @click="selectItem(item)" class="search-item" v-for="item in searches">
        <span class="text">{{item}}</span>
        <span class="icon" @click.stop="deleteOne(item)">
          <i class="icon-delete"></i>
        </span>
      </li>
    </ul>
  </div>

</template>
<script type="text/ecmascript-6">
  export default {
    props:{
      searches:{
        type:Array,
        default:[]
      }

    },
    data(){
      return{}
    },
    created(){
    //生命周期钩子
    },
    computed:{
    //计算属性
    },
    methods:{
      //方法
      selectItem(item){
        this.$emit('select',item)
      },
      deleteOne(item){
        this.$emit('delete',item)
      }

    },
    watch:{
      //监听
    }


  }

</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .search-list
    .search-item
      display flex
      align-items center
      height 40px
      .text
        flex 1
        color $color-text-l
      .icon
        extend-click()
        .icon-delete
          font-size $font-size-small
          color $color-text-d
</style>
