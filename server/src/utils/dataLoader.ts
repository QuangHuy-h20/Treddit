import DataLoader from "dataloader";
import { Upvote } from "../entities/Upvote";
import { User } from "../entities/User";

interface IVoteTypeConditionProps {
  postId: number;
  userId: number;
}

const batchGetUsers = async (userIds: number[]) => {
  const users = await User.findByIds(userIds);
  return userIds.map((userId) => users.find((user) => user.id === userId));
};

const batchGetVoteTypes = async (
  voteTypeConditions: IVoteTypeConditionProps[]
) => {
  const voteTypes = await Upvote.findByIds(voteTypeConditions);
  return voteTypeConditions.map((voteTypeCondition) =>
    voteTypes.find(
      (voteType) =>
        voteType.postId === voteTypeCondition.postId &&
        voteType.userId === voteTypeCondition.userId
    )
  );
};

export const buildDataLoaders = () => ({
  userLoader: new DataLoader<number, User | undefined>((userIds) =>
    batchGetUsers(userIds as number[])
  ),
  voteTypeLoader: new DataLoader<IVoteTypeConditionProps, Upvote | undefined>(
    (voteTypeConditions) =>
      batchGetVoteTypes(voteTypeConditions as IVoteTypeConditionProps[])
  ),
});
