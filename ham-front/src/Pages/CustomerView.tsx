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

//@ts-ignore
import ham from "../../public/assets/meat.png";

/*
 <ul>
        <li>Lista njegovih Ham </li>
      </ul>

*/

export default function CustomerView(props: any) {
  const { api } = useSubstrate();
  const [allHams, setHams] = useState<any>([]);

  const { accountPair } = props;
  const account = useAccount(accountPair, api);

  const subscribeHam = () => {
    let unsub = null;

    const asyncFetch = async () => {
      const rawData = await api.query.hamModule.hams.entries();
      const hamList = rawData.map(([hash, option]) => {
        const { id, owner } = option.toHuman();
        return { hash, id, owner };
      });

      setHams(hamList);
    };

    asyncFetch();

    return () => {
      unsub?.();
    };
  };

  useEffect(subscribeHam, [api]);

  const buyHam = (hamId) => {
    api.tx["hamModule"]
      .buyHam(hamId, 100)
      .signAndSend(account, (result: ISubmittableResult) => {
        alert(txResHandler(result));
      })
      .catch((err) => console.error(err));
  };

  return (
    <Grid.Column divided="true" style={{ marginTop: 50 }}>
      <Grid.Row>
        <h3>Ham Shop</h3>
        <Card.Group itemsPerRow={3}>
          {allHams?.map(({ id, owner }) => (
            <Card key={id}>
              <Image src={ham} wrapped ui={false} />
              <Card.Content>
                <Card.Header>Ham</Card.Header>
                <Card.Meta>{id}</Card.Meta>
                <Card.Description>
                  {`Owner: ${owner.substring(0, 20)}`}
                </Card.Description>
              </Card.Content>
              <Card.Content extra onClick={() => buyHam(id)}>
                <Icon name="user" />
                Buy now
              </Card.Content>{" "}
            </Card>
          ))}
        </Card.Group>
      </Grid.Row>
      <hr />
      <Grid.Row>Ham Lista (Owned)</Grid.Row>
      {allHams
        ?.filter((a) => a.owner === accountPair.address)
        .map(({ id, owner }) => (
          <Card key={id}>
            <Image src={ham} wrapped ui={false} />
            <Card.Content>
              <Card.Header>Ham</Card.Header>
              <Card.Meta>{id}</Card.Meta>
              <Card.Description>
                {`Owner: ${owner.substring(0, 20)}`}
              </Card.Description>
            </Card.Content>
          </Card>
        ))}
    </Grid.Column>
  );
}
