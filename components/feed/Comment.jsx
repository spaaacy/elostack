"use client";

import { formatTime } from "@/utils/formatTime";
import Image from "next/image";
import { useEffect, useState } from "react";
import UserAvatar from "../common/UserAvatar";
import Markdown from "react-markdown";

const Comment = ({ comment }) => {
  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_STORAGE_PATH}/profile-picture/${comment.user_id}/${comment.user_image_id}`;

  return (
    <>
      <div className="flex items-center justify-start gap-2">
        {comment.user_image_id ? (
          <Image
            src={imageUrl}
            alt="profile picture"
            className="object-cover rounded-full w-7 h-7 inline"
            width={28}
            height={28}
          />
        ) : (
          <UserAvatar size={28} username={comment.username} />
        )}
        <p className="font-medium">{`${comment.username}`}</p>
        {comment.university_name && (
          <p
            className="text-sm px-2 rounded-full font-bold bg-black dark:bg-white text-white dark:text-black"
            style={
              comment.university && {
                color: comment.university[0].secondary_color,
                "background-color": comment.university[0].primary_color,
              }
            }
          >
            {comment.university_name}
          </p>
        )}
        <p className="ml-auto text-xs font-light">{formatTime(comment.created_at, "date")}</p>
      </div>
      <Markdown className="markdown">{comment.comment}</Markdown>
    </>
  );
};

export default Comment;
