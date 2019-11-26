import { Auth } from './state';

export const SET_AUTH = 'SET_AUTH';
export const CLEAR_AUTH = 'CLEAR_AUTH';

interface SetAuthAction {
  type: typeof SET_AUTH;
  auth: Auth;
}

interface ClearAuthAction {
  type: typeof CLEAR_AUTH;
}

export type Action = SetAuthAction | ClearAuthAction;

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
