import React, { FC } from "react";
import { Button, Grid, Input } from "semantic-ui-react";

export const TransferItem: FC<any> = () => {
  const tranfer = () => {};

  return (
    <Grid.Row divided={true} style={css.input}>
      <Grid.Column>
        <h4>Select Animal: </h4>
        <Input
          placeholder="Animal"
          icon="tags"
          iconPosition="left"
          label={{ tag: true, content: "Add Type" }}
          labelPosition="right"
        />
      </Grid.Column>
      <Grid.Column>To:</Grid.Column>
      <Grid.Column>
        {" "}
        <Button type="submit" size="big" onClick={tranfer}>
          Transfer
        </Button>
      </Grid.Column>
    </Grid.Row>
  );
};

const css = {
  input: { border: "1px solid black", padding: 50, marginTop: 50 },
};
