import { ApiPromise } from "@polkadot/api";
import React, { useRef, useEffect } from "react";
import { Button, Form } from "semantic-ui-react";
import { useSubstrate } from "../substrate-lib";

export function CreateHam() {
  const { api } = useSubstrate();
  const _api: ApiPromise = api;
  const hamKindRef = useRef<HTMLInputElement>(null);

  const sumbit = async () => {
    const tm = await _api.tx;
    console.log({ tm });
  };
  console.log(api);
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
