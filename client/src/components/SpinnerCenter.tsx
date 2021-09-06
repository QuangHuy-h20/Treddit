import { Flex, Spinner } from "@chakra-ui/react";

const SpinnerCenter = () => {
  return (
    <Flex justifyContent="center" minH="100vh" alignItems="center">
      <Spinner />
    </Flex>
  );
};

export default SpinnerCenter;
