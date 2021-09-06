import { Alert, AlertIcon, AlertTitle } from "@chakra-ui/alert";
import { Button } from "@chakra-ui/button";
import { Box, Flex } from "@chakra-ui/layout";
import { useRouter } from "next/router";
import SpinnerCenter from "../../../components/SpinnerCenter";
import {
  UpdatePostInput,
  useMeQuery,
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import NextLink from "next/link";
import { Form, Formik } from "formik";
import InputField from "../../../components/InputField";
import PageNotFound from "../../pageNotFound";

const PostUpdate = () => {
  const router = useRouter();

  const postId = router.query.id as string;

  const { data: meData, loading: meLoading } = useMeQuery();

  const { data: postData, loading: postLoading } = usePostQuery({
    variables: { id: postId },
  });

  const [updatePost, _] = useUpdatePostMutation();

  const handleUpdatePost = async (values: Omit<UpdatePostInput, 'id'>) => {
    await updatePost({
      variables: {
        updatePostInput: {
          id: postId,
          ...values,
        },
      },
    });
    router.back();
  };

  if (meLoading || postLoading) return <SpinnerCenter />;

  if (!postData?.post) return <PageNotFound />;

  if (
    !meLoading &&
    !postLoading &&
    meData?.me?.id !== postData?.post?.userId.toString()
  ) {
    return (
      <Box>
        <Alert mb={4} status="error">
          <AlertIcon />
          <AlertTitle mr={2}>
            You do not have permission to access this page!
          </AlertTitle>
        </Alert>
        <NextLink href="/">
          <Button>Back to homepage</Button>
        </NextLink>
      </Box>
    );
  }

  const initialValues = {
    title: postData.post.title,
    description: postData.post.description,
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleUpdatePost}>
      {({ isSubmitting }) => (
        <Form>
          <InputField
            name="title"
            label="Title"
            placeholder="title"
            type="text"
          />
          <Box mt={4}>
            <InputField
              name="description"
              placeholder="Description"
              label="Description"
              type="textarea"
              textarea
            />
          </Box>
          <Flex justifyContent="space-between" alignItems="center" mt={4}>
            <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
              Update Post
            </Button>
            <NextLink href="/">
              <Button> Go back to homepage</Button>
            </NextLink>
          </Flex>
        </Form>
      )}
    </Formik>
  );
};

export default PostUpdate;
