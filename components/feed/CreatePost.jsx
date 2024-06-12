"use client";

import { UserContext } from "@/context/UserContext";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { FaRegImage } from "react-icons/fa6";
import { IoIosRemoveCircle } from "react-icons/io";
import { MdOutlinePublic, MdOutlinePublicOff } from "react-icons/md";

const CreatePost = ({ setPosts, project }) => {
  const { profile, session } = useContext(UserContext);
  const [publicPost, setPublicPost] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef();
  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const createPost = async (data, e) => {
    e?.preventDefault();
    const userId = session?.data.session.user.id;
    if (!userId) return;

    setValue("content", "");
    setImagePreviews([]);
    const newPost = {
      created_at: new Date().toISOString(),
      username: profile.username,
      user_image_id: profile.image_id,
      content: data.content,
      user_id: userId,
      projectId: project ? project.id : null,
      likes: [],
      comment: [],
      id: "0",
      images: images.length > 0,
    };
    setPosts((prevPosts) => [newPost, ...prevPosts]);

    try {
      const formData = new FormData();
      if (images.length > 0) {
        images.forEach((image, index) => {
          formData.append(`images[${index}]`, image);
        });
        formData.append("totalImages", images.length);
      }
      formData.append(
        "requestBody",
        JSON.stringify({
          content: data.content,
          userId,
          projectId: project ? project.id : null,
          isPublic: project ? publicPost : true,
          projectTitle: project ? project.title : null,
        })
      );
      setImages([]);

      const response = await fetch("/api/post/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
        },
        body: formData,
      });

      if (response.status === 201) {
        const { postId, imageIds } = await response.json();
        const newImageIds = imageIds.map(id => postId + "/" + id)
        setPosts((prevPosts) => prevPosts.map((post) => (post.id === "0" ? { ...post, id: postId, image_id: newImageIds } : post)));
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== "0"));
      toast.error("Oops, something went wrong...");
      console.error(error);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (images.length >= 3) {
      toast.error("Maximum of three images are allowed");
      return;
    }
    setImages((prevImages) => [...prevImages, file]);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prevImages) => [reader.result, ...prevImages]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImagePreviews((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(createPost)}
        className="rounded-xl bg-neutral-50 px-3 py-2 dark:bg-backgrounddark dark:border dark:border-gray-400 flex flex-col gap-2"
      >
        <div className="flex items-center">
          <p className="text-base font-semibold ">Post an update</p>
          {project && (
            <button
              className="ml-auto flex items-center gap-2 rounded-full px-2 py-1 bg-sky-600 text-white text-sm"
              onClick={() => setPublicPost(!publicPost)}
            >
              {publicPost ? "Public" : "Private"}
              {publicPost ? <MdOutlinePublic /> : <MdOutlinePublicOff />}
            </button>
          )}
        </div>
        <textarea
          {...register("content", { required: "Content cannot be empty" })}
          id="scrollableDiv"
          placeholder="Tell everyone what's new..."
          className="p-2 text-sm w-full bg-gray-200 rounded-xl resize-none focus:bg-gray-300 dark:bg-backgrounddark dark:focus:bg-neutral-800 dark:border-[1px] dark:border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
          rows={3}
        />
        {imagePreviews.length > 0 && (
          <ul className="flex gap-2 items-end">
            {imagePreviews.map((image, i) => (
              <div className="relative">
                <Image key={i} alt={`image_${i}`} src={image} width={100} height={100} className="rounded" />
                  <IoIosRemoveCircle onClick={() => removeImage(i)} className="hover:cursor-pointer text-primary absolute -bottom-2 -right-2 p-[1px] bg-white dark:bg-backgrounddark rounded-full" />
              </div>
            ))}
          </ul>
        )}
        <div className="flex items-center">
          <div onClick={() => fileInputRef.current.click()} className="hover:cursor-pointer">
            <FaRegImage className="text-gray-900 hover:text-gray-700 dark:text-neutral-300 dark:hover:text-neutral-200" />
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
          <button
            className="ml-auto px-2 py-1 bg-primary hover:bg-primarydark rounded-full text-xs text-gray-200 hover:text-gray-300 dark:shadow dark:shadow-neutral-800"
            type="submit"
          >
            Create
          </button>
        </div>
      </form>
      <hr className="border-0 h-[1px] bg-gray-400 my-8" />
    </div>
  );
};

export default CreatePost;
