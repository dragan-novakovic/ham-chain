import { ApiPromise } from "@polkadot/api";
import { SubmittableModuleExtrinsics } from "@polkadot/api/types";
import React, { useRef, useEffect, useState } from "react";
import { Button, Form } from "semantic-ui-react";
import { useSubstrate } from "../substrate-lib";

export function CreateHam() {
  const { api } = useSubstrate();
  const [, setPalletRPCs] = useState<string[]>([]);
  const [txModule, setTxModule] =
    useState<SubmittableModuleExtrinsics<"promise">>();
  const _api: ApiPromise = api;
  const hamKindRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const palletRPCs = Object.keys(api.tx);
    setPalletRPCs(palletRPCs);
    setTxModule(_api.tx["hamModule"]);
  }, [api]);

  const sumbit = async () => {
    const metaArgs = _api.tx["hamModule"]["createHam"].meta.args;
    const paramFields = metaArgs.map((arg: any) => ({
      name: arg.name.toString(),
      type: arg.type.toString(),
      optional: true,
    }));

    console.log({ paramFields });
    // console.log(_api.query["hamModule"].hams());
  };
  return (
    <Form>
      <Form.Field>
        <label>HamKind</label>
        <input ref={hamKindRef} placeholder="HamKind" />
      </Form.Field>
      <Button type="submit" onClick={sumbit}>
        Submit
      </Button>
    </Form>
  );
}
