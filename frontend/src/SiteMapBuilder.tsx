import { useEffect, useState } from "react";
import { Box, Button, Field, Flex, Heading, Image, Input, Separator, Table, Text } from "@chakra-ui/react";
import { InitializePorts, StartListeningPorts } from "../wailsjs/go/main/App";
import { EventsOn, EventsOff } from "../wailsjs/runtime/runtime";
import { miners } from "../wailsjs/go/models";
import logo from "./assets/images/logo.svg";
import FadingText from "./FadingText";

const buttonStyles = {
  listening: { bg: "pink", color: "white" },
  normal: { bg: "black", color: "white" }
};

const ports = [
  { port: 14235, firmware: "Antminer", disabled: true },
  { port: 8888, firmware: "Whatsminer", disabled: true },
  { port: 1314, firmware: "Goldshells", disabled: true },
  { port: 0, firmware: "Canaan", disabled: true },
  { port: 0, firmware: "Avalon", disabled: true }
];

interface RowInfo {
  id: number;
  mac: string;
  port: string;
  ip: string;
  container: string;
  rack: string;
  row: number;
  column: number;
  raw: string;
}

const SiteMapper = () => {
  const [container, setContainer] = useState<string>("C1");
  const [rack, setRack] = useState<string>("R1");
  const [column, setColumn] = useState<number>(0);
  const [items, setItems] = useState<RowInfo[]>([]);
  const [listening, setListening] = useState<boolean>(false);
  const [response, setResponse] = useState<RowInfo[]>([]);

  useEffect(() => {
    InitializePorts(ports.map(({ port }) => port));
  }, [ports]);

  useEffect(() => {
    EventsOn("responseEvent", (data: miners.MinerInfo) => {
      setResponse((prevResponse) => {
        const lastColumn = prevResponse.map(({ column }) => column).sort((a, b) => b - a)[0] || 0;
        return [
          ...prevResponse,
          { mac: data.mac, ip: data.ip, container, rack, row: 0, column: lastColumn + 1, port: data.port, raw: data.raw } as RowInfo
        ];
      });
    });

    return () => {
      EventsOff("responseEvent");
    };
  }, []);

  useEffect(() => {
    const lastColumn = response.map(({ column }) => column).sort((a, b) => b - a)[0] || 0;
    setColumn(lastColumn + 1);
  }, [response]);

  const toggleListening = () => {
    setListening((prev) => !prev);
    StartListeningPorts(ports.map(({ port }) => port));
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
            <Input placeholder="Container name" value={container} />
          </Field.Root>

          <Field.Root>
            <Field.Label>Rack</Field.Label>
            <Input placeholder="Rack (ex. R1)" value={rack} />
          </Field.Root>

          <Field.Root>
            <Field.Label>Rack Index (Autoincrements)</Field.Label>
            <Input placeholder="Rack index" value={column} />
          </Field.Root>

          <Button colorScheme="blue">Skip</Button>
        </Flex>

        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Mac Address</Table.ColumnHeader>
              <Table.ColumnHeader>IP Address</Table.ColumnHeader>
              <Table.ColumnHeader>Container</Table.ColumnHeader>
              <Table.ColumnHeader>Rack</Table.ColumnHeader>
              <Table.ColumnHeader>Row</Table.ColumnHeader>
              <Table.ColumnHeader>Column</Table.ColumnHeader>
              <Table.ColumnHeader w={30}>Raw</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {response.map((item) => (
              <Table.Row key={item.id}>
                <Table.Cell>{item.mac}</Table.Cell>
                <Table.Cell>{item.ip}</Table.Cell>
                <Table.Cell>{item.container}</Table.Cell>
                <Table.Cell>{item.rack}</Table.Cell>
                <Table.Cell>{item.row}</Table.Cell>
                <Table.Cell>{item.column}</Table.Cell>
                <Table.Cell w={30}>{item.raw}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      <Flex align="flex-end" spaceX={2}>
        {ports.map(({ firmware, port, disabled }, idx) => (
          <Field.Root key={idx}>
            <Field.Label>{firmware}</Field.Label>
            <Input placeholder={`${firmware} port`} value={port} disabled={disabled} />
          </Field.Root>
        ))}
        <Button {...(listening ? buttonStyles.listening : buttonStyles.normal)} onClick={toggleListening}>
          {listening ? "Stop Listening" : "Start Listening"}
        </Button>
      </Flex>
    </Flex>
  );
};

export default SiteMapper;
