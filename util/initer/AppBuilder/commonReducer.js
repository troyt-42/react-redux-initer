/*
 * Copyright (C) 2016 Baidu, Inc. All Rights Reserved.
 */
var Immutable = require('immutable')

export const GLOBAL_DIALOG_ALERT = 'GLOBAL_DIALOG_ALERT';
export const GLOBAL_DIALOG_CONFIRM = 'GLOBAL_DIALOG_CONFIRM';
export const GLOBAL_DIALOG_TIPS = 'GLOBAL_DIALOG_TIPS';
export const GLOBAL_DIALOG_HIDE = 'GLOBAL_DIALOG_HIDE';

export default function reducer(state = Immutable.fromJS(initialState), action) {
  let {msg,  confirm, cancel} = action;
  switch(action.type) {
    case GLOBAL_DIALOG_ALERT:
      state = state.setIn(['dialog', 'type'], 'alert');
      state = state.setIn(['dialog', 'isShow'], true);
      state = state.setIn(['dialog', 'msg'], msg);
      state = state.setIn(['dialog', 'confirm'], confirm);
      return state
    case GLOBAL_DIALOG_CONFIRM:

      state = state.setIn(['dialog', 'type'], 'confirm');
      state = state.setIn(['dialog', 'isShow'], true);
      state = state.setIn(['dialog', 'msg'], msg);
      state = state.setIn(['dialog', 'confirm'], confirm);
      state = state.setIn(['dialog', 'cancel'], cancel);

      return state
    case GLOBAL_DIALOG_TIPS:
      state = state.setIn(['dialog', 'type'], 'tips');
      state = state.setIn(['dialog', 'isShow'], true);
      state = state.setIn(['dialog', 'msg'], msg);
      return state;

    case GLOBAL_DIALOG_HIDE:
      state = state.setIn(['dialog', 'isShow'], false);
      return state;
    default:
      return state  
  }
}

const initialState = {
  dialog:{
    type:'',
    isShow:false,
    msg:'',
    actions:{
      confirm:{type: 'button', dispLabel: '确定', value: '1', className: 'btn-primary', trigger: 'confirm'},
      cancel:{type: 'button', dispLabel: '取消', value: '0', className: 'btn-default', trigger: 'cancel'}
    }
  }

}