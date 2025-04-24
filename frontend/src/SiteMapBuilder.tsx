import { useState } from "react";
import { Box, Button, Field, Flex, Heading, Image, Input, Separator, Table, Text } from "@chakra-ui/react";
import logo from "./assets/images/logo.svg";
import FadingText from "./FadingText";

const items: RowInfo[] = [
  { id: 1, mac: "27:BB:A0:80:8E:0B", ip: "192.168.0.1", container: "C1", row: 0, column: 0 },
  { id: 2, mac: "F5:7B:72:CA:2F:88", ip: "192.168.0.2", container: "C1", row: 0, column: 1 },
  { id: 3, mac: "90:AE:3F:8F:8D:CE", ip: "192.168.0.3", container: "C1", row: 0, column: 2 },
  { id: 4, mac: "FC:09:30:95:BF:AF", ip: "192.168.0.4", container: "C1", row: 0, column: 3 }
];

const buttonStyles = {
  listening: {
    bg: "pink",
    color: "white"
  },
  normal: {
    bg: "black",
    color: "white"
  }
};

interface RowInfo {
  id: number;
  mac: string;
  ip: string;
  container: string;
  row: number;
  column: number;
}

const SiteMapper = () => {
  const [container, setContainer] = useState<string>("C1");
  const [rack, setRack] = useState<string>("R1");
  const [column, setColumn] = useState<number>(0);
  const [items, setItems] = useState<RowInfo[]>([]);
  const [listening, setListening] = useState<boolean>(false);

  const toggleListening = () => {
    setListening((prev) => !prev);
  };

  return (
    <Flex p={5} direction="column" justify="space-between" height="vh">
      <Box>
        {/* Title */}
        <Heading as="h1" mb={5}>
          <Flex justify="space-between">
            <Flex spaceX={2} align="center">
              <Image src={logo} h={50} /> <Separator orientation="vertical" height="10" /> <Text>SiteMap Builder</Text>
            </Flex>
            {listening && <FadingText />}
          </Flex>
        </Heading>

        <Flex spaceX={2} mb={10} align="flex-end">
          {/* Inputs */}
          <Field.Root>
            <Field.Label>Container Name</Field.Label>
            <Input placeholder="Container name" defaultValue={container} />
          </Field.Root>

          <Field.Root>
            <Field.Label>Rack</Field.Label>
            <Input placeholder="Rack (ex. R1)" defaultValue={rack} />
          </Field.Root>

          <Field.Root>
            <Field.Label>Rack Index (Autoincrements)</Field.Label>
            <Input placeholder="Rack index" defaultValue={column} />
          </Field.Root>

          <Button colorScheme="blue">Skip</Button>
        </Flex>

        {/* Table */}
        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Mac Address</Table.ColumnHeader>
              <Table.ColumnHeader>IP Address</Table.ColumnHeader>
              <Table.ColumnHeader>Container</Table.ColumnHeader>
              <Table.ColumnHeader>Row</Table.ColumnHeader>
              <Table.ColumnHeader>Column</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items.map((item) => (
              <Table.Row key={item.id}>
                <Table.Cell>{item.mac}</Table.Cell>
                <Table.Cell>{item.ip}</Table.Cell>
                <Table.Cell>{item.container}</Table.Cell>
                <Table.Cell>{item.row}</Table.Cell>
                <Table.Cell>{item.column}</Table.Cell>
                <Table.Cell textAlign="end">
                  <Button size="xs">Action</Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      <Flex align="flex-end" spaceX={2}>
        <Field.Root>
          <Field.Label>Antminer</Field.Label>
          <Input placeholder="Antminer Port" value={14235} disabled />
        </Field.Root>

        <Field.Root>
          <Field.Label>Whatsminer</Field.Label>
          <Input placeholder="Whatsminer Port" value={8888} disabled />
        </Field.Root>

        <Field.Root>
          <Field.Label>Goldshells</Field.Label>
          <Input placeholder="Goldshells Port" value={1314} disabled />
        </Field.Root>

        <Field.Root>
          <Field.Label>Canaan</Field.Label>
          <Input placeholder="Canaan Port" disabled />
        </Field.Root>

        <Field.Root>
          <Field.Label>Avalon</Field.Label>
          <Input placeholder="Avalon Port" disabled />
        </Field.Root>
        <Button {...(listening ? buttonStyles.listening : buttonStyles.normal)} onClick={toggleListening}>
          {listening ? "Stop Listening" : "Start Listening"}
        </Button>
      </Flex>
      {/* Button */}
    </Flex>
  );
};

export default SiteMapper;
