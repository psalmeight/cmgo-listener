import { Box, Flex, Grid, GridItem, Heading, Image, Separator, Stack, Text } from "@chakra-ui/react";
import SiteMapper from "./site-mapper";
import { RawMessages } from "./raw-messages";
import logo from "./assets/images/logo.svg";
import { Card } from "./ui";

const SiteMapBuilder = () => {
  return (
    <Box>
      <Heading as="h1" p={5}>
        <Flex justify="space-between">
          <Flex spaceX={2} align="center">
            <Image src={logo} h={50} /> <Separator orientation="vertical" height="10" /> <Text>IP Reporter</Text>
          </Flex>
        </Flex>
      </Heading>

      <Grid templateColumns="repeat(3, 1fr)" gap="6" mx={5}>
        <GridItem colSpan={2}>
          <Card>
            <SiteMapper />
          </Card>
        </GridItem>
        <GridItem colSpan={1}>
          <Card>
            <RawMessages />
          </Card>
        </GridItem>
      </Grid>

    </Box>
  );
};

export default SiteMapBuilder;
