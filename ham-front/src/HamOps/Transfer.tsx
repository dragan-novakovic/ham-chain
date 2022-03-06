import React, { FC, useState } from "react";
import { Button, Dropdown, Grid, Input } from "semantic-ui-react";

//@ts-ignore
import { TxButton } from "../substrate-lib/components/TxButton.tsx";

const countryOptions = [
  { key: "af", value: "af", flag: "af", text: "Afghanistan" },
  { key: "ax", value: "ax", flag: "ax", text: "Aland Islands" },
  { key: "al", value: "al", flag: "al", text: "Albania" },
  { key: "dz", value: "dz", flag: "dz", text: "Algeria" },
  { key: "as", value: "as", flag: "as", text: "American Samoa" },
  { key: "ad", value: "ad", flag: "ad", text: "Andorra" },
  { key: "ao", value: "ao", flag: "ao", text: "Angola" },
  { key: "ai", value: "ai", flag: "ai", text: "Anguilla" },
  { key: "ag", value: "ag", flag: "ag", text: "Antigua" },
  { key: "ar", value: "ar", flag: "ar", text: "Argentina" },
  { key: "am", value: "am", flag: "am", text: "Armenia" },
  { key: "aw", value: "aw", flag: "aw", text: "Aruba" },
  { key: "au", value: "au", flag: "au", text: "Australia" },
  { key: "at", value: "at", flag: "at", text: "Austria" },
  { key: "az", value: "az", flag: "az", text: "Azerbaijan" },
  { key: "bs", value: "bs", flag: "bs", text: "Bahamas" },
  { key: "bh", value: "bh", flag: "bh", text: "Bahrain" },
  { key: "bd", value: "bd", flag: "bd", text: "Bangladesh" },
  { key: "bb", value: "bb", flag: "bb", text: "Barbados" },
  { key: "by", value: "by", flag: "by", text: "Belarus" },
  { key: "be", value: "be", flag: "be", text: "Belgium" },
  { key: "bz", value: "bz", flag: "bz", text: "Belize" },
  { key: "bj", value: "bj", flag: "bj", text: "Benin" },
];

export const TransferItem: FC<any> = ({ accountPair }) => {
  const [item, setItem] = useState();
  const [receiver, setReciver] = useState();
  const tranfer = () => {
    console.log("idk");
  };

  return (
    <Grid.Row divided style={css.input} centered>
      <Grid.Column>
        <h4>Select Animal: </h4>
        <Dropdown
          placeholder="Select Country"
          fluid
          search
          selection
          options={countryOptions}
        />
      </Grid.Column>
      <Grid.Column>
        <h4>To:</h4>
        <Dropdown
          placeholder="Select Country"
          fluid
          search
          selection
          options={countryOptions}
        />
      </Grid.Column>
      <Grid.Column verticalAlign="bottom">
        {" "}
        <TxButton
          accountPair={accountPair}
          label="Transfer"
          type="SIGNED-TX"
          setStatus={console.log}
          onClick={tranfer}
          attrs={{
            palletRpc: "hamModule",
            callable: "transferAnimal",
            inputParams: [
              "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
              "0x989c58590c2908179bbc261e0376f8d5",
            ],
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
