export interface Auth {
  userid: number;
  username: string;
  displayname?: string;
  avatar?: string;
}

export interface Alert {
  kind: 'info' | 'error';
  content: string;
}

export interface Conversation {
  convid: string;
  convname: string;
  shared_key: string;
  members: string;
}

export interface Message {
  msgid: number;
  senderid: number;
  convid: number;
  content: string;
}

export interface User extends Auth {
  online?: boolean;
}

export interface State {
  auth: Auth | false;
  alert: Alert | false;
  conversations: Conversation[];
  users: User[];
  messages: Message[];
}

export const initialState: State = {
  auth: false,
  alert: false,
  conversations: [],
  users: [],
  messages: [],
};
