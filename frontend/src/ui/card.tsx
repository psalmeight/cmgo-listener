import { CardRootProps, Card as ChakraCard } from "@chakra-ui/react";
import { ReactNode } from "react";

export const Card = ({ children, ...cardRootProps }: { children: ReactNode } & CardRootProps) => {
  return (
    <ChakraCard.Root {...cardRootProps}>
      <ChakraCard.Body p={0}>{children}</ChakraCard.Body>
    </ChakraCard.Root>
  );
};
