<template>
  <div class="player" v-show="playlist.length>0">
    <!--展开播放器-->
    <!--<li v-for="item in playlist">{{item}}</li>-->
    <transition name="normal"
                 @enter="enter"
                 @after-enter="afterEnter"
                 @leave="leave"
                 @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-text="currentSong.name"></h1>
          <h2 class="subtitle" v-text="currentSong.singer"></h2>
        </div>
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :datas="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p v-bind:class="{'current':currentLineNum===index}" ref="lyricLine" class="text" v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='cd'}"></span>
            <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar @percentChage="onProgressBarChange" :percent="percent" ></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!--收起播放器-->
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="extend">
        <div class="icon">
          <img :class="cdCls" width="40" height="40" :src="currentSong.image">
        </div>
        <div class="text">
          <h2 class="name" v-text="currentSong.name"></h2>
          <p class="desc" v-text="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i v-on:click.stop="togglePlaying" class="icon-mini" v-bind:class="miniIcon"></i>
          </progress-circle>
        </div>
        <div class="control">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <audio ref="audio" @timeupdate="updateTime" @canplay="ready" @ended="end" v-bind:src="currentSong.url"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  import {mapGetters,mapMutations} from 'vuex'
  import animations from 'create-keyframe-animation'
  import {prefixStyle} from 'common/js/dom'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import {playMode} from 'common/js/config'
  import {shuffle} from 'common/js/util'
  import Lyric from 'lyric-parser'
  import Scroll from '../../base/scroll/scroll'

  const transform=prefixStyle('transform')
  const transitionDuration=prefixStyle('transitionDuration')

 export default {
    data(){
      return{
        songReady:false,
        currentTime:0,
        radius:32,
        currentLyric:null,
        currentLineNum:0,
        currentShow:'cd',
        playingLyric:null
      }
    },
   created(){
      this.touch={}
   },
    computed:{
      playIcon(){
        return this.playing?'icon-pause':'icon-play'
      },
      miniIcon(){
        return this.playing?'icon-pause-mini':'icon-play-mini'
      },
      cdCls(){
        return this.playing?'play':'play pause'
      },
      disableCls(){
        return this.songReady?'':'disable'
      },
      percent(){
        return this.currentTime/this.currentSong.duration
      },
      iconMode(){
        return this.mode===playMode.sequence?'icon-sequence':this.mode===playMode.loop?'icon-loop':'icon-random'
      },
      ...mapGetters([
        'fullScreen',
        'playlist',
        'currentSong',
        'playing',
        'currentIndex',
        'mode',
        'sequenceList'
      ])
    },
   methods:{
      back(){
        this.setFullScreen(false)
      },
     extend(){
       this.setFullScreen(true)
     },
     enter(elm,done){
       //vue2.0动画钩子函数
       const {x,y,scale}=this._getPosAndScale();
       let animation={
         0:{
           transform:`translate3d(${x}px,${y}px,0) scale(${scale})`
         },
         60:{
           transform:`translate3d(0,0,0) scale(1.1)`
         },
         100:{
           transform:`translate3d(0,0,0) scale(1)`
         }
       };
       animations.registerAnimation({
         name:'move',
         animation,
         presets:{
           duration:400,
           easing:'linear'
         }
       });
       animations.runAnimation(this.$refs.cdWrapper,'move',done)

     },
     afterEnter(){
       animations.unregisterAnimation('move');
       this.$refs.cdWrapper.style.animation=''
     },
     leave(el,done){
       this.$refs.cdWrapper.style.transition='all 0.4s'
       const {x,y,scale}=this._getPosAndScale()
       this.$refs.cdWrapper.style[transform]=`translate3d(${x}px,${y}px,0) scale(${scale})`
       this.$refs.cdWrapper.addEventListener('transitionend', done)

     },
     afterLeave(){
       this.$refs.cdWrapper.style.transition=''
       this.$refs.cdWrapper.style[transform]=''
     },
     end(){
       if(this.mode===playMode.loop){
         this.loop()
       }else {
         this.next()
       }

     },
     loop(){
       this.$refs.audio.currentTime=0
       this.$refs.audio.play()
       if(this.currentLyric){
         this.currentLyric.seek()
       }
     },
     next(){
       if(!this.songReady){
         return
       }
       if(this.playlist.length===1){
         this.loop()
       }else {
         let index=this.currentIndex+1;
         if(index===this.playlist.length){
           index=0
         }
         this.setCurrentIndex(index)
         if(!this.playing){
           this.togglePlaying()
         }
       }
       this.songReady=false

     },
     prev(){
       if(!this.songReady){
         return
       }
       if(this.playlist.length===1){
         this.loop()
       }else{
         let index=this.currentIndex-1;
         if(index===-1){
           index=this.playlist.length-1;
         }
         this.setCurrentIndex(index)
         if(!this.playing){
           this.togglePlaying()
         }
       }

       this.songReady=false
     },
     ready(){
       this.songReady=true

     },
     error(){
       //歌曲加载失败出发该函数，保证正常使用
       this.songReady=true
     },
     togglePlaying(){
       if(!this.songReady){
         return
       }
       this.setPlayingState(!this.playing)
       if(this.currentLyric){
         this.currentLyric.togglePlay()
       }

     },
     updateTime(e){
       /*console.log(e.target.currentTime)*/
       this.currentTime=e.target.currentTime;
      /* console.log(this.currentTime);*/
     },
     onProgressBarChange(percent){
       const currentTime=this.currentSong.duration*percent
       this.$refs.audio.currentTime=currentTime
       if(!this.playing){
         /*console.log(this.playing)*/
         this.togglePlaying()
       }
       if(this.currentLyric){
         this.currentLyric.seek(currentTime*1000)
       }
     },
     changeMode(){
       const mode=(this.mode+1)%3;
      /* console.log(this.mode)*/
      /*console.log(this.sequenceList)*/
       this.setPlayMode(mode);
       let list=null
       if(mode ===playMode.random){
            list=shuffle(this.sequenceList)
           /* console.log(this.sequenceList)*/
       }else {
         list=this.sequenceList
       }
       this.resetCurrentIndex(list)
       this.setPlaylist(list)
     },
     resetCurrentIndex(list){
       let index=list.findIndex((item)=>{
       //通过索引来查询到当前的list对应的当前播放歌曲的index（混合后）
         return item.id===this.currentSong.id
       })
       this.setCurrentIndex(index)
       /*console.log(this.currentIndex)*/

     },
     getLyric(){
       this.currentSong.getLyric().then((lyric)=>{
         this.currentLyric=new Lyric(lyric,this.handleLyric)
         if(this.playing){
           this.currentLyric.play()
         }
        /* console.log(this.currentLyric)*/
       }).catch(()=>{
         this.currentLyric=null
         this.playingLyric=''
         this.currentLineNum=0
       })
     },
     handleLyric({lineNum,txt}){
       //回调函数，每一行发生改变回调执行该函数
       this.currentLineNum=lineNum
       if(lineNum>5){
         let lineEl=this.$refs.lyricLine[lineNum-5]
         this.$refs.lyricList.scrollToElement(lineEl,1000)
       }
       else {
         this.$refs.lyricList.scrollTo(0,0,1000)
       }
       this.playingLyric=txt

     },
     middleTouchStart(e){
       this.touch.initiated=true
       const touch=e.touches[0]
       this.touch.startX=touch.pageX
       this.touch.startY=touch.pageY

     },
     middleTouchMove(e){
       if(!this.touch.initiated){
         return
       }
       const  touch=e.touches[0]
       const deltaX=touch.pageX-this.touch.startX
       const deltaY=touch.pageY-this.touch.startY
       if(Math.abs(deltaY)>Math.abs(deltaX)){
         return
       }
       const left=this.currentShow==='cd'?0:-window.innerWidth
       const offsetWidth=Math.min(0,Math.max(-window.innerWidth,left+deltaX))
       this.touch.percent=Math.abs(offsetWidth/window.innerWidth)
       this.$refs.lyricList.$el.style[transform]=`translate3d(${offsetWidth}px,0,0)`
       this.$refs.lyricList.$el.style[transitionDuration]=0
       this.$refs.middleL.style.opacity=1-this.touch.percent
       this.$refs.middleL.style[transitionDuration]=0
     },
     middleTouchEnd(){
       let offsetWidth
       let opacity
       if(this.currentShow==='cd'){
         if(this.touch.percent>0.1){
           offsetWidth=-window.innerWidth
           opacity=0
           this.currentShow='lyric'
         }else {
           offsetWidth=0
           opacity=1
         }
       }else {
         if(this.touch.percent<0.9){
           offsetWidth=0
           this.currentShow='cd'
           opacity=1
         }else {
           offsetWidth=-window.innerWidth
           opacity=0
         }
       }
       const time=300
       this.$refs.lyricList.$el.style[transform]=`translate3d(${offsetWidth}px,0,0)`
       this.$refs.lyricList.$el.style[transitionDuration]=`${time}ms`
       this.$refs.middleL.style.opacity=opacity
       this.$refs.middleL.style[transitionDuration]=`${time}ms`
     },

     format(interval){
       /*js运算符单竖杠“|作用”
       *
       * number|0的情况：
       *1. Math.ceil()用作向上取整。
       *2. Math.floor()用作向下取整。
       *3. Math.round() 我们数学中常用到的四舍五入取整。
       *
       *console.log(0.6|0)//0
       *console.log(1.1|0)//1
       *console.log(3.65555|0)//3
       *console.log(5.99999|0)//5
       *console.log(-7.777|0)//-7
       *
       *在正数的时候相当于Math.floor(),负数的时候相当于Math.ceil()
       *ps:
       *所有的加，是逻辑加法，又称逻辑加
       *看了上面的例子，大体知道单竖杠可以进行取整运算，就是只保留正数部分，小数部分通过拿掉，但是“|0”，又是如何进行运算的呢，为什么能       *“|0”能达到取整的目的呢？
       *console.log(3|4); //7
       *console.log(4|4);//4
       *console.log(8|3);//11
       *console.log(5.3|4.1);//5
       *console.log(9|3455);//3455
       *
       *console.log(3|4); //7
       *console.log(4|4);//4
       *console.log(8|3);//11
       *console.log(5.3|4.1);//5
       *console.log(9|3455);//3455
       *单竖杠“|”就是取证转换为2进制之后相加得到的结果。
       *
       *3|4
       *转换为二进制之后011|100  相加得到111=7
       *4|4
       *转换为二进制之后100 |100  相加得到100=4
       *8|3
       *转换为二进制之后1000 |011  相加得到1011=11
       *
       * */
       interval=interval | 0;
       const minute=interval/60 | 0;
       const second=this._pad(interval%60);
       return `${minute}:${second}`
     },
     _pad(num,n=2){
       let len=num.toString().length;
       while (len<n){
         num='0'+num
         len++
       }
       return num
     },
     _getPosAndScale(){
       const trageWidth=40
       const paddingLeft=40
       const paddingBottom=30
       const paddingTop=80
       const width=window.innerWidth*0.8
       const scale=trageWidth/width
       const x=-(window.innerWidth/2-paddingLeft)
       const y=window.innerHeight-paddingTop-width/2-paddingBottom
        return{x,y,scale}
     },
     ...mapMutations({
       //修改state，单个修togglePlaying改
       setFullScreen:'SET_FULL_SCREEN',
       setPlayingState:'SET_PLAYING_SATE',
       setCurrentIndex:'SET_CURRENT_INDEX',
       setPlayMode:'SET_PLAY_MODE',
       setPlaylist:'SET_PLAYLIST'
     })
   },
   watch:{
      currentSong(newSong,oldSong){
        if(newSong.id===oldSong.id){
          return
        }
        if(this.currentLyric){
          //每一个都是通过new出来的对象然后计时器，没有清理
          this.currentLyric.stop()
          /*this.currentLineNum=0
          this.$refs.lyricList.scrollTo(0)*/
        }
       /* this.$nextTick(()=>{
          this.$refs.audio.play()
          this.getLyric()
        })*/
       setTimeout(()=>{
         this.$refs.audio.play()
         this.getLyric()
       },1000)
      },

     playing(newPlaying,oldPlaying){
       const audio=this.$refs.audio
       this.$nextTick(()=>{
         newPlaying?audio.play():audio.pause()
       })
     }
   },
   components:{
        ProgressBar,
        ProgressCircle,
        Scroll
   }
 }

</script>

<style type="stylus" lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
