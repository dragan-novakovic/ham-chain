// This component will simply add utility functions to your developer console.
import { useSubstrate } from "..";

export default function DeveloperConsole() {
  const { api, apiState, keyring, keyringState } = useSubstrate();
  if (apiState === "READY") {
    //@ts-ignore
    window.api = api;
  }
  if (keyringState === "READY") {
    //@ts-ignore
    window.keyring = keyring;
  }
  //@ts-ignore
  window.util = require("@polkadot/util");
  //@ts-ignore
  window.utilCrypto = require("@polkadot/util-crypto");

  return null;
}
