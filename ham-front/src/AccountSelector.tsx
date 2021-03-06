//@ts-nocheck
import React, { useState, useEffect } from "react";

import {
  Menu,
  Button,
  Dropdown,
  Container,
  Icon,
  Image,
  Label,
} from "semantic-ui-react";

import { useSubstrate } from "./substrate-lib/SubstrateContext.tsx";

function Main(props: any) {
  const { keyring } = useSubstrate();
  const { setAccountAddress } = props;
  const [accountSelected, setAccountSelected] = useState("");

  // Get the list of accounts we possess the private key for
  const keyringOptions = keyring.getPairs().map((account: any) => ({
    key: account.address,
    value: account.address,
    text: account.meta.name.toUpperCase(),
    icon: "user",
  }));

  const initialAddress =
    keyringOptions.length > 0 ? keyringOptions[0].value : "";

  // Set the initial address
  useEffect(() => {
    setAccountAddress(initialAddress);
    setAccountSelected(initialAddress);
  }, [setAccountAddress, initialAddress]);

  const onChange = (address: any) => {
    // Update state with new account address
    setAccountAddress(address);
    setAccountSelected(address);
  };

  return (
    <Menu
      attached="top"
      tabular
      style={{
        backgroundColor: "#fff",
        borderColor: "#fff",
        paddingTop: "1em",
        paddingBottom: "1em",
      }}
    >
      <Container>
        <Menu.Menu>
          <div style={{ display: "flex" }}>
            <Image
              src={`${process.env.PUBLIC_URL}/assets/substrate-logo.png`}
              size="mini"
            />
            <div style={{ marginLeft: 15 }}>
              <p style={{ fontSize: 32, fontWeight: "bold" }}>Lager</p>
            </div>
          </div>
        </Menu.Menu>
        <Menu.Menu position="right" style={{ alignItems: "center" }}>
          {!accountSelected ? (
            <span>
              Add your account with the{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/polkadot-js/extension"
              >
                Polkadot JS Extension
              </a>
            </span>
          ) : null}
          <Button
            basic
            circular
            size="large"
            icon="user"
            color={accountSelected ? "green" : "red"}
          />
          <Dropdown
            search
            selection
            clearable
            placeholder="Select an account"
            options={keyringOptions}
            onChange={(_, dropdown) => {
              onChange(dropdown.value);
            }}
            value={accountSelected}
          />
          <BalanceAnnotation accountSelected={accountSelected} />
        </Menu.Menu>
      </Container>
    </Menu>
  );
}

function BalanceAnnotation(props: any) {
  const { accountSelected } = props;
  const { api } = useSubstrate();
  const [accountBalance, setAccountBalance] = useState(0);

  // When account address changes, update subscriptions
  useEffect(() => {
    let unsubscribe: any;

    // If the user has selected an address, create a new subscription
    accountSelected &&
      api.query.system
        .account(accountSelected, (balance: any) => {
          setAccountBalance(balance.data.free.toHuman());
        })
        .then((unsub: any) => {
          unsubscribe = unsub;
        })
        .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api, accountSelected]);

  return accountSelected ? (
    <Label pointing="left">
      <Icon name="money" color="green" />
      {accountBalance}
    </Label>
  ) : null;
}

export default function AccountSelector(props: any) {
  const { api, keyring } = useSubstrate();
  return keyring.getPairs && api.query ? <Main {...props} /> : null;
}
