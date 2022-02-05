import { web3FromSource } from "@polkadot/extension-dapp";
import { useEffect, useState } from "react";
import { Grid } from "semantic-ui-react";
import { CreateAnimal } from "../HamOps/CreateAnimal.tsx";
import { useSubstrate } from "../substrate-lib/SubstrateContext.tsx";

export default function FarmView({ accountPair }: any) {
  const { api } = useSubstrate();
  const [allAnimals, setAnimals] = useState<any>([]);

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

  const subscribeAnimal = () => {
    let unsub = null;

    const asyncFetch = async () => {
      const rawData = await api.query.hamModule.animals.entries();
      const animalList = rawData.map(([hash, option]) => {
        const { id, owner } = option.toHuman();
        return { hash, id, owner };
      });

      setAnimals(animalList);
    };

    asyncFetch();

    return () => {
      unsub?.();
    };
  };

  useEffect(subscribeAnimal, [api]);

  return (
    <Grid.Row>
      <CreateAnimal accountPair={accountPair} />
      <ul>
        <li>Account Farmer login obican + wallet</li>
        {allAnimals?.map(({ hash, id, owner }) => (
          <li>ID: {id}</li>
        ))}
      </ul>
    </Grid.Row>
  );
}

export const AnimalList = () => {
  return <div>Hello</div>;
};
