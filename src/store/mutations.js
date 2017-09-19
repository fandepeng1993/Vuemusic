import * as types from './mutation-type'

const mutations={
  [types.SET_SINGER](state,singer) {
    state.singer=singer
  }
}
//console.log(mutations,types)

export default mutations
