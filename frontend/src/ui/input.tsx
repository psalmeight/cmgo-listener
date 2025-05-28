import { Input as ChakraInput, InputProps } from "@chakra-ui/react";

interface CustomInputProps extends InputProps {}

export const Input = (inputProps: CustomInputProps) => {
  return <ChakraInput {...inputProps} size="xs" />;
};
