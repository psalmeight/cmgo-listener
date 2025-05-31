import { EmptyState, VStack } from "@chakra-ui/react";
import { FiInbox, FiWifi } from "react-icons/fi";
import FadingText from "../fading-text";
import { Card } from "../ui";

interface EmptyTableStateProps {
  listening: boolean;
}

export const EmptyTableState = ({ listening }: EmptyTableStateProps) => {
  return listening ? (
    <Card my={4}>
      <EmptyState.Root height={400}>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FadingText>
              <FiWifi />
            </FadingText>
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>Waiting for IP Report signal</EmptyState.Title>
            <EmptyState.Description>Press the IP report button on the miner or hit Skip</EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    </Card>
  ) : (
    <Card my={4}>
      <EmptyState.Root height={400}>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <FiInbox />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>No miner data</EmptyState.Title>
            <EmptyState.Description>Click "Start Listening" and press IP Report button</EmptyState.Description>
          </VStack>
        </EmptyState.Content>
      </EmptyState.Root>
    </Card>
  );
};
