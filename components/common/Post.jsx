"use client";

import { UserContext } from "@/context/UserContext";
import imageExists from "@/utils/imageExists";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { BiLike } from "react-icons/bi";
import { BiSolidLike } from "react-icons/bi";
import { FaRegComment } from "react-icons/fa";
import { FaComment } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import Comment from "./Comment";
import { formatDuration } from "@/utils/formatDuration";
import { formatTime } from "@/utils/formatTime";
import Link from "next/link";

const Post = ({ post, setPosts, project }) => {
  const { profile, session } = useContext(UserContext);
  const [comments, setComments] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [imageValid, setImageValid] = useState(false);
  const liked = post.likes.find((l) => l === session?.data.session?.user.id);
  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_STORAGE_PATH}/profile-picture/${
    post.user_id
  }/default?${new Date().getTime()}`;
  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    setImageValid(imageExists(imageUrl));

    const loadData = async () => {
      if (!dataLoaded) {
        setDataLoaded(true);
        fetchComments();
      }
    };

    loadData();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comment/${post.id}`, {
        method: "POST",
        body: JSON.stringify({ pageNumber: 1, pageSize: 10 }),
      });
      if (response.status === 200) {
        const { comments } = await response.json();
        setComments(comments);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const likePost = async (post) => {
    const userId = session?.data.session.user.id;
    if (!userId) return;
    try {
      setPosts((prevPosts) =>
        prevPosts.map((prev) =>
          prev.id === post.id
            ? {
                ...prev,
                likes: [...prev.likes, userId],
              }
            : prev
        )
      );
      const response = await fetch("/api/like/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          userId,
          postId: post.id,
          postUserId: post.user_id,
          projectId: project ? project.id : null,
          projectTitle: project ? project.title : null,
        }),
      });

      if (response.status !== 201) {
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
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: post.likes.filter((like) => like !== userId),
              }
            : post
        )
      );
      const response = await fetch("/api/like/delete", {
        method: "DELETE",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          userId,
          postId,
        }),
      });
      if (response.status !== 200) {
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
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
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
        setComments((prevComments) => [
          ...prevComments,
          {
            id: commentId,
            comment: data.comment,
            user_id: userId,
            post_id: post.id,
            username: profile.username,
            created_at: new Date().toISOString(),
          },
        ]);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
    }
  };

  return (
    <div className=" text-sm rounded-xl bg-neutral-50 px-3 py-3 dark:bg-backgrounddark dark:border dark:border-gray-400 flex flex-col gap-2">
      {post.project_id && !project && (
        <Link
          className="text-xs font-light text-neutral-600 hover:underline"
          href={`/projects?id=${[post.project_id]}`}
        >
          {post.project_title}
        </Link>
      )}
      <div className="flex items-center gap-2">
        <Image
          src={imageValid ? imageUrl : "/default_user.png"}
          alt="profile picture"
          className="object-cover rounded-full w-9 h-9"
          width={36}
          height={36}
        />
        <p className="font-bold">{post.username}</p>
        <p className="ml-auto font-light text-xs">{formatTime(post.created_at, true)}</p>
      </div>
      <p className="break-words">{post.content}</p>
      <div className="text-neutral-600 dark:text-neutral-200 flex items-center gap-4 text-sm">
        {session?.data.session && (
          <button
            type="button"
            onClick={liked ? () => unlikePost(post.id) : () => likePost(post)}
            className="items-center flex"
          >
            {liked ? "Liked " : "Like "}
            {liked ? <BiSolidLike className="ml-2 inline" /> : <BiLike className="ml-2 inline" />}
          </button>
        )}
        <p className="font-light text-xs ml-auto">{`${post.likes.length} Likes`}</p>
      </div>

      {(session?.data.session || comments.length > 0) && (
        <div className="flex flex-col gap-2 bg-gray-200 dark:bg-neutral-800 px-3 py-2 rounded-lg">
          {comments.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">Comments</p>
              <hr className="border-0 h-[1px] bg-white dark:bg-neutral-500 my-1" />
              {comments.map((c, i) => (
                <Comment key={i} comment={c} />
              ))}
            </div>
          )}
          {session?.data.session && (
            <form onSubmit={handleSubmit(createComment)} className="flex flex-col gap-2">
              <textarea
                {...register("comment", { required: "Comment cannot be empty" })}
                id="scrollableDiv"
                placeholder="Share your thoughts..."
                className="p-2 w-full bg-gray-white rounded-full text-xs resize-none dark:bg-backgrounddark dark:border-[1px] dark:border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
                rows={1}
              />
              <button
                className="ml-auto px-2 py-1 bg-primary hover:bg-primarydark rounded-full text-gray-200 hover:text-gray-300 dark:shadow dark:shadow-neutral-800 text-xs"
                type="submit"
              >
                Comment
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Post;
