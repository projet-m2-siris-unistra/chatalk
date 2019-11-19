import {initialState, State} from './state';
import * as actions from './actions';

export default (state: State = initialState, action: actions.Action): State => {
  switch(action.type) {
    case actions.SET_AUTH:
      return {
        ...state,
        auth: action.auth,
      };
    case actions.CLEAR_AUTH:
      return {
        ...state,
        auth: false,
      };
  }
  return state;
};
