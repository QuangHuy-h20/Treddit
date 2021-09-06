import { Box, IconButton } from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import {
  PaginatedPosts,
  useDeletePostMutation,
  useMeQuery,
} from "../generated/graphql";
import { Reference } from "@apollo/client";
import { useRouter } from "next/router";

interface ActionsButtonProps {
  postId: string;
  postUserId: string;
}

const ActionButtons = ({ postId, postUserId }: ActionsButtonProps) => {

  const router = useRouter()

  const [deletePost, _] = useDeletePostMutation();
  const { data: meData } = useMeQuery();

  const handleDeletePost = async () => {
    await deletePost({
      variables: { id: postId },
      update(cache, { data }) {
        if (data?.deletePost.success) {
          cache.modify({
            fields: {
              posts(
                existing: Pick<
                  PaginatedPosts,
                  "__typename" | "cursor" | "hasMore" | "totalCount"
                > & { paginatedPosts: Reference[] }
              ) {
                const newPostsAfterDeletion = {
                  ...existing,
                  totalCount: existing.totalCount - 1,
                  paginatedPosts: existing.paginatedPosts.filter(
                    (postRefObject) => postRefObject.__ref !== `Post:${postId}`
                  ),
                };
                return newPostsAfterDeletion;
              },
            },
          });
        }
      },
    });
    if (router.route !== '/') router.push('/')
  };

  if (meData?.me?.id !== postUserId) return null;

  return (
    <Box ml="auto">
      <NextLink href={`/post/update/${postId}`}>
        <IconButton icon={<EditIcon />} aria-label="edit-icon" mr={3} />
      </NextLink>

      <IconButton
        icon={<DeleteIcon />}
        aria-label="delete-icon"
        colorScheme="red"
        onClick={() => handleDeletePost()}
      />
    </Box>
  );
};

export default ActionButtons;
