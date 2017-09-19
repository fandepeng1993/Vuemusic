<template>
  <scroll class="listview" v-bind:datas="datas" ref="listview"
          v-bind:listenSCroll="listenSCroll"
          v-bind:probeType="probeType"
          @scrollss="scrollas">
    <ul>
      <li v-for="group in datas" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li v-on:click="selectItem(item)" v-for="item in group.items" class="list-group-item">
            <img v-lazy="item.avatar" alt="" class="avatar">
            <span class="name">{{item.name}}</span>
            <!--&lt;!&ndash;<span>{{message}}</span>-->
            <!--<span>{{shortcutList}}</span>&ndash;&gt;-->
          </li>
        </ul>
      </li>
    </ul>

    <div class="list-shortcut" v-on:touchstart="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li v-for="(item,index) in shortcutList"
            class="item"
            :class="{'current': currentIndex===index}"
            :data-index="index">{{item}}</li>
      </ul>
    </div>

    <div class="list-fixed" style="color:red" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
    <div v-show="!datas.length" class="loading-container">
      <loading></loading>
    </div>

  </scroll>

</template>
<script type="text/ecmascript-6">
  /*better-scroll 父容器必须宽高的必须固定
  子元素内容超过了父容器就会出现滚动效果 */
  import Scroll from 'base/scroll/scroll'
  import {getData} from 'common/js/dom'
  import Loading from 'base/loading/loading'
  const ANCHOR_HEIGHT=18
  const TITLE_HEIGHT=30
  export default{
    created:function () {
      this.touchce={hhh:'asd'}
      this.listenSCroll=true
      this.touch={}
      this.listHeight=[]
      this.probeType=3
    },
    data:function(){
      return {
        //fdp:'范德鹏',
        scrollY:-1,
        currentIndex:0,
        diff:-1,
        fixedTop:''

      }

    },
    props:{
      datas:{
        type:Array,
        default:[]
      },
      message:{
        type:Number,
        default:10
      }
    },
    computed:{
      shortcutList:function () {
       return this.datas.map((group)=>{
         //console.log(group.title.substr(0,1));
         return group.title.substr(0,1)
        })
      },
    fixedTitle:function(){
      if(this.scrollY>0){
        return ''
      }
      return this.datas[this.currentIndex]?this.datas[this.currentIndex].title:''
    }


    },
    methods:{
      onShortcutTouchStart:function (event) {
        //字符串
        let anchorIndex=getData(event.target,'index')

        let firstTouch=event.touches[0]
        this.touch.y1=firstTouch.pageY
        this.touch.anchorIndex=anchorIndex
        this._scrollTo(anchorIndex)
      },

      onShortcutTouchMove(e){
        let firstTouch=e.touches[0]
        this.touch.y2=firstTouch.pageY
        // 取整|
        let delta=(this.touch.y2 -this.touch.y1)/ANCHOR_HEIGHT | 0
        let anchorIndex=Number(this.touch.anchorIndex) + delta
        this._scrollTo(anchorIndex)
        //console.log(this)

      },
      scrollas(pos){
       this.scrollY=pos.y
        //console.log(this.scrollY)

      },
      _scrollTo:function (index) {
        //第二个参数是滚动动画时间
        if(!index && index !==0){
          //index=14
          return
        }
        else if(index<0){
          index=0;
        }
        else if(index> this.listHeight.length-2){
          index=this.listHeight.length-2
        }

        this.scrollY=-this.listHeight[index]
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index],0)
      },
      _calculateHeight(){
        this.listHeight=[]
        let height=0;
        this.listHeight.push(height)
        const list=this.$refs.listGroup
        for(let i=0;i<list.length;i++){
          let item =list[i]
          height=height+item.clientHeight
          this.listHeight.push(height)
        }
        //console.log(this.listHeight)
      },
      selectItem:function (item) {
        //内部组件派发时间，通知外部组件，我被点击了。或者说我执行了某个事件函数。我得告诉往上组件
        //通知点击我的元素是什么
        //派发事件，执行该事件
        this.$emit('select',item)
      }

    },
    watch:{
      datas:function () {
        setTimeout(()=>{
          this._calculateHeight()
          //数据的变化到DOM的变化需要20毫秒的时间
        },20)
      },
      scrollY(newY){
        //console.log(-newY)

        const listHeight=this.listHeight
        //当滚动到顶部 newY>0
        if(newY>0){
          this.currentIndex=0
          return
        }

        //当滚动到达中间部分
        for(let i=0;i<listHeight.length-1;i++){
          //不可能到达最后一项的
          let height1=listHeight[i]
          let height2=listHeight[i + 1]
          if((-newY >= height1 && -newY < height2)){
               this.currentIndex = i
               this.diff=height2 + newY

                //console.log(this.currentIndex)
                return
          }
        }
        //当滚动到底部，-newY大于最后一个元素的上线
        this.currentIndex=0
      },
      diff(newval){
        let fixedTop=(newval>0&&newval<TITLE_HEIGHT)?newval-TITLE_HEIGHT:0
        if(this.fixedTop===fixedTop){
          return
        }
        this.fixedTop=fixedTop
        //console.log(this.$refs)
        this.$refs.fixed.style.transform='translate3d(0,'+fixedTop+'px,0)'
      }
    },
    components:{
      Scroll,
      Loading
    }
  }



</script>

<style type="text/stylus" scoped lang="stylus" rel="stylesheet/stylus">

  @import "~common/stylus/variable"
  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
