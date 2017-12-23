<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>
<script type="text/ecmascript-6">
  import MusicList from 'components/music-list/music-list'
  import {mapGetters} from 'vuex'
  import {getSongList} from 'api/recommend'
  import {ERR_OK} from 'api/config'
  import {createSong} from 'common/js/song'

  export default {
    data(){
      return{
        songs:[]
      }
    },
    computed:{
      title(){
        return this.disc.dissname
      },
      bgImage(){
        return this.disc.imgurl
      },
      ...mapGetters([
        'disc'
      ])
    },
    created(){
      this._getSongList()
    },
    methods:{
      _getSongList(){
          if(!this.disc.dissid){
            this.$router.push('/recommend')
          }
          getSongList(this.disc.dissid).then((res)=>{
            if(res.code===ERR_OK&&res.msg){
            /* this.songs=this._normalizeSongs(res.cdlist[0].songlist)*/
              this.songs=[]
            }else if(res.code===ERR_OK&&!res.msg){
              this.songs=this._normalizeSongs(res.cdlist[0].songlist)
            }

          })

        },
      _normalizeSongs(){
        let ret=[]
        list.forEach((musicData)=>{
          if(musicData.songid&&musicData.album){
            ret.push(createSong(musicData))
          }
        })
        return ret

      }
    },
    components:{
      MusicList
    }
  }

</script>

<style type="stylus" scoped rel="stylesheet/stylus" lang="stylus">

  .slide-enter-active, .slide-leave-active
    transition :all0.3s
  .slide-enter, .slide-leave-to
    transform :translate3d(100%,0,0)
</style>
