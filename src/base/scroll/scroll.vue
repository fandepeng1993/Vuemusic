<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>
<script type="text/ecmascript-6">
  import BScroll from 'better-scroll'

  export default{
    props:{
      probeType:{
        type:Number,
        default:1
      },
      click:{
        type:Boolean,
        default:true
      },
      datas:{
        type:Array,
        default:null
      },
      listenSCroll:{
        type:Boolean,
        default:false
      }
    },
    mounted(){
      setTimeout(()=>{
        this._initScroll()
      },20)
    },
    methods:{
      _initScroll(){
        if(!this.$refs.wrapper){
          return
        }
        this.scroll=new BScroll(this.$refs.wrapper,{
          probeType:this.probeType,
          click:this.click
        })
        if(this.listenSCroll){
          let me=this;
          me.scroll.on('scroll',(pos)=>{
            me.$emit('scrollss',pos)
            //console.log(pos)
          })
        }
      },
      enable(){
        this.scroll && this.scroll.enable()
      },
      disable(){
        this.scroll && this.scroll.disable()
      },
      refresh(){
        this.scroll && this.scroll.refresh()
      },
      scrollTo:function () {
        this.scroll && this.scroll.scrollTo.apply(this.scroll,arguments)
      },
      scrollToElement(){
        this.scroll && this.scroll.scrollToElement.apply(this.scroll,arguments)
      }
    },
    watch:{
      datas(){
        setTimeout(()=>{
          this.refresh()
        },20)
      }
    }
  }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">

</style>
