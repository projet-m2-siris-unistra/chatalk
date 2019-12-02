export interface Auth {
  userId: number;
  username: string;
  displayName?: string;
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

export interface State {
  auth: Auth | false;
  alert: Alert | false;
  conversations: Conversation[];
}

export const initialState: State = {
  auth: false,
  alert: false,
  conversations: [],
};
