//@ts-nocheck
import React, { useState } from "react";
import { Container, Dimmer, Loader, Grid, Message } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

import {
  SubstrateContextProvider,
  useSubstrate,
} from "./substrate-lib/SubstrateContext.tsx";

import AccountSelector from "./AccountSelector.tsx";
import Events from "./Events.tsx";
import Interactor from "./Interactor.tsx";
import Balances from "./Balances.tsx";
import Login from "./Pages/Login.tsx";
import useAuth from "./utils/useAuth.ts";
import FarmView from "./Pages/FarmView.tsx";
import HamView from "./Pages/HamView.tsx";
import CustomerView from "./Pages/CustomerView.tsx";

function Main(props: any) {
  const [accountAddress, setAccountAddress] = useState(null);
  const [view, setView] = useState(1);
  const { apiState, keyring, keyringState, apiError } = useSubstrate();
  const accountPair =
    accountAddress &&
    keyringState === "READY" &&
    keyring.getPair(accountAddress);

  const loader = (text: string) => (
    <Dimmer active>
      <Loader size="small">{text}</Loader>
    </Dimmer>
  );

  const message = (err: any) => (
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message
          negative
          compact
          floating
          header="Error Connecting to Substrate"
          content={`${JSON.stringify(err, null, 4)}`}
        />
      </Grid.Column>
    </Grid>
  );

  if (apiState === "ERROR") return message(apiError);
  else if (apiState !== "READY") return loader("Connecting to Substrate");

  if (keyringState !== "READY") {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    );
  }

  const changeView = (e) => {
    setView(Number(e.target.value));
  };

  const selectView = (perm: number) => {
    switch (perm) {
      case 0:
        return <FarmView accountPair={accountPair} />;
      case 1:
        return <HamView accountPair={accountPair} />;
      case 2:
        return <CustomerView accountPair={accountPair} />;

      default:
        <CustomerView accountPair={accountPair} />;
    }
  };

  return (
    <div>
      <div>
        Select View
        <input onChange={changeView} />
      </div>
      <AccountSelector setAccountAddress={setAccountAddress} />
      <Container>
        <Grid stackable columns="equal">
          {selectView(view)}
          <Grid.Row>
            <Events />
          </Grid.Row>
          <Grid.Row>
            <Interactor accountPair={accountPair} />
          </Grid.Row>
          <Grid.Row>
            <Balances />
          </Grid.Row>
        </Grid>
      </Container>
    </div>
  );
}

export default function App() {
  const [login, setLogin] = useState(useAuth());

  return (
    <SubstrateContextProvider>
      {login[0] ? <Main authData={login[1]} /> : <Login setLogin={setLogin} />}
    </SubstrateContextProvider>
  );
}
