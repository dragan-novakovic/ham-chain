import React, { useState, createRef } from "react";
import { Container, Dimmer, Loader, Grid, Message } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

import { SubstrateContextProvider, useSubstrate } from "./substrate-lib";

import AccountSelector from "./AccountSelector";
import Balances from "./Balances";
import Events from "./Events";
import Interactor from "./Interactor";
import Metadata from "./Metadata";
import Transfer from "./Transfer";
import { CreateHam } from "./HamOps";
import LoginPage from "./Pages/Login";
import Login from "./Pages/Login";
import useAuth from "./utils/useAuth";
import FarmView from "./Pages/FarmView";

function Main(props: any) {
  const [accountAddress, setAccountAddress] = useState(null);
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

  const selectView = (perm: number) => {
    switch (perm) {
      case 0:
        return <FarmView />;

      default:
        <FarmView />;
    }
  };

  return (
    <div>
      <AccountSelector setAccountAddress={setAccountAddress} />
      <Container>
        <Grid stackable columns="equal">
          <Grid.Row>
            <CreateHam accountPair={accountPair} />
          </Grid.Row>
          {selectView(0)}
          <Grid.Row>
            <Interactor accountPair={accountPair} />
            <Events />
          </Grid.Row>
        </Grid>
      </Container>
    </div>
  );
}

export default function App() {
  const [isLoggedIn, loginData] = useAuth();

  return (
    <SubstrateContextProvider>
      {isLoggedIn ? <Login /> : <Main auth={loginData} />}
    </SubstrateContextProvider>
  );
}
