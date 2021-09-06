import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@Entity()
export class Upvote extends BaseEntity {
  @ManyToOne((_to) => User, (user) => user.upvotes)
  user!: User;
  @PrimaryColumn()
  userId!: number;

  @ManyToOne((_to) => Post, (post) => post.upvotes)
  post!: Post;
  @PrimaryColumn()
  postId!: number;

  @Column()
  value!: number;
}
