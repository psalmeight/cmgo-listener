import { useCallback, useEffect, useState } from "react";
import { LoadPorts, Start, ToggleManager, SavePorts, Replace } from "../wailsjs/go/main/App";
import { EventsOn, EventsOff } from "../wailsjs/runtime/runtime";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Input,
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
  const [portField, setPortField] = useState<number>();
  const [listeningPorts, setListeningPorts] = useState<
    { port: number; isListening: boolean; received: main.MinerInfo[] }[]
  >([]);

  useEffect(() => {
    LoadPorts().then((ports) => {
      setListeningPorts(ports.map((port) => ({ port, isListening: false, received: [] })));
    });
  }, []);

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

  const savePort = useCallback(() => {
    if (portField) {
      SavePorts(portField);
      setListeningPorts((prev) => [...prev, { port: portField, isListening: false, received: [] }]);
      setPortField(undefined);
    }
  }, [portField, SavePorts, setListeningPorts]);

  const onRemove = async (portToRemove: number) => {
    await togglePortListen(portToRemove);

    const result = listeningPorts.filter((port) => port.port !== portToRemove).map((port) => port.port);
    setListeningPorts((prev) => prev.filter((port) => port.port !== portToRemove));
    Replace(result);
  };

  useEffect(() => {
    EventsOn("responseEvent", (data: main.MinerInfo) => {
      setListeningPorts((prev) =>
        prev.map((response) => {
          if (response.port === Number(data.port)) {
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
    <Box padding={4}>
      <Heading>CompassMining Listener</Heading>
    <Flex p={4} gap={4} height="100vh">
      <Box w="30%" p={4} borderWidth="1px" borderRadius="lg" boxShadow="md">
        <Input
          placeholder="Enter port"
          mb={4}
          size="md"
          value={portField?.toString() || ""}
          onChange={(e) => setPortField(Number(e.target.value))}
        />
        <Button colorScheme="blue" width="full" onClick={savePort}>
          Add Port
        </Button>
      </Box>
      <Box w="70%" p={4} borderWidth="1px" borderRadius="lg" boxShadow="md" height="fit-content">
        {listeningPorts.map((lPort) => (
          <Card key={lPort.port} mb={4}>
            <CardHeader pb={0}>
              <Text fontSize="lg" fontWeight="bold" margin={0}>
                Port: {lPort.port} {lPort.isListening ? "(Listening)" : ""}
              </Text>
              <Button size="sm" onClick={() => togglePortListen(lPort.port)} colorScheme={lPort.isListening ? "red" : "teal"} mr={2}>
                {lPort.isListening ? "Stop" : "Listen"}
              </Button>
              <Button size="sm" onClick={() => onRemove(lPort.port)}>
                Remove
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
                      ? lPort.received.map((r: main.MinerInfo) => {
                          return (
                            <Tr>
                              <Td>{r.minerType}</Td>
                              <Td>{r.ip}</Td>
                              <Td>{r.mac}</Td>
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
    </Box>
  );
}

export default App;
