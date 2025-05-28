import { Button, Field, Input } from "@chakra-ui/react";
import { Fragment } from "react/jsx-runtime";

interface RackConfigFieldProps {
  container: string;
  setContainer: (value: string) => void;
  rack: string;
  setRack: (value: string) => void;
  row: number;
  setRow: (value: number) => void;
  column: number;
  setColumn: (value: number) => void;
  autoIncrement: boolean;
  skip: () => void;
}

export const RackConfigFields = (rp: RackConfigFieldProps) => {
  return (
    <Fragment>
      <Field.Root>
        <Field.Label>Container Name</Field.Label>
        <Input
          placeholder="Container name"
          value={rp.container}
          onChange={(e) => {
            rp.setContainer(e.target.value);
          }}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>Rack</Field.Label>
        <Input
          placeholder="Rack (ex. R1)"
          value={rp.rack}
          onChange={(e) => {
            rp.setRack(e.target.value);
          }}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>Row</Field.Label>
        <Input
          placeholder="Row"
          value={rp.row}
          onChange={(e) => {
            rp.setRow(parseInt(e.target.value));
          }}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>Column</Field.Label>
        <Input
          placeholder="Column"
          value={rp.column}
          disabled={rp.autoIncrement}
          onChange={(e) => {
            rp.setColumn(parseInt(e.target.value));
          }}
        />
      </Field.Root>

      <Button colorScheme="blue" onClick={rp.skip}>
        Skip
      </Button>
    </Fragment>
  );
};
