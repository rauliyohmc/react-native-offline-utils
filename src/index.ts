import _NetworkProvider from './components/NetworkProvider';
import _ReduxNetworkProvider from './components/ReduxNetworkProvider';
import _NetworkConsumer from './components/NetworkConsumer';
import _reducer from './redux/createReducer';
import _createNetworkMiddleware from './redux/createNetworkMiddleware';
import * as _offlineActionTypes from './redux/actionTypes';
import _networkSaga from './redux/sagas';
import _checkInternetConnection from './utils/checkInternetConnection';

export const NetworkProvider = _NetworkProvider;
export const ReduxNetworkProvider = _ReduxNetworkProvider;
export const NetworkConsumer = _NetworkConsumer;
export const reducer = _reducer();
export const createReducer = reducer;
export const createNetworkMiddleware = _createNetworkMiddleware;
export const offlineActionTypes = _offlineActionTypes;
export const networkSaga = _networkSaga;
export const checkInternetConnection = _checkInternetConnection;
