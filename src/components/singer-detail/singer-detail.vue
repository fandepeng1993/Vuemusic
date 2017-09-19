<template>

  <transition name="slide">
      <div class="singer-detail">
        <p>{{hh}}</p>
        <p>{{ this.$route.query.name }}</p>
      </div>
  </transition>

</template>
<script type="text/ecmascript-6">
  import {mapGetters} from 'vuex'
  import {getSingerDetail} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import {createSong,Song} from 'common/js/song'
  //import Song from 'common/js/song'
  export default {
    data(){
      return{
        hh:'hhhh',
        songs:[]
      }
    },
    created(){
      this._getDetail()
      let a=new Song(1,2,3,4,5,6,7,8)
      console.log(a)
    },
    mounted(){
     console.log(this.$route.query)
    },
    updated(){

    },
    destroyed(){

    },
    methods:{
      _getDetail(){
        if(!this.singer.id){
          this.$router.push('/singer')
          return
        }
        getSingerDetail(this.singer.id).then((res)=> {
          //PS:注意要使用ES6的箭头语法函数,否则this的指向存在问题
          if(res.code===ERR_OK){
            //console.log(res.data.list)
           // console.log(this)
            this.songs=this._normalizeSongs(res.data.list)
            //console.log(this.songs)
          }
        })
      },

      _normalizeSongs(list){
        let ret=[]

       list.forEach(function (item) {
          let musicData=item.musicData
          console.log(musicData)
          if(musicData.songid&&musicData.albummid){
            ret.push(createSong(musicData))
          }
        })
        return ret
      },

    },
    props:{

    },
    computed:{
      ...mapGetters([
        'singer'
      ])
    },
    watch:{

    },
    components:{

    }

  }
</script>
<style type="stylus" lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .singer-detail
    position fixed
    z-index 100
    top 0px
    left 0px
    right 0px
    bottom 0px
    background $color-background
  .slide-enter-active, .slide-leave-active
    transition :all 0.3s
  .slide-enter, .slide-leave-to
    transform :translate3d(100%,0,0)
</style>
