import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  EmptyState,
  Field,
  Flex,
  Heading,
  IconButton,
  Image,
  Input,
  Menu,
  Popover,
  Portal,
  SegmentGroup,
  Separator,
  Stack,
  Switch,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  ExportToCsv,
  ReadyListener,
  StartListeningToPorts,
} from "../wailsjs/go/main/App";
import { EventsOn, EventsOff } from "../wailsjs/runtime/runtime";
import { commands } from "../wailsjs/go/models";
import logo from "./assets/images/logo.svg";
import FadingText from "./FadingText";
import { FiTrash2, FiInbox, FiWifi } from "react-icons/fi";
import { v4 as uuid } from "uuid";

import { mkConfig, generateCsv, asString } from "export-to-csv";
const csvConfig = mkConfig({ useKeysAsHeaders: true });
const addNewLine = (s: string): string => s + "\n";
const buttonStyles = {
  listening: { bg: "pink", color: "white" },
  normal: { bg: "black", color: "white" },
};

const ports = [
  { port: 14235, firmware: "Antminer", disabled: true },
  { port: 8888, firmware: "Whatsminer", disabled: true },
  { port: 1314, firmware: "Goldshells", disabled: true },
  { port: 0, firmware: "Canaan", disabled: true },
  { port: 1111, firmware: "Avalon", disabled: true },
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
  hr5s: string;
  unit: string;
  fwversion: string;
}

