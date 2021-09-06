import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex } from "@chakra-ui/layout";
import { IconButton, Text } from "@chakra-ui/react";
import {
  PostWithUserInfoFragment,
  useVoteMutation,
  VoteType,
} from "../generated/graphql";

interface UpvoteSectionProps {
  post: PostWithUserInfoFragment;
}
enum VoteTypeValue {
  Upvote = 1,
  Downvote = -1,
}
const UpvoteSection = ({ post }: UpvoteSectionProps) => {
  const [vote] = useVoteMutation();
  const upvote = async (postId: string) => {
    await vote({
      variables: { inputVoteValue: VoteType.Upvote, postId: parseInt(postId) },
    });

    // if (!response.data?.vote.success) return router.push("/login");
  };

  const downvote = async (postId: string) => {
    await vote({
      variables: {
        inputVoteValue: VoteType.Downvote,
        postId: parseInt(postId),
      },
    });
  };

  return (
    <Flex
      flexDirection="column"
      mr={4}
      alignItems="center"
      justifyContent="center"
    >
      <IconButton
        size="sm"
        variant="unstyled"
        icon={
          <ChevronUpIcon
            w={7}
            h={7}
            color={post.voteType === VoteTypeValue.Upvote ? "red" : undefined}
          />
        }
        aria-label="upvote"
        onClick={
          post.voteType === VoteTypeValue.Upvote
            ? undefined
            : () => upvote(post.id)
        }
      />
      <Text fontSize="13px" fontWeight="600">
        {post.points}
      </Text>
      <IconButton
        size="sm"
        variant="unstyled"
        icon={
          <ChevronDownIcon
            w={7}
            h={7}
            color={post.voteType === VoteTypeValue.Downvote ? "red" : undefined}
          />
        }
        aria-label="downvote"
        onClick={
          post.voteType === VoteTypeValue.Downvote
            ? undefined
            : () => downvote(post.id)
        }
      />
    </Flex>
  );
};

export default UpvoteSection;
