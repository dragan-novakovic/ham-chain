import { Grid } from "semantic-ui-react";
import { CreateAnimal } from "../HamOps/CreateAnimal";

export default function FarmView({ accountPair }: any) {
  return (
    <Grid.Row>
      <CreateAnimal accountPair={accountPair} />
      <ul>
        <li>Account Farmer login obican + wallet</li>
        <li>Farma kerira Animal () </li>
        <li>Lista njegovih Animal </li>
      </ul>
    </Grid.Row>
  );
}
