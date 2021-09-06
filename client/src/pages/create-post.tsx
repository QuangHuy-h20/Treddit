import { Box, Button, Flex } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import NextLink from "next/link";
import router from "next/router";
import InputField from "../components/InputField";
import SpinnerCenter from "../components/SpinnerCenter";
import { CreatePostInput, useCreatePostMutation } from "../generated/graphql";
import { useCheckAuth } from "../utils/useCheckAuth";
const CreatePost = () => {
  const { data: authData, loading: authLoading } = useCheckAuth();

  const initialValues = { title: "", description: "" };

  const [createPost, _] = useCreatePostMutation();

  const handleCreatePost = async (values: CreatePostInput) => {
    await createPost({
      variables: {
        createPostInput: values,
      },
      update(cache, { data }) {
        cache.modify({
          fields: {
            posts(existing) {
              console.log("Existing: ", existing);
              if (data?.createPost.success && data.createPost.post) {
                //Post: newId
                const newPostRef = cache.identify(data.createPost.post);
                console.log(newPostRef);

                const newPostAfterCreation = {
                  ...existing,
                  totalCount: existing.totalCount + 1,
                  paginatedPosts: [
                    { __ref: newPostRef },
                    ...existing.paginatedPosts,
                  ], // [{__ref: 'Post:1'}, {__ref: 'Post:2'}]
                };

                console.log("New post after creation: ", newPostAfterCreation);

                return newPostAfterCreation;
              }
            },
          },
        });
      },
    });
    router.push("/");
  };

  if (authLoading || (!authLoading && !authData?.me)) {
    return <SpinnerCenter />;
  } else {
    return (
      <>
        <Formik initialValues={initialValues} onSubmit={handleCreatePost}>
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
                <Button
                  type="submit"
                  colorScheme="teal"
                  isLoading={isSubmitting}
                >
                  Create Post
                </Button>
                <NextLink href="/">
                  <Button> Go back to homepage</Button>
                </NextLink>
              </Flex>
            </Form>
          )}
        </Formik>
      </>
    );
  }
};
export default CreatePost;
