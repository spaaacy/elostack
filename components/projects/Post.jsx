"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { BiLike } from "react-icons/bi";
import { BiSolidLike } from "react-icons/bi";
import { FaRegComment } from "react-icons/fa";
import { FaComment } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";

const Post = ({ post, session, setPosts, project, members }) => {
  const [comments, setComments] = useState([]);

  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const likePost = async (post) => {
    const userId = session?.data.session.user.id;
    if (!userId) return;
    try {
      const response = await fetch("/api/like/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth":
            session.data.session.access_token +
            " " +
            session.data.session.refresh_token,
        },
        body: JSON.stringify({
          userId,
          postId: post.id,
          postUserId: post.user_id,
          projectId: project.id,
          projectTitle: project.title,
        }),
      });

      if (response.status === 201) {
        setPosts((prevPosts) =>
          prevPosts.map((prev) =>
            prev.id === post.id
              ? {
                  ...prev,
                  like: [...prev.like, { user_id: userId, post_id: post.id }],
                }
              : prev
          )
        );
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
    }
  };

  const unlikePost = async (postId) => {
    const userId = session?.data.session.user.id;
    if (!userId) return;
    try {
      const response = await fetch("/api/like/delete", {
        method: "DELETE",
        headers: {
          "X-Supabase-Auth":
            session.data.session.access_token +
            " " +
            session.data.session.refresh_token,
        },
        body: JSON.stringify({
          userId,
          postId,
        }),
      });
      if (response.status === 200) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  like: post.like.filter((like) => like.user_id !== userId),
                }
              : post
          )
        );
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
    }
  };

  const createComment = async (data, e) => {
    e?.preventDefault();
    const userId = session?.data.session.user.id;
    if (!userId) return;
    try {
      const commentId = uuidv4();
      const response = await fetch("/api/comment/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth":
            session.data.session.access_token +
            " " +
            session.data.session.refresh_token,
        },
        body: JSON.stringify({
          comment: data.comment,
          userId,
          postId: post.id,
          commentId,
        }),
      });
      if (response.status === 201) {
        setValue("comment", "");
        setPosts((prevPosts) =>
          prevPosts.map((prev) =>
            prev.id === post.id
              ? {
                  ...prev,
                  comment: [...prev.comment, { id: commentId, comment: data.comment, user_id: userId, post_id: post.id }],
                }
              : prev
          )
        );
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
    }
  };

  const liked = post.like.find((l) => l.post_id === post.id);

  return (
    <div className=" text-sm rounded-xl bg-neutral-50 px-3 py-2 dark:bg-backgrounddark dark:border dark:border-gray-400 flex flex-col gap-2">
      <div className="flex items-center">
        <p className="font-bold">
          {members.find((m) => m.user_id === post.user_id).user.username}
        </p>
        {post.like.length > 0 && <p className="ml-auto font-light text-xs">
          {post.like.map(
            (like, i) =>
              `${
                members.find((m) => m.user_id === like.user_id).user.username
              }${i + 1 === post.like.length ? " " : ", "}`
          )}
          {"liked"}
        </p>}
      </div>
      {post.content}
      <div className="text-neutral-600 dark:text-neutral-200 flex items-center gap-4 text-sm">
        <button
          type="button"
          onClick={liked ? () => unlikePost(post.id) : () => likePost(post)}
          className="items-center flex"
        >
          {liked ? "Liked " : "Like "}
          {liked ? (
            <BiSolidLike className="ml-2 inline" />
          ) : (
            <BiLike className="ml-2 inline" />
          )}
        </button>
        <p className="font-light text-xs ml-auto">{`${post.like.length} Likes`}</p>
      </div>

      <div className="flex flex-col gap-2 bg-gray-200 dark:bg-neutral-800 px-3 py-2 rounded-lg">
        {post?.comment.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">Comments</p>
            <hr className="border-0 h-[1px] bg-white dark:bg-neutral-500 my-1" />
            {post.comment.map((c, i) => (
              <p key={i} className="text-sm">
                <span className="font-medium"> 
                  {`${members.find((m) => m.user_id === post.user_id).user.username}: `}
                  
                  </span>
                {c.comment}
              </p>
            ))}
          </div>
        )}
        <form
          onSubmit={handleSubmit(createComment)}
          className="flex flex-col gap-2"
        >
          <textarea
            {...register("comment", { required: "Comment cannot be empty" })}
            id="scrollableDiv"
            placeholder="Share your thoughts..."
            className="p-2 w-full bg-gray-white rounded-full text-xs resize-none dark:bg-backgrounddark dark:focus:bg-neutral-800 dark:border-[1px] dark:border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
            rows={1}
          />
          <button
            className="ml-auto px-2 py-1 bg-primary hover:bg-primarydark rounded-full text-gray-200 hover:text-gray-300 dark:shadow dark:shadow-neutral-800 text-xs"
            type="submit"
          >
            Comment
          </button>
        </form>
      </div>
    </div>
  );
};

export default Post;