const SiteMapper = () => {
  const [container, setContainer] = useState<string>("C1");
  const [rack, setRack] = useState<string>("R1");
  const [row, setRow] = useState<number>(0);
  const [column, setColumn] = useState<number>(0);
  const [listening, setListening] = useState<boolean>(false);
  const [response, setResponse] = useState<RowInfo[]>([]);
  const [autoIncrement, setAutoIncrement] = useState<boolean>(false);

  const processMinerInfo = useCallback(
    (minerInfo: commands.MinerInfo) => {
      setResponse((prevResponse) => {
        const { mac, ip, port, raw, minerType } = minerInfo;
        return [
          ...prevResponse,
          {
            mac,
            ip,
            container,
            rack,
            row,
            column: autoIncrement ? getLastColumn() : 0,
            port,
            raw,
            miner: minerType,
            hr5s: minerInfo.hashrate,
            unit: minerInfo.hashrateUnit,
            fwversion: minerInfo.firmwareVersion,
          } as RowInfo,
        ];
      });
    },
    [container, rack, row, column, autoIncrement]
  );

  useEffect(() => {
    ReadyListener();
    EventsOn("responseEvent", (minerInfo: commands.MinerInfo) => {
      processMinerInfo(minerInfo);
    });
    return () => {
      EventsOff("responseEvent");
    };
  }, [processMinerInfo]);

  const getLastColumn = (): number => {
    if (response.length === 0) {
      return 0;
    }
    const columns = response.map(({ column }) => column);
    const lastColumn = Math.max(...columns) || 0;
    return lastColumn + 1;
  };

  useEffect(() => {
    if (autoIncrement) {
      setColumn(getLastColumn());
    }
  }, [response]);

  const toggleListening = () => {
    setListening((prev) => !prev);
    StartListeningToPorts(ports.map(({ port }) => port));
  };

  const skip = () => {
    setResponse((prevResponse) => {
      return [
        ...prevResponse,
        {
          mac: "--",
          ip: `ip:${uuid()}`,
          container,
          rack,
          row,
          column: autoIncrement ? getLastColumn() : 0,
          port: "--",
          raw: "--",
          miner: "--",
          hr5s: "--",
          unit: "--",
          fwversion: "--",
        } as RowInfo,
      ];
    });
  };

  const exportLayout = () => {
    const csv = generateCsv(csvConfig)(
      response.map(({ mac, container, rack, row, column }) => ({
        mac,
        container: container + rack,
        row,
        column,
      }))
    );
    ExportToCsv(addNewLine(asString(csv)), "container-miners");
  };

  const exportData = () => {
    const csv = generateCsv(csvConfig)(
      response.map((res) => ({
        ...res,
        ip: res.ip.startsWith("ip:") ? "--" : res.ip,
      })) as any
    );
    ExportToCsv(addNewLine(asString(csv)), "container-data");
  };

  const onChangeField = (
    fieldName: string,
    ip: string,
    value: string | number
  ) => {
    setResponse((responses) =>
      responses.map((res) => {
        if (res.ip === ip) {
          return { ...res, [fieldName]: value };
        }
        return res;
      })
    );
  };

  return (
    <Flex p={5} direction="column" justify="space-between" height="vh">
      <Box>
        {/* Title */}
        <Heading as="h1" mb={5}>
          <Flex justify="space-between">
            <Flex spaceX={2} align="center">
              <Image src={logo} h={50} />{" "}
              <Separator orientation="vertical" height="10" />{" "}
              <Text>IP Reporter</Text>
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
            <Field.Label>Column</Field.Label>
            <Input
              placeholder="Column"
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

        <Flex mb={5} justify="flex-end" gap={4}>
          <Button
            size="sm"
            variant="subtle"
            onClick={() => {
              setResponse([]);
            }}
          >
            Clear Table
          </Button>
          <Switch.Root
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setAutoIncrement(e.target.checked);
            }}
          >
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Switch.Label>Autoincrement Column</Switch.Label>
          </Switch.Root>
        </Flex>
        {response.length === 0 && !listening ? (
          <EmptyState.Root>
            <EmptyState.Content>
              <EmptyState.Indicator>
                <FiInbox />
              </EmptyState.Indicator>
              <VStack textAlign="center">
                <EmptyState.Title>No miner data</EmptyState.Title>
                <EmptyState.Description>
                  Click "Start Listening" and press IP Report button
                </EmptyState.Description>
              </VStack>
            </EmptyState.Content>
          </EmptyState.Root>
        ) : listening && response.length === 0 ? (
          <EmptyState.Root>
            <EmptyState.Content>
              <EmptyState.Indicator>
                <FadingText>
                  <FiWifi />
                </FadingText>
              </EmptyState.Indicator>
              <VStack textAlign="center">
                <EmptyState.Title>
                  Waiting for IP Report signal
                </EmptyState.Title>
                <EmptyState.Description>
                  Press the IP report button on the miner or hit Skip
                </EmptyState.Description>
              </VStack>
            </EmptyState.Content>
          </EmptyState.Root>
        ) : (
          <Table.ScrollArea borderWidth="1px" rounded="md" height="400px">
            <Table.Root size="sm" stickyHeader striped showColumnBorder>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Miner Type</Table.ColumnHeader>
                  <Table.ColumnHeader>Mac Address</Table.ColumnHeader>
                  <Table.ColumnHeader>IP Address</Table.ColumnHeader>
                  <Table.ColumnHeader w="70px">Container</Table.ColumnHeader>
                  <Table.ColumnHeader w="70px">Rack</Table.ColumnHeader>
                  <Table.ColumnHeader w="70px">Row</Table.ColumnHeader>
                  <Table.ColumnHeader w="70px">Column</Table.ColumnHeader>
                  <Table.ColumnHeader w="100px" textAlign="end">
                    #
                  </Table.ColumnHeader>
                  {/* <Table.ColumnHeader w={30}>Raw</Table.ColumnHeader> */}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {response.map((item, idx) => (
                  <Table.Row key={item.id}>
                    <Table.Cell>
                      <Stack spaceY={0}>
                        <Text>
                          <b>Miner:</b> {item.miner}
                        </Text>
                        <Text>
                          <b>HS5S:</b> {item.hr5s} {item.unit}
                        </Text>
                        <Text>
                          <b>FW Version:</b> {item.fwversion}
                        </Text>
                      </Stack>
                    </Table.Cell>
                    <Table.Cell>{item.mac}</Table.Cell>
                    <Table.Cell>
                      {item.ip.startsWith("ip:") ? "--" : item.ip}
                    </Table.Cell>
                    <Table.Cell>
                      <Input
                        onChange={(e) => {
                          onChangeField("container", item.ip, e.target.value);
                        }}
                        value={item.container}
                        w="70px"
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Input
                        onChange={(e) => {
                          onChangeField("rack", item.ip, e.target.value);
                        }}
                        value={item.rack}
                        w="70px"
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Input
                        onChange={(e) => {
                          onChangeField("row", item.ip, e.target.value);
                        }}
                        value={item.row}
                        w="70px"
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Input
                        onChange={(e) => {
                          onChangeField("column", item.ip, e.target.value);
                        }}
                        value={item.column}
                        w="70px"
                      />
                    </Table.Cell>
                    <Table.Cell w="100px" textAlign="end">
                      <IconButton
                        size="xs"
                        variant="subtle"
                        color="red"
                        onClick={() => {
                          setResponse((prev) =>
                            prev.filter((_v, i) => i !== idx)
                          );
                        }}
                      >
                        <FiTrash2 />
                      </IconButton>
                    </Table.Cell>
                    {/* <Table.Cell w={30}>{item.raw}</Table.Cell> */}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        )}
      </Box>

      <Flex align="flex-end" spaceX={2}>
        {ports.map(({ firmware, port, disabled }, idx) => (
          <Field.Root key={idx}>
            <Field.Label>{firmware}</Field.Label>
            <Input
              placeholder={`${firmware} port`}
              value={port}
              disabled={disabled}
            />
          </Field.Root>
        ))}
        <Button
          {...(listening ? buttonStyles.listening : buttonStyles.normal)}
          onClick={toggleListening}
        >
          {listening ? "Stop Listening" : "Start Listening"}
        </Button>

        <Popover.Root>
          <Popover.Trigger>
            <Button disabled={response.length === 0}>Export</Button>
          </Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content>
                <Popover.Arrow />
                <Popover.Body>
                  <Stack>
                    <Button onClick={exportLayout}>Export Layout</Button>
                    <Button onClick={exportData}>Export Data</Button>
                  </Stack>
                </Popover.Body>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>
      </Flex>
    </Flex>
  );
};

export default SiteMapper;
