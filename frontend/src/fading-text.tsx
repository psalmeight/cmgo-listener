import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ReactNode } from "react";

const MotionBox = motion(Box);

const FadingText = ({ children }: { children?: ReactNode }) => {
  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{
        duration: 1.5, // Total cycle time
        repeat: Infinity // Keeps fading indefinitely
      }}
      textAlign="center"
      color="green"
    >
      {children || "Listening"}
    </MotionBox>
  );
};

export default FadingText;
