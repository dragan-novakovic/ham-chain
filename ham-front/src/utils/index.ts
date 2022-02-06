// Construct a Ham ID from storage key

import { useState } from "react";
import { useSubstrate } from "../substrate-lib/SubstrateContext.tsx";

export const isOptional = (type: string) => type.startsWith("Option<");

export const txResHandler = ({ status }: any) =>
  status.isFinalized
    ? `😉 Finalized. Block hash: ${status.asFinalized.toString()}`
    : `Current transaction status: ${status.type}`;

export const txErrHandler = (err: any) =>
  `😞 Transaction Failed: ${err.toString()}`;

const convertToHamHash = (entry: any) => `0x${entry[0].toJSON().slice(-64)}`;
