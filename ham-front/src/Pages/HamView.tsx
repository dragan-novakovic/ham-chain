import { Card, Grid, GridColumn, GridRow, Item } from "semantic-ui-react";

//@ts-ignore
import { CreateHam } from "../HamOps/CreateHam.tsx";

/*
 <ul>
        <li>kerira Ham () </li>
        <li>Lista njegovih Ham </li>
      </ul>

*/

export default function HamView(props: any) {
  return (
    <Grid.Row divided style={{ marginTop: 50 }}>
      <Grid.Row>
        <h3>Animal Shop</h3>
        <Card.Group itemsPerRow={4}>
          {[2, 3, 4, 5, 6, 7, 8].map((id) => (
            <Card
              key={id}
              image="https://i.pravatar.cc/300"
              header="Elliot Baker"
              meta="Friend"
              description="Elliot is a sound engineer living in Nashville who enjoys playing guitar and hanging with his cat."
              extra={"BUY NOW"}
            />
          ))}
        </Card.Group>
      </Grid.Row>
      <GridRow>
        <CreateHam />
      </GridRow>
    </Grid.Row>
  );
}
