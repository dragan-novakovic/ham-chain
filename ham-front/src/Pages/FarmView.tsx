import { web3FromSource } from "@polkadot/extension-dapp";
import { useEffect } from "react";
import { Grid } from "semantic-ui-react";
import { CreateAnimal } from "../HamOps/CreateAnimal";
import { useSubstrate } from "../substrate-lib";

export default function FarmView({ accountPair }: any) {
  const { api } = useSubstrate();
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

    return fromAcct;
  };

  useEffect(() => {
    api.query["hamModule"].animals(null).then((r: any) => {
      console.log("Q", r.toHuman());
    });
  }, [api]);

  return (
    <Grid.Row>
      <CreateAnimal accountPair={accountPair} />
      <ul>
        <li>Account Farmer login obican + wallet</li>
        <li>Farma kerira Animal () </li>
        <li>Lista njegovih Animal </li>
      </ul>
    </Grid.Row>
  );
}

export const AnimalList = () => {
  return <div>Hello</div>;
};
