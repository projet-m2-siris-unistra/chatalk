export interface Auth {
  userId: number;
  username: string;
  displayName?: string;
  avatar?: string;
};

export interface State {
  auth: Auth | false;
};

export const initialState: State = {
  auth: false,
};
