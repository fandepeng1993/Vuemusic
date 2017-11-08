<template>
 <!-- <transition-group name="slide" >-->
  <transition name="slide" >
      <music-list
        v-bind:key="hh"
        v-bind:songs="songs"
        v-bind:title="title"
        v-bind:bg-image="bgImage"
      >
      </music-list>
  </transition>
<!--      <song-list v-bind:key="hh" v-bind:title="title" v-bind:songs="songs">

      </song-list>
  -->
</template>
<script type="text/ecmascript-6">
  import {mapGetters} from 'vuex'
  import {getSingerDetail} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'
  import MusicList from 'components/music-list/music-list'
  //import SongList from 'base/song-list/song-list'
 //import Song from 'common/js/song'
  export default {
    data(){
      return{
        hh:'hhhh',
        songs:[]
      }
    },
    props:{

    },
    computed:{
      title:function () {
        return this.singer.name
      },
      bgImage(){
        return this.singer.avatar
      },
      ...mapGetters([
        'singer'
      ])
    },
    created(){
      this._getDetail()
      //console.log(this.singer)
     /* let a=new Song(1,2,3,4,5,6,7,8)
      console.log(a)*/
    },
    mounted(){
     //console.log(this.$route.query)
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
        //console.log(list)
        let ret=[]

       list.forEach(function (item) {
         // console.log(item)
          let {musicData}=item
          //console.log(musicData)
          if(musicData.songid && musicData.albummid){
            ret.push(createSong(musicData))
          }
        })
        return ret
      },

    },
    watch:{

    },
    components:{
      MusicList
    }

  }
</script>
<style type="stylus" lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .slide-enter-active, .slide-leave-active
    transition :all 0.3s
  .slide-enter, .slide-leave-to
    transform :translate3d(100%,0,0)
</style>
