import React, { useRef } from "react";
import { ApiPromise } from "@polkadot/api";
import { web3FromSource } from "@polkadot/extension-dapp";
import { ISubmittableResult } from "@polkadot/types/types";
import { Button, Form, Input } from "semantic-ui-react";
//@ts-ignore
import { useSubstrate } from "../substrate-lib/SubstrateContext.tsx";
//@ts-ignore
import { txResHandler } from "../utils/index.ts";
//@ts-ignore
import { useAccount } from "../utils/useAccount.ts";

// To-Do!
//  const metaArgs = _api.tx["hamModule"]["createHam"].meta.args;
//   const paramFields = metaArgs.map((arg: any) => ({
//     name: arg.name.toString(),
//     type: arg.type.toString(),
//     optional: isOptional(arg.type.toString()),
//   }));

export function CreateAnimal(props: any) {
  const { api }: { api: ApiPromise } = useSubstrate();
  const { accountPair } = props;
  const hamKindRef = useRef<HTMLInputElement>(null);
  const acc = useAccount(accountPair, api);

  const sumbit = async () => {
    api.tx["hamModule"]
      .createAnimal()
      .signAndSend(acc, (result: ISubmittableResult) => {
        alert(txResHandler(result));
      })
      .catch((err) => console.error(err));
  };

  return (
    <div style={css.input}>
      <Form>
        <Form.Field>
          <h4>Animal Type: </h4>
          <Input
            input={{ ref: hamKindRef }}
            placeholder="Animal Type (Optional) TO-DO"
            icon="tags"
            iconPosition="left"
            label={{ tag: true, content: "Add Type" }}
            labelPosition="right"
          />
        </Form.Field>
        <Button type="submit" size="small" onClick={sumbit}>
          Submit
        </Button>
      </Form>
    </div>
  );
}

const css = {
  input: { border: "1px solid black", padding: 50 },
};
