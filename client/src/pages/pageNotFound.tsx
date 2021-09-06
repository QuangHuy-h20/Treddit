import { Button, Flex, Text } from "@chakra-ui/react";
import NextLink from "next/link";
const PageNotFound = () => {
  return (
    <Flex m={0} justifyContent="center" minH="100vh" alignItems="center" flexDirection='column'>
      <Text fontSize="6xl" mb={8}> 404 Page not found</Text>
      <NextLink href="/">
        <Button>Back to Homepage</Button>
      </NextLink>
    </Flex>
  );
};

export default PageNotFound;
