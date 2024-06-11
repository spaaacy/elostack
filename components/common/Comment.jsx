"use client";

import { formatTime } from "@/utils/formatTime";
import imageExists from "@/utils/imageExists";
import Image from "next/image";
import { useEffect, useState } from "react";

const Comment = ({ comment }) => {
  const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_STORAGE_PATH}/profile-picture/${
    comment.user_id
  }/default?${new Date().getTime()}`;
  const [imageValid, setImageValid] = useState(false);

  useEffect(() => {
    setImageValid(imageExists(imageUrl));
  }, []);

  return (
    <>
      <div className="flex items-center justify-start gap-2">
        <Image
          src={imageValid ? imageUrl : "/default_user.png"}
          alt="profile picture"
          className="object-cover rounded-full w-7 h-7 inline"
          width={28}
          height={28}
        />
        <p className="font-medium">{`${comment.username}`}</p>
        <p className="ml-auto text-xs font-light">{formatTime(comment.created_at, true)}</p>
      </div>
      <p className="text-sm break-words">{comment.comment}</p>
    </>
  );
};

export default Comment;
