import { Field, Flex } from "@chakra-ui/react";
import { Input, Button } from "../ui";

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
  setAutoIncrement: (value: boolean) => void;
  skip: () => void;
  clearTable: () => void;
}

export const RackConfigFields = (rp: RackConfigFieldProps) => {
  return (
    <Flex spaceX={2} align="flex-end">
      <Field.Root>
        <Field.Label>Container</Field.Label>
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

      <Button colorScheme="blue" onClick={rp.skip} w={20}>
        Skip
      </Button>

      <Button size="sm" variant="subtle" onClick={rp.clearTable} w={20}>
        Clear
      </Button>
      <Button
        size="sm"
        bgColor={rp.autoIncrement ? "red.300" : "defult"}
        color={rp.autoIncrement ? "white" : "black"}
        variant="subtle"
        onClick={() => rp.setAutoIncrement(!rp.autoIncrement)}
        w={20}
      >
        {rp.autoIncrement ? "Disable" : "Increment"}
      </Button>
    </Flex>
  );
};
