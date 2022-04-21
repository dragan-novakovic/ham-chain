//@ts-nocheck
import React, { useEffect, useState } from "react";
import { Table, Grid, Button } from "semantic-ui-react";
//@ts-ignore
import { useSubstrate } from "./substrate-lib/SubstrateContext.tsx";

export default function Main(props: any) {
  const { api, keyring } = useSubstrate();
  const accounts = keyring.getPairs();
  const [balances, setBalances] = useState({});

  useEffect(() => {
    const addresses = keyring.getPairs().map((account: any) => account.address);
    let unsubscribeAll: any = null;

    api.query.system.account
      .multi(addresses, (balances: any) => {
        const balancesMap = addresses.reduce(
          (acc: any, address: any, index: any) => ({
            ...acc,
            [address]: balances[index].data.free.toHuman(),
          }),
          {}
        );
        setBalances(balancesMap);
      })
      .then((unsub: any) => {
        unsubscribeAll = unsub;
      })
      .catch(console.error);

    return () => unsubscribeAll?.();
  }, [api, keyring, setBalances]);

  return (
    <Grid.Column>
      <h1>Balances</h1>
      <Table celled striped size="small">
        <Table.Body>
          <Table.Row>
            <Table.Cell width={3} textAlign="right">
              <strong>Name</strong>
            </Table.Cell>
            <Table.Cell width={10}>
              <strong>Address</strong>
            </Table.Cell>
            <Table.Cell width={3}>
              <strong>Balance</strong>
            </Table.Cell>
          </Table.Row>
          {accounts.map((account: any) => (
            <Table.Row key={account.address}>
              <Table.Cell width={3} textAlign="right">
                {account.meta.name}
              </Table.Cell>
              <Table.Cell width={10}>
                <span style={{ display: "inline-block", minWidth: "31em" }}>
                  {account.address}
                </span>
                <Button
                  basic
                  circular
                  compact
                  size="mini"
                  color="blue"
                  icon="copy outline"
                />
              </Table.Cell>
              <Table.Cell width={3}>
                {/* 
                  ///@ts-ignore      */}
                {balances && balances?.[account.address]}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Grid.Column>
  );
}
