import { useEffect, useState } from "react";
import { Start, ToggleManager } from "../wailsjs/go/main/App";
import { EventsOn, EventsOff } from "../wailsjs/runtime/runtime";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from "@chakra-ui/react";
import { main } from "../wailsjs/go/models";
function App() {
  const [ports, _setPorts] = useState<number[]>([1234, 3434, 8888, 4555]);
  const [listeningPorts, setListeningPorts] = useState<
    { port: number; isListening: boolean; received: main.SystemInfo[] }[]
  >([
    { port: 1234, isListening: false, received: [] },
    { port: 3434, isListening: false, received: [] },
    { port: 8888, isListening: false, received: [] },
    { port: 4555, isListening: false, received: [] }
  ]);

  const togglePortListen = async (port: number) => {
    if (listeningPorts.every(({ isListening }) => !isListening)) {
      await Start(port);
    }
    await ToggleManager(port);
    if (listeningPorts.find((p) => p.port === port)?.isListening) {
      setListeningPorts((prev) => prev.map((p) => (p.port === port ? { ...p, isListening: false } : p)));
    } else {
      setListeningPorts((prev) => prev.map((p) => (p.port === port ? { ...p, isListening: true } : p)));
    }
  };

  useEffect(() => {
    EventsOn("responseEvent", (data: main.SystemInfo) => {
      setListeningPorts((prev) =>
        prev.map((response) => {
          if (response.port === data.port) {
            return { ...response, received: [...response.received, data] };
          }
          return response;
        })
      );
    });

    return () => {
      EventsOff("responseEvent");
    };
  }, []);

  return (
    <Flex p={4} gap={4} height="100vh">
      <Box w="30%" p={4} borderWidth="1px" borderRadius="lg" boxShadow="md">
        {/* <Input placeholder="Enter port" mb={4} size="md" onChange={(e) => setPort(Number(e.target.value))} />
        <Button colorScheme="blue" width="full" onClick={() => {
          if (port) {
            startListening
        }}>
          {port ? "Stop Listening" : "Start Listening"}
        </Button> */}
      </Box>
      <Box w="70%" p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" height="fit-content">
        {listeningPorts.map((lPort) => (
          <Card key={lPort.port} mb={4}>
            <CardHeader pb={0}>
              <Text fontSize="lg" fontWeight="bold" margin={0}>
                Port: {lPort.port} {lPort.isListening ? "(Listening)" : ""}
              </Text>
              <Button size="sm" onClick={() => togglePortListen(lPort.port)}>
                {lPort.isListening ? "Stop" : "Listen"}
              </Button>
            </CardHeader>
            <CardBody>
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>MinerType</Th>
                      <Th>IPAddress</Th>
                      <Th>Mac</Th>
                      <Th>Port</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {lPort.received.length > 0
                      ? lPort.received.map((r: main.SystemInfo) => {
                          return (
                            <Tr>
                              <Td>{r.minertype}</Td>
                              <Td>{r.ipaddress}</Td>
                              <Td>{r.macaddr}</Td>
                              <Td>{r.port}</Td>
                            </Tr>
                          );
                        })
                      : null}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        ))}
      </Box>
    </Flex>
  );
}

export default App;
