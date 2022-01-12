// Construct a Ham ID from storage key

import { useState } from "react";
import { useSubstrate } from "../substrate-lib";

export const isOptional = (type: string) => type.startsWith("Option<");

export const txResHandler = ({ status }: any) =>
  status.isFinalized
    ? `😉 Finalized. Block hash: ${status.asFinalized.toString()}`
    : `Current transaction status: ${status.type}`;

export const txErrHandler = (err: any) =>
  `😞 Transaction Failed: ${err.toString()}`;

const convertToHamHash = (entry: any) => `0x${entry[0].toJSON().slice(-64)}`;

// Construct a Ham object
const constructHam = (hash: any, { dna, price, gender, owner }: any) => ({
  id: hash,
  dna,
  price: price.toJSON(),
  gender: gender.toJSON(),
  owner: owner.toJSON(),
});

// Use React hooks
export default function Hams(props: any) {
  const { api, keyring } = useSubstrate();
  const { accountPair } = props;

  const [HamHashes, setHamHashes] = useState([]);
  const [Hams, setHams] = useState([]);
  const [status, setStatus] = useState("");
}
