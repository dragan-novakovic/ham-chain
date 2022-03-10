import React, { FC, useEffect, useState } from "react";
import { Button, Dropdown, Grid, Input } from "semantic-ui-react";

//@ts-ignore
import { TxButton } from "../substrate-lib/components/TxButton.tsx";
//@ts-ignore
import { useSubstrate } from "../substrate-lib/SubstrateContext.tsx";

export const TransferItem: FC<any> = ({ accountPair, allAnimals }) => {
  const { keyring } = useSubstrate();
  const [item, setItem] = useState();
  const [animals, setAnimals] = useState([]);
  const [receiver, setReciver] = useState();
  const tranfer = () => {
    console.log("idk");
  };

  const keyringOptions = keyring.getPairs().map((account: any) => ({
    key: account.address,
    value: account.address,
    text: account.meta.name.toUpperCase(),
    icon: "user",
  }));

  const select = (_, data) => {
    if (data.placeholder === "Select Animal") {
      setItem(data.value);
    } else {
      setReciver(data.value);
    }
  };

  useEffect(() => {
    const data = allAnimals?.map(({ id }) => ({
      key: id,
      value: id,
      text: id,
      icon: "industry",
    }));
    setAnimals(data);
  }, [allAnimals]);
  return (
    <Grid.Row divided style={css.input} centered>
      <Grid.Column>
        <h4>Select Animal: </h4>
        <Dropdown
          placeholder="Select Animal"
          fluid
          search
          selection
          options={animals}
          onChange={select}
        />
      </Grid.Column>
      <Grid.Column>
        <h4>To:</h4>
        <Dropdown
          placeholder="Select Customer"
          fluid
          search
          selection
          options={keyringOptions}
          onChange={select}
        />
      </Grid.Column>
      <Grid.Column verticalAlign="bottom">
        {" "}
        <TxButton
          accountPair={accountPair}
          disabled={!receiver && !item}
          label="Transfer"
          type="SIGNED-TX"
          setStatus={console.log}
          onClick={tranfer}
          attrs={{
            palletRpc: "hamModule",
            callable: "transferAnimal",
            inputParams: [receiver, item],
            paramFields: [true, true],
          }}
        />
      </Grid.Column>
    </Grid.Row>
  );
};

const css = {
  input: { border: "1px solid black", padding: 50, marginTop: 50 },
};

/**

system:ExtrinsicFailed:: (phase={"applyExtrinsic":1})-3
{"_enum":
{
"Other":"Null",
"CannotLookup":"Null",
"BadOrigin":"Null",
"Module":"{\"index\":\"u8\",\"error\":\"u8\"}",
"ConsumerRemaining":"Null",
"NoProviders":"Null",
"Token":"SpRuntimeTokenError",
"Arithmetic":"SpRuntimeArithmeticError"}}: 
{"module":{"index":8,"error":4}}, HamNotExist
{
"weight":"u64",
"class":"FrameSupportWeightsDispatchClass",
"paysFee":"FrameSupportWeightsPays"}: 
{"weight":100,"class":"Normal","paysFee":"Yes"}
An extrinsic failed.



 */
