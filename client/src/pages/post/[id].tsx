import { Box, Heading, Text } from "@chakra-ui/react";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import SpinnerCenter from "../../components/SpinnerCenter";
import {
  PostDocument,
  PostIdsDocument,
  PostIdsQuery,
  PostQuery,
  usePostQuery,
} from "../../generated/graphql";
import { addApolloState, initializeApollo } from "../../lib/apolloClient";
import { limit } from "../index";
import PageNotFound from "../pageNotFound";
import ActionButtons from "../../components/ActionButtons";

const Post = () => {
  const router = useRouter();
  const postId = router.query.id as string;

  const { data, loading, error } = usePostQuery({
    variables: { id: postId },
  });

  if (loading) return <SpinnerCenter />;

  if (error || !data?.post) return <PageNotFound />;

  return (
    <Box>
      <Heading mb={4}>{data.post.title}</Heading>
      <Text>{data.post.description}</Text>

      <ActionButtons
        postUserId={data.post.userId.toString()}
        postId={data.post.id}
      />
    </Box>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const apolloClient = initializeApollo();
  const { data } = await apolloClient.query<PostIdsQuery>({
    query: PostIdsDocument,
    variables: { limit },
  });

  return {
    paths: data.posts!.paginatedPosts.map((post) => ({
      params: { id: `${post.id}` },
    })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<
  { [key: string]: any },
  { id: string }
> = async ({ params }) => {
  const apolloClient = initializeApollo();

  await apolloClient.query<PostQuery>({
    query: PostDocument,
    variables: { id: params?.id },
  });
  return addApolloState(apolloClient, { props: {} });
};

export default Post;
