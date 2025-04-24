import React from "react";
import { createRoot } from "react-dom/client";
import SiteMapBuilder from "./SiteMapBuilder";

import { ChakraProvider, createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {}
    }
  }
});

const system = createSystem(defaultConfig, config);

const container = document.getElementById("root");

const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ChakraProvider value={system}>
      <SiteMapBuilder />
    </ChakraProvider>
  </React.StrictMode>
);
