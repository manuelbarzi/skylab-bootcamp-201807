import { Types } from "mongoose";
import Post, { PostModelInterface } from "../../models/post";
import User, { UserModelInterface } from "../../models/user";
import { UserTagModelInterface } from "../../models/user-tag";
import LogicError from "../error/logic-error";
import { resolve } from "path";
import cloudinary from "../../config/cloudinary";
import Comment from "../../models/comment";

const postLogic = {

  create(username: string, filename: string, buffer: Buffer, caption?: string): Promise<string> | never {
    return Promise.resolve()
      .then(() => {
        if (!filename) { throw new LogicError("invalid filename"); }
        if (!buffer) { throw new LogicError("invalid buffer"); }

        return User.findOne({ username });
      })
      .then((user: UserModelInterface) => {
        if (!user) { throw new LogicError(`user with username ${username} does not exists`); }

        return new Promise((resolve, reject) => {
          cloudinary.v2.uploader.upload_stream((error: any, result: any) => {
            if (error) {
              return reject(new LogicError(`the file ${filename} could not be uploaded`));
            }

            const post = new Post();

            post.imageId = result.public_id;
            post.user = user._id;
            if (caption) { post.caption = caption; }

            resolve(post.save());

          }).end(buffer);
        });
      })
      .then((post: PostModelInterface) => post.id);
  },

  retrieve(username: string, id: string): Promise<PostModelInterface> | never {
    let post: PostModelInterface;
    return Promise.resolve()
      .then(() => {
        if (!id) { throw new LogicError("invalid post id"); }

        return Post.findOne({ _id: id }, { __v: 0 });
      })
      .then((foundPost: PostModelInterface) => {
        if (!foundPost) { throw new LogicError(`post with id ${id} does not exists`); }

        post = foundPost;

        return User.findById(post.user);
      })
      .then((user: UserModelInterface) => {
        if (!user) { throw new LogicError(`user with id ${post.user} does not exists`); }

        // if (user.privateAccount)

        return Post.findOne({ _id: id, user: user._id }, { __v: 0 });
      });

    // .then((user: UserModelInterface) => {
    //   if (!user) { throw new LogicError(`user with username ${username} does not exists`); }

    //   return Post.findOne({ _id: id, user: user._id }, { __v: 0 });
    // })
    // .then((post: PostModelInterface) => {
    //   if (!post) { throw new LogicError(`post with id ${id} does not exists`); }

    //   return post;
    // });
  },

  remove(username: string, id: string) {
    return Promise.resolve()
      .then(() => {
        if (!username) { throw new LogicError("invalid username"); }
        if (!id) { throw new LogicError("invalid post id"); }

        return User.findOne({ username });
      })
      .then((user: UserModelInterface) => {
        if (!user) { throw new LogicError(`user with username ${username} does not exists`); }

        return Post.findOne({ _id: id, user: user._id });
      })
      .then((post: PostModelInterface) => {
        if (!post) { throw new LogicError(`post with id ${id} does not exists`); }

        return post.remove();
      })
      .then(res => true);
  },

  addComment(username: string, postId: string, commentUsername: string, description: string): Promise<boolean> | never {
    let post: PostModelInterface;

    return Promise.resolve()
      .then(() => {
        if (!username) { throw new LogicError("invalid username"); }
        if (!postId) { throw new LogicError("invalid post id"); }
        if (!commentUsername) { throw new LogicError("invalid comment username"); }
        if (!description) { throw new LogicError("invalid comment description"); }

        return User.findOne({ username });
      })
      .then((user: UserModelInterface) => {
        if (!user) { throw new LogicError(`user with username ${username} does not exists`); }

        return Post.findOne({ _id: postId, user: user._id });
      })
      .then((foundPost: PostModelInterface) => {
        if (!foundPost) { throw new LogicError(`post with id ${postId} does not exists`); }

        post = foundPost;

        return User.findOne({ commentUsername });
      })
      .then((commentUser: UserModelInterface) => {
        if (!commentUser) { throw new LogicError(`comment user with username ${username} does not exists`); }

        const comment = new Comment();
        comment.description = description;
        comment.user = commentUser._id;

        post.comments.push(comment);

        return post.save();
      })
      .then((post: PostModelInterface) => true);
  },

  // TODO
  // removeComment(username: string, postId: string, commentId: string) {}

  // TODO
  // update(user: username, id: string, caption?: string) { },

  // TODO
  // addUserTag(user: username, id: string, users: number[]) { },

  // TODO
  // removeUserTag(user: username, id: string, userTagId: string) { },

};

export default postLogic;
