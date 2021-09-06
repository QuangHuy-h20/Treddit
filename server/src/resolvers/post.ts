import {
  Arg,
  Ctx,
  FieldResolver,
  ID,
  Int,
  Mutation,
  Query,
  registerEnumType,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { Post } from "../entities/Post";
import { CreatePostInput } from "../types/CreatePostInput";
import { PostMutationResponse } from "../types/PostMutationResponse";
import { UpdatePostInput } from "../types/UpdatePostInput";
import { checkAuth } from "../middleware/checkAuth";
import { User } from "../entities/User";
import { PaginatedPosts } from "../types/PaginatedPosts";
import { LessThan } from "typeorm";
import { Context } from "../types/Context";
import { VoteType } from "../types/VoteType";
import { UserInputError } from "apollo-server-errors";
import { Upvote } from "../entities/Upvote";

registerEnumType(VoteType, {
  name: "VoteType", // this one is mandatory
});

@Resolver((_of) => Post)
export class PostResolver {
  @FieldResolver((_returns) => String)
  textSnippet(@Root() root: Post) {
    return root.description.slice(0, 50);
  }

  @FieldResolver((_returns) => User)
  async user(
    @Root() root: Post,
    @Ctx() { dataLoaders: { userLoader } }: Context
  ) {
    // return await User.findOne(root.userId);
    return await userLoader.load(root.userId);
  }

  @FieldResolver((_returns) => Int)
  async voteType(
    @Root() root: Post,
    @Ctx() { req, dataLoaders: { voteTypeLoader } }: Context
  ) {
    if (!req.session.userId) return 0;
    // const existingVote = await Upvote.findOne({
    //   postId: root.id,
    //   userId: req.session.userId,
    // });
    const existingVote = await voteTypeLoader.load({
      postId: root.id,
      userId: req.session.userId,
    });
    return existingVote ? existingVote.value : 0;
  }
  //QUERY

  //Get all posts
  @Query((_returns) => PaginatedPosts, { nullable: true })
  async posts(
    @Arg("limit", (_type) => Int) limit: number,
    @Arg("cursor", { nullable: true }) cursor?: string
  ): Promise<PaginatedPosts | null> {
    try {
      const totalPostCount = await Post.count();
      const realLimit = Math.min(10, limit);
      const findOptions: { [key: string]: any } = {
        order: {
          createdAt: "DESC",
        },
        take: realLimit,
      };
      let lastPost: Post[] = [];
      if (cursor) {
        findOptions.where = { createdAt: LessThan(cursor) };

        lastPost = await Post.find({
          order: {
            createdAt: "ASC",
          },
          take: 1,
        });
      }

      const posts = await Post.find(findOptions);
      return {
        totalCount: totalPostCount,
        cursor: posts[posts.length - 1].createdAt,
        hasMore: cursor
          ? posts[posts.length - 1].createdAt.toString() !==
            lastPost[0].createdAt.toString()
          : posts.length !== totalPostCount,
        paginatedPosts: posts,
      };
    } catch (error) {
      return null;
    }
  }
  //Get post by Id
  @Query((_returns) => Post, { nullable: true })
  async post(@Arg("id", (_type) => ID) id: number): Promise<Post | undefined> {
    try {
      return await Post.findOne(id);
    } catch (error) {
      return undefined;
    }
  }

  //MUTATION

  //Create post
  @Mutation((_returns) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async createPost(
    @Arg("createPostInput") { title, description }: CreatePostInput,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    try {
      const newPost = Post.create({
        title,
        description,
        userId: req.session.userId,
      });
      await newPost.save();
      return {
        code: 200,
        success: true,
        message: "Successfully created post",
        post: newPost,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }

  @Mutation((_returns) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async updatePost(
    @Arg("updatePostInput") { id, title, description }: UpdatePostInput,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    try {
      const existingPost = await Post.findOne(id);

      if (!existingPost)
        return { code: 400, success: false, message: "Post not found" };

      if (existingPost.userId !== req.session.userId)
        return { code: 401, success: false, message: "Unauthorized" };

      existingPost.title = title;
      existingPost.description = description;

      await existingPost.save();
      return { code: 200, success: true, message: "Post updated successfully" };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }

  @Mutation((_returns) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async deletePost(
    @Arg("id", (_type) => ID) id: number,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    // console.log("Request.session: ", req.session);
    try {
      const existingPost = await Post.findOne(id);

      if (!existingPost)
        return { code: 400, success: false, message: "Post not found" };
      if (existingPost.userId !== req.session.userId)
        return { code: 401, success: false, message: "Unauthorized" };

      await Post.delete({ id });

      return { code: 200, success: true, message: "Post deleted successfully" };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }

  @Mutation((_returns) => PostMutationResponse)
  @UseMiddleware(checkAuth)
  async vote(
    @Arg("postId", (_type) => Int) postId: number,
    @Arg("inputVoteValue", (_type) => VoteType) inputVoteValue: VoteType,
    @Ctx()
    {
      req: {
        session: { userId },
      },
      connection,
    }: Context
  ): Promise<PostMutationResponse> {
    //check if post exists

    return await connection.transaction(async (transactionEntityManager) => {
      let post = await transactionEntityManager.findOne(Post, postId);
      if (!post) throw new UserInputError("Post not found");

      //check if user has voted or not
      const existingVote = await transactionEntityManager.findOne(Upvote, {
        postId,
        userId,
      });

      if (existingVote && existingVote.value !== inputVoteValue) {
        await transactionEntityManager.save(Upvote, {
          ...existingVote,
          value: inputVoteValue,
        });

        post = await transactionEntityManager.save(Post, {
          ...post,
          points: post.points + 2 * inputVoteValue,
        });
      }

      if (!existingVote) {
        const newVote = transactionEntityManager.create(Upvote, {
          userId,
          postId,
          value: inputVoteValue,
        });
        await transactionEntityManager.save(newVote);
        post.points += inputVoteValue;
        post = await transactionEntityManager.save(post);
      }

      return {
        code: 200,
        success: true,
        message: "Post voted",
        post,
      };
    });
  }
}
