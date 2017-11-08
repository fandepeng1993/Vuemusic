<template>
  <div class="singer">
    <listview @select="selectSinger" v-bind:datas="singers" ></listview>
    <router-view></router-view>
  </div>

</template>
<script type="text/ecmascript-6">
  import {getSingerList} from 'api/singer'
  import {ERR_OK} from 'api/config'
  import Singer from 'common/js/singer'
  import Listview from 'base/listview/listview'
  import {mapMutations} from 'vuex'
  const HOT_NAME="热门"
  const HOT_SINGER_LEN=10
   export default {
     // data () {
     //   return {count: 0}
     // },
      data:function() {
        return {
          count: 0,
          singers:[]
        }
      },
    /* data:{
         singers:[]
     },*/

     /*created(){
        this._getSingerList();
     },*/
     created:function () {
       this._getSingerList();
//       let a=new Song('asd','asd')
     },

     methods:{
        _getSingerList(){
          getSingerList().then((res)=>{
            if(res.code === ERR_OK){
              this.singers=this._normalizeSinger(res.data.list)
              //console.log(this.singers);
              //this._normalizeSinger(this.singers);
            }
          })
        },
       _normalizeSinger(list){
            let map={
              hot:{
                title:HOT_NAME,
                items:[]
              }
            };
            list.forEach((item,index)=>{
             // console.log(item,index)
             if (index<HOT_SINGER_LEN){
               map.hot.items.push(new Singer({
                 id:item.Fsinger_mid,
                 name:item.Fsinger_name,
               }))
             }
             //下面的是作用A-Z的所有数据
             const key=item.Findex;
             if(!map[key]){
               map[key]={
                 title:key,
                 items:[]

               }
             }
             map[key].items.push(new Singer({
               id:item.Fsinger_mid,
               name:item.Fsinger_name,
             }))
           });
         //为了得到有序列表，我们需要处理map
         let hot=[];
         let ret=[];

         for(let key in map){
              let val=map[key];
              if(val.title.match(/[a-zA-Z]/)){
                ret.push(val)
              }else if(val.title === HOT_NAME){
                hot.push(val)
              }
         }
         ret.sort((a,b)=>{
           return a.title.charCodeAt(0) - b.title.charCodeAt(0)
         })
         //console.log(hot.concat(ret));
         return hot.concat(ret);
       },
       selectSinger:function (singer) {
         //跳转路由
        this.$router.push({
           path:'/singer/'+singer.id,
           query: {name:'fdp',age:24}
         })
         //console.log(singer)
         this.setSinger(singer)

       },

       ...mapMutations({
         setSinger:'SET_SINGER'
       })
     },
     components:{
       Listview
     }

   }
</script>
<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position:fixed
    top :88px
    bottom :0px
    width :100%

</style>
