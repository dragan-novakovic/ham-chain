import React, { useReducer, useContext } from "react";
import type { Dispatch } from "react";
import jsonrpc from "@polkadot/types/interfaces/jsonrpc";
import queryString from "query-string";

import { ApiPromise, WsProvider } from "@polkadot/api";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import keyring from "@polkadot/ui-keyring";
import type { Keyring } from "@polkadot/ui-keyring";

import config from "../config";

const parsedQuery = queryString.parse(window.location.search);
const connectedSocket = parsedQuery.rpc || config.PROVIDER_SOCKET;
console.log(`Connected socket: ${connectedSocket}`);

interface ContextState {
  socket: string;
  jsonrpc: any;
  types: any;
  keyring?: Keyring;
  keyringState?: any;
  api?: ApiPromise;
  apiError?: any;
  apiState?: any;
}

const INIT_STATE: ContextState = {
  socket: connectedSocket,
  jsonrpc: { ...jsonrpc, ...config.RPC },
  types: config.types,
  keyring: undefined,
  keyringState: null,
  api: undefined,
  apiError: null,
  apiState: null,
};

interface SubstrateAction {
  type: string;
  payload?: any;
}

const reducer = (state: ContextState, action: SubstrateAction) => {
  switch (action.type) {
    case "CONNECT_INIT":
      return { ...state, apiState: "CONNECT_INIT" };

    case "CONNECT":
      return { ...state, api: action.payload, apiState: "CONNECTING" };

    case "CONNECT_SUCCESS":
      return { ...state, apiState: "READY" };

    case "CONNECT_ERROR":
      return { ...state, apiState: "ERROR", apiError: action.payload };

    case "LOAD_KEYRING":
      return { ...state, keyringState: "LOADING" };

    case "SET_KEYRING":
      return { ...state, keyring: action.payload, keyringState: "READY" };

    case "KEYRING_ERROR":
      return { ...state, keyring: null, keyringState: "ERROR" };

    default:
      throw new Error(`Unknown type: ${action.type}`);
  }
};

///
// Connecting to the Substrate node

const connect = (state: ContextState, dispatch: Dispatch<any>) => {
  const { apiState, socket, jsonrpc, types } = state;
  // We only want this function to be performed once
  if (apiState) return;

  dispatch({ type: "CONNECT_INIT" });

  const provider = new WsProvider(socket);
  const _api = new ApiPromise({ provider, types, rpc: jsonrpc });

  // Set listeners for disconnection and reconnection event.
  _api.on("connected", () => {
    dispatch({ type: "CONNECT", payload: _api });
    // `ready` event is not emitted upon reconnection and is checked explicitly here.
    _api.isReady.then((_api) => dispatch({ type: "CONNECT_SUCCESS" }));
  });
  _api.on("ready", () => dispatch({ type: "CONNECT_SUCCESS" }));
  _api.on("error", (err) => dispatch({ type: "CONNECT_ERROR", payload: err }));
};

///
// Loading accounts from dev and polkadot-js extension

let loadAccts = false;
const loadAccounts = (state: ContextState, dispatch: Dispatch<any>) => {
  const asyncLoadAccounts = async () => {
    dispatch({ type: "LOAD_KEYRING" });
    try {
      await web3Enable(config.APP_NAME);
      let allAccounts = await web3Accounts();
      console.log("Web3 Accs:", { allAccounts });
      allAccounts = allAccounts.map(({ address, meta }) => ({
        address,
        meta: { ...meta, name: `${meta.name} (${meta.source})` },
      }));
      keyring.loadAll(
        { isDevelopment: config.DEVELOPMENT_KEYRING },
        allAccounts
      );
      dispatch({ type: "SET_KEYRING", payload: keyring });
    } catch (e) {
      console.error(e);
      dispatch({ type: "KEYRING_ERROR" });
    }
  };

  const { keyringState } = state;
  // If `keyringState` is not null `asyncLoadAccounts` is running.
  if (keyringState) return;
  // If `loadAccts` is true, the `asyncLoadAccounts` has been run once.
  if (loadAccts) return dispatch({ type: "SET_KEYRING", payload: keyring });

  // This is the heavy duty work
  loadAccts = true;
  asyncLoadAccounts();
};

const SubstrateContext = React.createContext(null);

const SubstrateContextProvider = (props: any) => {
  // filtering props and merge with default param value
  const initState = { ...INIT_STATE };
  const neededPropNames = ["socket", "types"];
  neededPropNames.forEach((key) => {
    ///@ts-ignore
    initState[key] =
      ///@ts-ignore
      typeof props[key] === "undefined" ? initState[key] : props[key];
  });

  ///@ts-ignore
  const [state, dispatch] = useReducer(reducer, initState);
  connect(state, dispatch);
  loadAccounts(state, dispatch);

  return (
    <SubstrateContext.Provider value={state}>
      {props.children}
    </SubstrateContext.Provider>
  );
};

const useSubstrate = () => ({
  ...useContext<ContextState>(SubstrateContext),
});

export { SubstrateContextProvider, useSubstrate };
