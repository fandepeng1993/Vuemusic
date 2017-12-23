import {playMode} from "common/js/config";
import {loadSearch} from "common/js/cache";

const state={
  singer:{},
  playing:false,
  fullScreen:false,
  playlist:[],
  sequenceList:[],
  mode:playMode.sequence,
  currentIndex:-1,
  disc:{},
  topList:{},
  //刷新页面，vuexstate被清空
  searchHistory:loadSearch()
}

export default state
