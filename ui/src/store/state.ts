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

export interface Call {
  state: 'incoming' | 'calling' | 'call' | 'inactive';
  conversationId: number | null;
  offer: string | null;
}

export interface Message {
  msgid: number;
  senderid: number;
  convid: number;
  content: string;
}

export interface Conversation {
  convid: string;
  convname: string;
  shared_key: string;
  members: string;
  // messages: Message[];
}

export interface User extends Auth {
  publickey: string;
  online?: boolean;
}

export interface State {
  auth: Auth | false;
  alert: Alert | false;
  conversations: Conversation[];
  users: User[];
  messages: Message[];
  call: Call;
}

export const initialState: State = {
  auth: false,
  alert: false,
  conversations: [],
  users: [],
  messages: [],
  call: {
    state: 'inactive',
    conversationId: null,
    offer: null,
  },
};
