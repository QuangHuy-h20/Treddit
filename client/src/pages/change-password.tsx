import {
  Alert,
  AlertIcon,
  AlertTitle, Box,
  Button,
  Flex,
  Link
} from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";
import NextLink from "next/link";
import router, { useRouter } from "next/router";
import { useState } from "react";
import FormWrapper from "../components/FormWrapper";
import InputField from "../components/InputField";
import SpinnerCenter from "../components/SpinnerCenter";
import {
  ChangePasswordInput,
  MeDocument,
  MeQuery,
  useChangePasswordMutation
} from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErrors";
import { useCheckAuth } from "../utils/useCheckAuth";

const ChangePassword = () => {
  const { query } = useRouter();

  const initialValues = { newPassword: "" };
  const { data: authData, loading: authLoading } = useCheckAuth();

  const [tokenError, setTokenError] = useState("");

  const [changePassword] = useChangePasswordMutation();

  const handleChangePasswordSubmit = async (
    values: ChangePasswordInput,
    { setErrors }: FormikHelpers<ChangePasswordInput>
  ) => {
    if (query.userId && query.token) {
      const response = await changePassword({
        variables: {
          userId: query.userId as string,
          token: query.userId as string,
          changePasswordInput: values,
        },
        update(cache, { data }) {
          if (data?.changePassword.success) {
            cache.writeQuery<MeQuery>({
              query: MeDocument,
              data: { me: data.changePassword.user },
            });
          }
        }
      });

      if (response.data?.changePassword.errors) {
        const fieldErrors = mapFieldErrors(
          response.data?.changePassword.errors
        );
        if ("token" in fieldErrors) {
          setTokenError(fieldErrors.token);
        }
        setErrors(fieldErrors);
      } else if (response.data?.changePassword.user){
        router.push('/')
      }
    }
  };
  if (authLoading || (!authLoading && authData?.me)) {
    return (
     <SpinnerCenter />
    );
  } else if (!query.token || !query.userId) {
    return (
      <FormWrapper size='small'>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Invalid password change request</AlertTitle>
        </Alert>
        <Flex mt={2}>
          <NextLink href="/login">
            <Link ml="auto">Back to login</Link>
          </NextLink>
        </Flex>
      </FormWrapper>
    );
  } else {
    return (
      <FormWrapper size='small'>
        <Formik
          initialValues={initialValues}
          onSubmit={handleChangePasswordSubmit}
        >
          <Form>
            <InputField
              name="newPassword"
              label="New password"
              placeholder="New password"
              type="password"
            />
            {tokenError && (
              <Flex>
                <Box color="red" mr={2}>
                  {tokenError}
                </Box>
                <NextLink href="/forgot-password">
                  <Link>Go back to forgot password</Link>
                </NextLink>
              </Flex>
            )}
            <Button type="submit" colorScheme="teal" mt={4}>
              Submit
            </Button>
          </Form>
        </Formik>
      </FormWrapper>
    );
  }
};

export default ChangePassword;
