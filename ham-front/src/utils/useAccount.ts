import { web3FromSource } from "@polkadot/extension-dapp";
import { useEffect, useState } from "react";

export const useAccount = (accountPair: any, api: any) => {
  const [acc, setAcc] = useState();
  useEffect(() => {
    const getFromAcct = async () => {
      const {
        address,
        meta: { source, isInjected },
      } = accountPair;
      let fromAcct;

      // signer is from Polkadot-js browser extension
      if (isInjected) {
        const injected = await web3FromSource(source);
        fromAcct = address;
        api.setSigner(injected.signer);
      } else {
        fromAcct = accountPair;
      }

      setAcc(fromAcct);
    };

    getFromAcct();
  }, [accountPair, api]);

  return acc;
};
