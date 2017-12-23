import {mapGetters} from 'vuex'
//组件的优先级方法高于mixin

export const playlistMixin={
  computed:{
    ...mapGetters([
      'playlist'
    ])
  },
  mounted(){
    this.handlePlaylist(this.playlist)
  },
  activated(){
    this.handlePlaylist(this.playlist)
  },
  watch:{
    playlist(newVal){
      this.handlePlaylist(newVal)
    }
  },
  methods:{
    handlePlaylist(){
      throw new Error('component must implement handlePlaylist methods')
    }

  }

}
