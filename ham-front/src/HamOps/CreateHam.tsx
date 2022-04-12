import { ApiPromise } from "@polkadot/api";
import { web3FromSource } from "@polkadot/extension-dapp";
import { ISubmittableResult } from "@polkadot/types/types";
import React, { useRef, useEffect, useState } from "react";
import { Button, Dropdown, Form } from "semantic-ui-react";

//@ts-ignore
import { useSubstrate } from "../substrate-lib/SubstrateContext.tsx";
//@ts-ignore
import { isOptional, txErrHandler, txResHandler } from "../utils/index.ts";
//@ts-ignore
import { useAccount } from "../utils/useAccount.ts";

// To-Do!
//  const metaArgs = _api.tx["hamModule"]["createHam"].meta.args;
//   const paramFields = metaArgs.map((arg: any) => ({
//     name: arg.name.toString(),
//     type: arg.type.toString(),
//     optional: isOptional(arg.type.toString()),
//   }));

export function CreateHam(props: any) {
  const { api }: { api: ApiPromise } = useSubstrate();
  const [ownedAnimals, setOwnedAnimals] = useState([]);
  const [animal, selectAnimal] = useState(null);

  const { accountPair } = props;
  console.log({ accountPair });
  const account = useAccount(accountPair, api);
  const hamKindRef = useRef<HTMLInputElement>(null);

  const selectHamType = () => {
    //query possible types
    //add to dropdown
    //set to ref(state)
  };

  const getOwnedAnimals = () => {
    const asyncFetch = async () => {
      const rawData = await api.query.hamModule.animals.entries();
      const animalList = rawData
        .map(([hash, option]) => {
          const { id, owner } = option.toHuman();

          if (owner === account.address) {
            return { key: hash, value: id, text: id };
          } else {
            return null;
          }
        })
        .filter(Boolean);

      setOwnedAnimals(animalList);
    };

    asyncFetch();
  };

  useEffect(() => getOwnedAnimals, [account]);

  const sumbit = async () => {
    api.tx["hamModule"]
      .createHam(undefined, animal)
      .signAndSend(account, (result: ISubmittableResult) => {
        alert(txResHandler(result));
      })
      .catch((err) => console.error(err));
  };

  return (
    <div style={{ border: "1px solid black", padding: 100 }}>
      <Form>
        <h2>Create Ham</h2>
        <Form.Field>
          <label>Ham Type</label>
          <input
            disabled={true}
            ref={hamKindRef}
            placeholder="Ham Type (Optional)"
          />
          <Dropdown
            placeholder="Choose Animal"
            fluid
            search
            selection
            options={ownedAnimals}
            onChange={(_, data) => {
              selectAnimal(data.value);
            }}
          />
        </Form.Field>
        <Button type="submit" onClick={sumbit}>
          Submit
        </Button>
      </Form>
    </div>
  );
}
