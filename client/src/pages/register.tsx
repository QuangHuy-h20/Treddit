import { Box, Button, useToast } from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/router";
import FormWrapper from "../components/FormWrapper";
import InputField from "../components/InputField";
import SpinnerCenter from "../components/SpinnerCenter";
import {
  MeDocument,
  MeQuery,
  RegisterInput,
  useRegisterMutation,
} from "../generated/graphql";
import { mapFieldErrors } from "../helpers/mapFieldErrors";
import { useCheckAuth } from "../utils/useCheckAuth";

const Register = () => {
  // interface UserMutationResponse {
  //   code: number;
  //   success: boolean;
  //   message: string;
  //   user: string;
  //   errors: string;
  // }

  // interface NewUserInput {
  //   username: string;
  //   email: string;
  //   password: string;
  // }
  const { data: authData, loading: authLoading } = useCheckAuth();

  const initialValues = { username: "", password: "", email: "" };

  const router = useRouter();

  // const [registerUser, { data, error }] = useMutation<
  //   { register: UserMutationResponse },
  //   { registerInput: NewUserInput }
  // >(registerMutation);

  //After use graphql-gencode
  const [registerUser, { loading: _registerUserLoading }] =
    useRegisterMutation();
  const toast = useToast();

  const handleRegisterSubmit = async (
    values: RegisterInput,
    { setErrors }: FormikHelpers<RegisterInput>
  ) => {
    const response = await registerUser({
      variables: {
        registerInput: values,
      },
      update(cache, { data }) {
        console.log("Data register: ", data);
        if (data?.register.success) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: { me: data.register.user },
          });
        }
      },
    });

    if (response.data?.register.errors) {
      setErrors(mapFieldErrors(response.data.register.errors));
    } else if (response.data?.register.user) {
      //register successfully
      toast({
        title: "Welcome!",
        description: `${response.data.register.user.username}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push("/");
    }
  };

  return (
    <>
      {authLoading || (!authLoading && authData?.me) ? (
        <SpinnerCenter />
      ) : (
        <FormWrapper size="small">
          <Formik initialValues={initialValues} onSubmit={handleRegisterSubmit}>
            {({ isSubmitting }) => (
              <Form>
                <InputField
                  name="username"
                  label="username"
                  placeholder="username"
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
                <Box mt={4}>
                  <InputField
                    name="email"
                    placeholder="email"
                    label="email"
                    type="email"
                  />
                </Box>
                <Button
                  type="submit"
                  colorScheme="teal"
                  mt={4}
                  isLoading={isSubmitting}
                >
                  Register
                </Button>
              </Form>
            )}
          </Formik>
        </FormWrapper>
      )}
    </>
  );
};

export default Register;
