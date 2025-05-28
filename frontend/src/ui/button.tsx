import { Button as ChakraButton, ButtonProps } from "@chakra-ui/react";

interface CustomButtonProps extends ButtonProps {}

export const Button = (btnProps: CustomButtonProps) => {
  return <ChakraButton {...btnProps} size="xs" />;
};
