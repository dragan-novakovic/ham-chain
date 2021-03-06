import { useEffect, useState } from "react";
import { Grid, Item } from "semantic-ui-react";

//@ts-ignore
import { CreateAnimal } from "../HamOps/CreateAnimal.tsx";
//@ts-ignore
import { TransferItem } from "../HamOps/Transfer.tsx";
//@ts-ignore
import { useSubstrate } from "../substrate-lib/SubstrateContext.tsx";

//@ts-ignore
import cow from "../../public/assets/cow.png";

//!TO-DO
// 1. Expand Firebase
// Animal Description, date, name
// wallet -> UserName

export default function FarmView({ accountPair }: any) {
  const { api } = useSubstrate();
  const [allAnimals, setAnimals] = useState<any>([]);

  const subscribeAnimal = () => {
    let unsub = null;

    const asyncFetch = async () => {
      const rawData = await api.query.hamModule.animals.entries();
      const animalList = rawData.map(([hash, option]) => {
        const { id, owner } = option.toHuman();
        return { hash, id, owner };
      });

      setAnimals(animalList);
    };

    asyncFetch();

    return () => {
      unsub?.();
    };
  };

  useEffect(subscribeAnimal, [api]);

  return (
    <>
      <Grid.Row divided style={{ marginTop: 50 }}>
        <Grid.Column>
          <h3>Kreiranje:</h3>
          <CreateAnimal accountPair={accountPair} />
        </Grid.Column>
        <Grid.Column>
          <h3>Lista:</h3>
          <Item.Group divided style={{ margin: 10 }}>
            {allAnimals?.map(({ hash, id, owner }) => (
              <Item key={id}>
                <Item.Image size="tiny" src={cow} />

                <Item.Content>
                  <Item.Header>ID: {id}</Item.Header>
                  <Item.Meta>Description</Item.Meta>
                  <Item.Description>
                    <p>Owner: {owner}</p>
                    <p>Hash: {String(hash).substring(0, 10)}</p>
                  </Item.Description>
                  <Item.Extra>Additional Details</Item.Extra>
                </Item.Content>
              </Item>
            ))}
          </Item.Group>
        </Grid.Column>
      </Grid.Row>
      <TransferItem accountPair={accountPair} allAnimals={allAnimals} />
    </>
  );
}
