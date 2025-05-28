import { Table, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { EventsOff, EventsOn } from "../wailsjs/runtime/runtime";

export const RawMessages = () => {
  const [messages, setMessages] = useState<string[]>([]);
  useEffect(() => {
    EventsOn("rawMessageReceived", (message: string) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    return () => {
      EventsOff("rawMessageReceived");
    };
  }, []);
  return (
    <Table.Root showColumnBorder w={300}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Raw Message</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {messages.length > 0 &&
          messages.map((message, index) => (
            <Table.Row>
              <Table.Cell>
                <Text key={index} whiteSpace="pre-wrap" fontFamily="monospace">
                  {message}
                </Text>
              </Table.Cell>
            </Table.Row>
          ))}
      </Table.Body>
    </Table.Root>
  );
};
