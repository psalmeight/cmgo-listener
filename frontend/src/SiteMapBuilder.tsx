import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Image,
  Input,
  NumberInput,
  Separator,
  Switch,
  Table,
  Text
} from "@chakra-ui/react";
import { ExportToCsv, InitializePorts, StartListeningPorts } from "../wailsjs/go/main/App";
import { EventsOn, EventsOff } from "../wailsjs/runtime/runtime";
import { miners } from "../wailsjs/go/models";
import logo from "./assets/images/logo.svg";
import FadingText from "./FadingText";
import { mkConfig, generateCsv, asString } from "export-to-csv";
const csvConfig = mkConfig({ useKeysAsHeaders: true });
const addNewLine = (s: string): string => s + "\n";
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
  miner: string;
}

const SiteMapper = () => {
  const [container, setContainer] = useState<string>("C1");
  const [rack, setRack] = useState<string>("R1");
  const [row, setRow] = useState<number>(0);
  const [column, setColumn] = useState<number>(0);
  const [receivedResponses, setReceivedResponses] = useState<miners.MinerInfo[]>([]);
  const [listening, setListening] = useState<boolean>(false);
  const [response, setResponse] = useState<RowInfo[]>([]);
  const [autoIncrement, setAutoIncrement] = useState<boolean>(false);

  useEffect(() => {
    InitializePorts(ports.map(({ port }) => port));
  }, [ports]);

  useEffect(() => {
    EventsOn("responseEvent", (minerInfo: miners.MinerInfo) => {
      processMinerInfo(minerInfo);
    });

    return () => {
      EventsOff("responseEvent");
    };
  }, []);

  const processMinerInfo = (minerInfo: miners.MinerInfo) => {
    setResponse((prevResponse) => {
      const { mac, ip, port, raw, minerType } = minerInfo;
      // const columns = prevResponse.map(({ column }) => column);
      // const lastColumn = Math.max(...columns) || 0;
      return [
        ...prevResponse,
        {
          mac,
          ip,
          container,
          rack,
          row,
          column,
          port,
          raw,
          miner: minerType
        } as RowInfo
      ];
    });
  };

  useEffect(() => {
    if (autoIncrement) {
      const lastColumn = response.map(({ column }) => column).sort((a, b) => b - a)[0] || 0;
      setColumn(lastColumn + 1);
    }
  }, [response]);

  const toggleListening = () => {
    setListening((prev) => !prev);
    StartListeningPorts(ports.map(({ port }) => port));
  };

  const skip = () => {
    setResponse((prevResponse) => {
      //const lastColumn = prevResponse.map(({ column }) => column).sort((a, b) => b - a)[0] || 0;
      return [
        ...prevResponse,
        {
          mac: "--",
          ip: "--",
          container,
          rack,
          row,
          column,
          port: "--",
          raw: "--",
          miner: "--"
        } as RowInfo
      ];
    });
  };

  const exportToCsv = () => {
    const csv = generateCsv(csvConfig)(response as any);
    ExportToCsv(addNewLine(asString(csv)))
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

        <Flex spaceX={2} mb={5} align="flex-end">
          {/* Inputs */}
          <Field.Root>
            <Field.Label>Container Name</Field.Label>
            <Input
              placeholder="Container name"
              value={container}
              onChange={(e) => {
                setContainer(e.target.value);
              }}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>Rack</Field.Label>
            <Input
              placeholder="Rack (ex. R1)"
              value={rack}
              onChange={(e) => {
                setRack(e.target.value);
              }}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>Row</Field.Label>
            <Input
              placeholder="Row"
              value={row}
              onChange={(e) => {
                setRow(parseInt(e.target.value));
              }}
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>Rack Index</Field.Label>
            <Input
              placeholder="Rack index"
              value={column}
              disabled={autoIncrement}
              onChange={(e) => {
                setColumn(parseInt(e.target.value));
              }}
            />
          </Field.Root>

          <Button colorScheme="blue" onClick={skip}>
            Skip
          </Button>
        </Flex>

        {/* <Flex mb={5} justify="flex-end">
          <Switch.Root
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setAutoIncrement(e.target.checked);
            }}
          >
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Switch.Label>Autoincrement Index</Switch.Label>
          </Switch.Root>
        </Flex> */}

        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Miner Type</Table.ColumnHeader>
              <Table.ColumnHeader>Mac Address</Table.ColumnHeader>
              <Table.ColumnHeader>IP Address</Table.ColumnHeader>
              <Table.ColumnHeader>Container</Table.ColumnHeader>
              <Table.ColumnHeader>Rack</Table.ColumnHeader>
              <Table.ColumnHeader>Row</Table.ColumnHeader>
              <Table.ColumnHeader>Column</Table.ColumnHeader>
              <Table.ColumnHeader>Action</Table.ColumnHeader>
              {/* <Table.ColumnHeader w={30}>Raw</Table.ColumnHeader> */}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {response.map((item, idx) => (
              <Table.Row key={item.id}>
                <Table.Cell>{item.miner}</Table.Cell>
                <Table.Cell>{item.mac}</Table.Cell>
                <Table.Cell>{item.ip}</Table.Cell>
                <Table.Cell>{item.container}</Table.Cell>
                <Table.Cell>{item.rack}</Table.Cell>
                <Table.Cell>{item.row}</Table.Cell>
                <Table.Cell>{item.column}</Table.Cell>
                <Table.Cell>
                  <Button
                    size="xs"
                    onClick={() => {
                      setResponse((prev) => prev.filter((_v, i) => i !== idx));
                    }}
                  >
                    Remove
                  </Button>
                </Table.Cell>
                {/* <Table.Cell w={30}>{item.raw}</Table.Cell> */}
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
        <Button onClick={exportToCsv}>Export to CSV</Button>
      </Flex>
    </Flex>
  );
};

export default SiteMapper;
