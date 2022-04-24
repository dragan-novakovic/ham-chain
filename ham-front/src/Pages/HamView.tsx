import { useEffect, useState } from "react";
import {
  Card,
  Grid,
  GridColumn,
  GridRow,
  Icon,
  Item,
  Image,
} from "semantic-ui-react";

//@ts-ignore
import { CreateHam } from "../HamOps/CreateHam.tsx";
//@ts-ignore
import { useSubstrate } from "../substrate-lib/SubstrateContext.tsx";
//@ts-ignore
import { isOptional, txErrHandler, txResHandler } from "../utils/index.ts";
import { ISubmittableResult } from "@polkadot/types/types";
//@ts-ignore
import { useAccount } from "../utils/useAccount.ts";

/*
 <ul>
        <li>Lista njegovih Ham </li>
      </ul>

*/

export default function HamView(props: any) {
  const { api } = useSubstrate();
  const [allAnimals, setAnimals] = useState<any>([]);

  const { accountPair } = props;
  const account = useAccount(accountPair, api);

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

  const buyAnimal = (animalId) => {
    api.tx["hamModule"]
      .buyAnimal(animalId, 100)
      .signAndSend(account, (result: ISubmittableResult) => {
        alert(txResHandler(result));
      })
      .catch((err) => console.error(err));
  };

  return (
    <Grid.Column divided="true" style={{ marginTop: 50 }}>
      <Grid.Row>
        <h3>Animal Shop</h3>
        <Card.Group itemsPerRow={4}>
          {allAnimals?.map(({ id, owner }) => (
            <Card key={id}>
              <Image src="https://i.pravatar.cc/300" wrapped ui={false} />
              <Card.Content>
                <Card.Header>Animal</Card.Header>
                <Card.Meta>{id}</Card.Meta>
                <Card.Description>
                  {`Owner: ${owner.substring(0, 20)}`}
                </Card.Description>
              </Card.Content>
              <Card.Content extra onClick={() => buyAnimal(id)}>
                <Icon name="user" />
                Buy now
              </Card.Content>{" "}
            </Card>
          ))}
        </Card.Group>
      </Grid.Row>
      <GridRow style={{ marginTop: 16 }}>
        <CreateHam accountPair={props.accountPair} />
      </GridRow>
      <Grid.Row>Ham Lista (Owned)</Grid.Row>
    </Grid.Column>
  );
}
