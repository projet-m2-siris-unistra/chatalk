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
      return {
        ...state,
        messages: [...state.messages, ...action.messages],
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
      }
  }
  return state;
};
