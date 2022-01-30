import { ApiPromise } from "@polkadot/api";
import { SubmittableModuleExtrinsics } from "@polkadot/api/types";
import { web3FromSource } from "@polkadot/extension-dapp";
import { ISubmittableResult } from "@polkadot/types/types";
import React, { useRef, useEffect, useState } from "react";
import { Button, Form } from "semantic-ui-react";
import { useSubstrate } from "../substrate-lib";
import { isOptional, txErrHandler, txResHandler } from "../utils";

// To-Do!
//  const metaArgs = _api.tx["hamModule"]["createHam"].meta.args;
//   const paramFields = metaArgs.map((arg: any) => ({
//     name: arg.name.toString(),
//     type: arg.type.toString(),
//     optional: isOptional(arg.type.toString()),
//   }));

export function CreateAnimal(props: any) {
  const { api } = useSubstrate();
  const { accountPair } = props;
  const [_ham_count, setHamCount] = useState<any>();
  const _api: ApiPromise = api;
  const hamKindRef = useRef<HTMLInputElement>(null);

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

  // useEffect(() => {
  //   _api.query["hamModule"].allHamsCount().then((r) => {
  //     setHamCount(r.toString());
  //     // setHamCount(ham_count);
  //   });
  // }, [api]);

  const sumbit = async () => {
    _api.tx["hamModule"]
      .createAnimal(null)
      .signAndSend(await getFromAcct(), (result: ISubmittableResult) => {
        alert(txResHandler(result));
      })
      .catch((err) => console.error(err));
  };
  return (
    <div style={{ border: "1px solid black", padding: 100 }}>
      <div>Current animal count: {_ham_count} </div>
      <Form>
        <Form.Field>
          <label>Animal Type</label>
          <input
            disabled={true}
            ref={hamKindRef}
            placeholder="Ham Type (Optional)"
          />
        </Form.Field>
        <Button type="submit" onClick={sumbit}>
          Submit
        </Button>
      </Form>
    </div>
  );
}
