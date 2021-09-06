import { Box, Button, Flex, Link, useToast } from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";
import NextLink from "next/link";
import { useRouter } from "next/router";
import FormWrapper from "../components/FormWrapper";
import InputField from "../components/InputField";
import SpinnerCenter from "../components/SpinnerCenter";
import {
  LoginInput,
  MeDocument,
  MeQuery,
  useLoginMutation
} from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErrors";
import { initializeApollo } from "../lib/apolloClient";
import { useCheckAuth } from "../utils/useCheckAuth";

const Login = () => {
  const { data: authData, loading: authLoading } = useCheckAuth();
  const initialValues = { usernameOrEmail: "", password: "" };

  const router = useRouter();

  //After use graphql-gencode
  const [loginUser, { loading: _loginUserLoading }] = useLoginMutation();

  const toast = useToast();
  const handleLoginSubmit = async (
    values: LoginInput,
    { setErrors }: FormikHelpers<LoginInput>
  ) => {
    const response = await loginUser({
      variables: {
        loginInput: values,
      },
      update(cache, { data }) {
        console.log("Data login: ", data);
        // const meData = cache.readQuery({
        //   query: MeDocument,
        // });
        // console.log("Me data: ", meData);
        if (data?.login.success) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: { me: data.login.user },
          });
        }
      },
    });

    if (response.data?.login.errors) {
      setErrors(mapFieldErrors(response.data.login.errors));
    } else if (response.data?.login.user) {
      //login successfully
      toast({
        title: "Welcome!",
        description: `${response.data.login.user.username}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      const apolloClient = initializeApollo()
      apolloClient.resetStore()
      router.push("/");
    }
  };

  return (
    <>
      {authLoading || (!authLoading && authData?.me) ? (
        <SpinnerCenter />
      ) : (
        <FormWrapper size="small">
          <Formik initialValues={initialValues} onSubmit={handleLoginSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <InputField
                  name="usernameOrEmail"
                  label="Username or Email"
                  placeholder="Username or Email"
                  type="text"
                />
                <Box mt={4}>
                  <InputField
                    name="password"
                    placeholder="password"
                    label="password"
                    type="password"
                  />
                </Box>
                <Flex mt={2}>
                  <NextLink href="/forgot-password">
                    <Link ml="auto">Forgot password?</Link>
                  </NextLink>
                </Flex>
                <Button
                  type="submit"
                  colorScheme="teal"
                  mt={4}
                  isLoading={isSubmitting}
                >
                  Login
                </Button>
              </Form>
            )}
          </Formik>
        </FormWrapper>
      )}
    </>
  );
};

export default Login;
