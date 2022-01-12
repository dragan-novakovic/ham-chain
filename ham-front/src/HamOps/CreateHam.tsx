import { ApiPromise } from "@polkadot/api";
import { SubmittableModuleExtrinsics } from "@polkadot/api/types";
import React, { useRef, useEffect, useState } from "react";
import { Button, Form } from "semantic-ui-react";
import { useSubstrate } from "../substrate-lib";
import { isOptional } from "../utils";

// To-Do!
//  const metaArgs = _api.tx["hamModule"]["createHam"].meta.args;
//   const paramFields = metaArgs.map((arg: any) => ({
//     name: arg.name.toString(),
//     type: arg.type.toString(),
//     optional: isOptional(arg.type.toString()),
//   }));

export function CreateHam() {
  const { api } = useSubstrate();
  const [_ham_count, setHamCount] = useState<any>();
  const _api: ApiPromise = api;
  const hamKindRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    _api.query["hamModule"].allHamsCount().then((r) => {
      setHamCount(r.toString());
      // setHamCount(ham_count);
    });
  }, [api]);

  const sumbit = async () => {
    _api.tx["hamModule"]
      .createHam(null)
      .signAndSend(fromAcct, txResHandler)
      .catch(txErrHandler);
  };
  return (
    <div style={{ border: "1px solid black", padding: 100 }}>
      <div>Current ham count: {_ham_count} </div>
      <Form>
        <Form.Field>
          <label>Ham Type</label>
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
