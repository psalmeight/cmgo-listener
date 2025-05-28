import { IconButton, Stack, Table, Text } from "@chakra-ui/react";
import { FiTrash2 } from "react-icons/fi";
import { EmptyTableState } from "./empty-table-state";
import { Input, Card } from "../ui";

export interface RowInfo {
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

interface TableMappingsProps {
  listening?: boolean;
  tableData: RowInfo[];
  setTableData: React.Dispatch<React.SetStateAction<RowInfo[]>>;
}

export const TableMappings = ({ tableData, setTableData, listening }: TableMappingsProps) => {
  const onChangeField = (fieldName: string, ip: string, value: string | number) => {
    setTableData((prevData: RowInfo[]) =>
      prevData.map((res: RowInfo) => {
        if (res.ip === ip) {
          return { ...res, [fieldName]: value };
        }
        return res;
      })
    );
  };

  if (tableData.length === 0 && !listening) return <EmptyTableState listening={false} />;

  if (listening && tableData.length === 0) return <EmptyTableState listening={true} />;

  return (
    <Card my={4}>
      <Table.ScrollArea borderWidth="1px" rounded="md" height={400}>
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
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {tableData.map((item, idx) => (
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
                <Table.Cell>{item.ip.startsWith("ip:") ? "--" : item.ip}</Table.Cell>
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
                      setTableData((prev) => prev.filter((_v, i) => i !== idx));
                    }}
                  >
                    <FiTrash2 />
                  </IconButton>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Card>
  );
};
