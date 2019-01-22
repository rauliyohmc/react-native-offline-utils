/* @flow */

import { find, get } from 'lodash';
import {
  fetchOfflineMode,
  removeActionFromQueue,
  dismissActionsFromQueue,
} from './actionCreators';
import getSimilarActionInQueue from '../utils/getSimilarActionInQueue';
import type { NetworkState } from '../types';

type MiddlewareAPI<S> = {
  dispatch: (action: any) => void,
  getState(): S,
};

type State = {
  network: NetworkState,
};

type Arguments = {|
  regexActionType: RegExp,
  actionTypes: Array<string>,
|};

function createNetworkMiddleware({
  regexActionType = /FETCH.*REQUEST/,
  actionTypes = [],
}: Arguments = {}) {
  return ({ getState }: MiddlewareAPI<State>) => (
    next: (action: any) => void,
  ) => (action: any) => {
    if ({}.toString.call(regexActionType) !== '[object RegExp]')
      throw new Error('You should pass a regex as regexActionType param');

    if ({}.toString.call(actionTypes) !== '[object Array]')
      throw new Error('You should pass an array as actionTypes param');

    const { isConnected, actionQueue } = getState().network;

    const isObjectAndMatchCondition =
      typeof action === 'object' &&
      (regexActionType.test(action.type) || actionTypes.includes(action.type));

    const isFunctionAndMatchCondition =
      typeof action === 'function' && action.interceptInOffline === true;

    if (isObjectAndMatchCondition || isFunctionAndMatchCondition) {
      const mode = get(action, 'meta.mode', 'intercept');

      if (isConnected === false) {
        // In proxy mode let action continue to be dispatched
        if (mode === 'proxy') {
          next(action);
        }

        // Offline, preventing the original action from being dispatched.
        // Dispatching an internal action instead.
        return next(fetchOfflineMode(action));
      }
      const actionQueued =
        actionQueue.length > 0
          ? getSimilarActionInQueue(action, actionQueue)
          : null;
      if (actionQueued) {
        // Back online and the action that was queued is about to be dispatched.
        // Removing action from queue, prior to handing over to next middleware or final dispatch
        next(removeActionFromQueue(action));

        return next(action);
      }
    }

    // We don't want to dispatch actions all the time, but rather when there is a dismissal case
    const isAnyActionToBeDismissed = find(actionQueue, (a: *) => {
      const actionsToDismiss = get(a, 'meta.dismiss', []);
      return actionsToDismiss.includes(action.type);
    });
    if (isAnyActionToBeDismissed && !isConnected) {
      next(dismissActionsFromQueue(action.type));
      return next(action);
    }

    return next(action);
  };
}

export default createNetworkMiddleware;
