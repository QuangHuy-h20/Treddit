import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import NextLink from "next/link";
import FormWrapper from "../components/FormWrapper";
import InputField from "../components/InputField";
import SpinnerCenter from "../components/SpinnerCenter";
import {
  ForgotPasswordInput,
  useForgotPasswordMutation
} from "../generated/graphql";
import { useCheckAuth } from "../utils/useCheckAuth";

const ForgotPassword = () => {
  const initialValues = { email: "" };

  const [forgotPassword, { loading, data }] = useForgotPasswordMutation();

  const { data: authData, loading: authLoading } = useCheckAuth();

  const handleForgotPasswordSubmit = async (values: ForgotPasswordInput) => {
    await forgotPassword({ variables: { forgotPasswordInput: values } });
  };
  if (authLoading || (!authLoading && authData?.me)) {
    return <SpinnerCenter />;
  } else {
    return (
      <>
        <FormWrapper size="small">
          <Formik
            initialValues={initialValues}
            onSubmit={handleForgotPasswordSubmit}
          >
            {({ isSubmitting }) =>
              !loading && data ? (
                <Box>Please check your email to verify the password</Box>
              ) : (
                <Form>
                  <InputField
                    name="email"
                    label="Email"
                    placeholder="Email"
                    type="email"
                  />
                  <Flex mt={2}>
                    <NextLink href="/login">
                      <Link ml="auto">Back to login</Link>
                    </NextLink>
                  </Flex>
                  <Button
                    type="submit"
                    colorScheme="teal"
                    mt={4}
                    isLoading={isSubmitting}
                  >
                    Submit
                  </Button>
                </Form>
              )
            }
          </Formik>
        </FormWrapper>
      </>
    );
  }
};

export default ForgotPassword;
