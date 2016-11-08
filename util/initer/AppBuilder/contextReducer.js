module.exports = function reducer(state = {}, action) {
  var ret = Object.assign({}, state)
  switch(action.type) {
    case 'global_change_language':
      ret.localeLanguage = action.lang
      return ret
    case 'global_receive_headerNav': 
      ret.navList = action.list
      return ret
    case 'INV_RENDER':
      var ret = Object.assign({}, state)
      ret.clickFlag = action.clickFlag;
      return ret;
    default:
      return state  
  }
}