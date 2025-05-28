import { Card as CustomCard } from "@chakra-ui/react";
import { ReactNode } from "react";
export const Card = ({ children }: { children: ReactNode }) => {
  return (
    <CustomCard.Root>
      <CustomCard.Body>{children}</CustomCard.Body>
    </CustomCard.Root>
  );
};
