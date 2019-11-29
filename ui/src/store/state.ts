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

export interface State {
  auth: Auth | false;
  alert: Alert | false;
}

export const initialState: State = {
  auth: false,
  alert: false,
};
