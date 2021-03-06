import { initialState, State } from './state';
import * as actions from './actions';

export default (state: State = initialState, action: actions.Action): State => {
  switch (action.type) {
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
    case actions.SET_ALERT:
      return {
        ...state,
        alert: action.alert,
      };
    case actions.CLEAR_ALERT:
      return {
        ...state,
        alert: false,
      };
    case actions.SET_CONVERSATIONS:
      return {
        ...state,
        conversations: action.conversations,
      };
    case actions.SET_USERS:
      return {
        ...state,
        users: action.users,
      };
    case actions.SET_MESSAGES:
      // const conversations = state.conversations.map(c => (c.convid === actions.convid) ? {
      //   ...c,
      //   messages: [...c.messages, ...action.messages]
      // } : c);
      //sort + dedupli
      return {
        ...state,
        messages: action.messages,
      };
    case actions.UPDATE_MESSAGES:
      return {
        ...state,
        messages: [...state.messages, action.message],
      };
    case actions.UPDATE_CONVERSATIONS:
      return {
        ...state,
        conversations: [...state.conversations, action.conversation],
      };
    case actions.CHANGE_CONVERSATIONS:
      var conversations = state.conversations.map(c =>
        c.convid === action.convchange.convid ? action.convchange : c
      );
      return {
        ...state,
        conversations,
      };
    case actions.CHANGE_USER:
      var users = state.users.map(u =>
        u.userid === action.userchange.userid ? action.userchange : u
      );
      return {
        ...state,
        users,
      };
    case actions.SET_CALL:
      return {
        ...state,
        call: action.call,
      };
  }
  return state;
};
