import { Auth, Alert, Conversation, User, Message, Call } from './state';

export const SET_AUTH = 'SET_AUTH';
export const CLEAR_AUTH = 'CLEAR_AUTH';
export const SET_ALERT = 'SET_ALERT';
export const CLEAR_ALERT = 'CLEAR_ALERT';
export const SET_CONVERSATIONS = 'SET_CONVERSATIONS';
export const SET_USERS = 'SET_USERS';
export const SET_MESSAGES = 'SET_MESSAGES';
export const UPDATE_MESSAGES = 'UPDATE_MESSAGES';
export const UPDATE_CONVERSATIONS = 'UPDATE_CONVERSATIONS';
export const CHANGE_CONVERSATIONS = 'CHANGE_CONVERSATIONS';
export const CHANGE_USER = 'CHANGE_USER';
export const SET_CALL = 'SET_CALL';

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

interface SetMessagesAction {
  type: typeof SET_MESSAGES;
  // conv_id: string;
  messages: Message[];
}

interface UpdateMessagesAction {
  type: typeof UPDATE_MESSAGES;
  message: Message;
}

interface UpdateConversationsAction {
  type: typeof UPDATE_CONVERSATIONS;
  conversation: Conversation;
}

interface ChangeConversationsAction {
  type: typeof CHANGE_CONVERSATIONS;
  convchange: Conversation;
}

interface ChangeUserAction {
  type: typeof CHANGE_USER;
  userchange: User;
}

interface SetCallAction {
  type: typeof SET_CALL;
  call: Call;
}

export type AuthAction = SetAuthAction | ClearAuthAction;
export type AlertAction = SetAlertAction | ClearAlertAction;
export type Action =
  | AuthAction
  | AlertAction
  | SetConversationsAction
  | SetUsersAction
  | SetMessagesAction
  | UpdateMessagesAction
  | UpdateConversationsAction
  | ChangeConversationsAction
  | ChangeUserAction
  | SetCallAction;

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

export function setUsers(users: User[]): SetUsersAction {
  return {
    type: SET_USERS,
    users,
  };
}

export function setMessages(
  // conv_id: string,
  messages: Message[]
): SetMessagesAction {
  return {
    type: SET_MESSAGES,
    // conv_id,
    messages,
  };
}

export function updateMessages(message: Message): UpdateMessagesAction {
  return {
    type: UPDATE_MESSAGES,
    message,
  };
}

export function updateConversations(
  conversation: Conversation
): UpdateConversationsAction {
  return {
    type: UPDATE_CONVERSATIONS,
    conversation,
  };
}

export function changeConversations(
  convchange: Conversation
): ChangeConversationsAction {
  return {
    type: CHANGE_CONVERSATIONS,
    convchange,
  };
}

export function changeUser(userchange: User): ChangeUserAction {
  return {
    type: CHANGE_USER,
    userchange,
  };
}

export function setCall(call: Call): SetCallAction {
  return {
    type: SET_CALL,
    call,
  };
}
