import { useCallback, useEffect, useState } from "react";
import { Box, Button, Field, Flex, Input, Popover, Portal, Stack, Switch } from "@chakra-ui/react";
import { ExportToCsv, ReadyListener, StartListeningToPorts } from "../wailsjs/go/main/App";
import { EventsOn, EventsOff } from "../wailsjs/runtime/runtime";
import { commands } from "../wailsjs/go/models";
import { v4 as uuid } from "uuid";

import { mkConfig, generateCsv, asString } from "export-to-csv";
import { RowInfo, TableMappings } from "./site-mapper/table-mappings";
import { RackConfigFields } from "./site-mapper/rack-config-fields";
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
  { port: 1111, firmware: "Avalon", disabled: true }
];

const SiteMapper = () => {
  const [container, setContainer] = useState<string>("C1");
  const [rack, setRack] = useState<string>("R1");
  const [row, setRow] = useState<number>(0);
  const [column, setColumn] = useState<number>(0);
  const [listening, setListening] = useState<boolean>(false);
  const [tableData, setTableData] = useState<RowInfo[]>([]);
  const [autoIncrement, setAutoIncrement] = useState<boolean>(false);

  const processMinerInfo = useCallback(
    (minerInfo: commands.MinerInfo) => {
      setTableData((prevResponse) => {
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
            fwversion: minerInfo.firmwareVersion
          } as RowInfo
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

  useEffect(() => {
    if (autoIncrement) {
      setColumn(getLastColumn());
    }
  }, [tableData]);

  const getLastColumn = (): number => {
    if (tableData.length === 0) {
      return 0;
    }
    const columns = tableData.map(({ column }) => column);
    const lastColumn = Math.max(...columns) || 0;
    return lastColumn + 1;
  };

  const toggleListening = () => {
    setListening((prev) => !prev);
    StartListeningToPorts(ports.map(({ port }) => port));
  };

  const skip = () => {
    setTableData((prevResponse) => {
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
          fwversion: "--"
        } as RowInfo
      ];
    });
  };

  const exportLayout = () => {
    const csv = generateCsv(csvConfig)(
      tableData.map(({ mac, container, rack, row, column }) => ({
        mac,
        container: container + rack,
        row,
        column
      }))
    );
    ExportToCsv(addNewLine(asString(csv)), "container-miners");
  };

  const exportData = () => {
    const csv = generateCsv(csvConfig)(
      tableData.map((res) => ({
        ...res,
        ip: res.ip.startsWith("ip:") ? "--" : res.ip
      })) as any
    );
    ExportToCsv(addNewLine(asString(csv)), "container-data");
  };

  return (
    <Flex p={5} direction="column">
      <Box m={5}>
        <Flex spaceX={2} mb={5} align="flex-end">
          <RackConfigFields
            container={container}
            setContainer={setContainer}
            rack={rack}
            setRack={setRack}
            row={row}
            setRow={setRow}
            column={column}
            setColumn={setColumn}
            autoIncrement={autoIncrement}
            skip={skip}
          />
        </Flex>
        <Flex mb={5} justify="flex-end" gap={4}>
          <Button
            size="sm"
            variant="subtle"
            onClick={() => {
              setTableData([]);
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
        <TableMappings tableData={tableData} setTableData={setTableData} listening={listening} />
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

        <Popover.Root>
          <Popover.Trigger>
            <Button disabled={tableData.length === 0}>Export</Button>
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
