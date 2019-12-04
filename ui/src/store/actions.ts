import { Auth, Alert, Conversation, User } from './state';

export const SET_AUTH = 'SET_AUTH';
export const CLEAR_AUTH = 'CLEAR_AUTH';
export const SET_ALERT = 'SET_ALERT';
export const CLEAR_ALERT = 'CLEAR_ALERT';
export const SET_CONVERSATIONS = 'SET_CONVERSATIONS';
export const SET_USERS = 'SET_USERS';


interface SetAuthAction {
  type: typeof SET_AUTH;
  auth: Auth;
}

interface ClearAuthAction {
  type: typeof CLEAR_AUTH;
}

interface SetAlertAction {
  type: typeof SET_ALERT;
  alert: Alert;
}

interface ClearAlertAction {
  type: typeof CLEAR_ALERT;
}

interface SetConversationsAction {
  type: typeof SET_CONVERSATIONS;
  conversations: Conversation[];
}

interface SetUsersAction {
  type: typeof SET_USERS;
  users: User[];
}


export type AuthAction = SetAuthAction | ClearAuthAction;
export type AlertAction = SetAlertAction | ClearAlertAction;
export type Action = AuthAction | AlertAction | SetConversationsAction | SetUsersAction;




export function setAuth(auth: Auth): SetAuthAction {
  return {
    type: SET_AUTH,
    auth,
  };
}

export function clearAuth(): ClearAuthAction {
  return {
    type: CLEAR_AUTH,
  };
}

export function alertInfo(content: string): SetAlertAction {
  return {
    type: SET_ALERT,
    alert: {
      kind: 'info',
      content,
    },
  };
}

export function alertError(content: string): SetAlertAction {
  return {
    type: SET_ALERT,
    alert: {
      kind: 'error',
      content,
    },
  };
}

export function clearAlert(): ClearAlertAction {
  return {
    type: CLEAR_ALERT,
  };
}

export function setConversations(
  conversations: Conversation[]
): SetConversationsAction {
  return {
    type: SET_CONVERSATIONS,
    conversations,
  };
}

export function setUsers(
  users: User[]
): SetUsersAction {
  return {
    type: SET_USERS,
    users,
  };
}

