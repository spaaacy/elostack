"use client";

import { UserContext } from "@/context/UserContext";
import Image from "next/image";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Loader from "../common/Loader";

const TutorialModal = ({ setPosts, project, setShowTutorialModal }) => {
  const { session, profile } = useContext(UserContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const createPost = async (data, e) => {
    e?.preventDefault();
    setLoading(true);
    const userId = session?.data.session.user.id;
    if (!userId) return;

    const newPost = {
      created_at: new Date().toISOString(),
      username: profile.username,
      user_image_id: profile.image_id,
      content: data.post,
      user_id: userId,
      projectId: project.id,
      likes: [],
      comment: [],
      id: "0",
      image_id: [],
    };
    setPosts((prevPosts) => [newPost, ...prevPosts]);

    try {
      const formData = new FormData();
      formData.append(
        "requestBody",
        JSON.stringify({
          content: data.post,
          userId,
          projectId: project.id,
          isPublic: false,
          projectTitle: project.title,
        })
      );

      const response = await fetch("/api/post/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
        },
        body: formData,
      });

      if (response.status === 201) {
        const { postId } = await response.json();
        setPosts((prevPosts) => prevPosts.map((post) => (post.id === "0" ? { ...post, id: postId } : post)));
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== "0"));
      toast.error("Oops, something went wrong...");
      console.error(error);
    }

    try {
      const response = await fetch("/api/member/tutorial-complete", {
        method: "PATCH",
        headers: {
          "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
        },
        body: JSON.stringify({ projectId: project.id, userId }),
      });
      if (response.status === 200) {
        setShowTutorialModal(false);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-backgrounddark backdrop-blur bg-opacity-50 h-screen w-screen fixed z-50">
      <div className="md:w-[40rem] md:min-w-96 flex flex-col max-sm:w-full items-center dark:border dark:border-gray-400 fixed  bg-gray-200 dark:bg-neutral-900 rounded p-4 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {loading ? (
          <Loader />
        ) : currentPage === 1 ? (
          <div className="flex flex-col gap-4 items-center">
            <h3 className="font-semibold">Welcome to the project!</h3>

            <p className="text-center my-auto text-sm">
              This tutorial will walk you through the process of getting starting. Press next to continue!
            </p>
            <button
              onClick={() => setCurrentPage(2)}
              className="ml-auto bg-primary hover:bg-primarydark px-2 py-1 hover:text-neutral-200 text-white rounded mt-4"
            >
              Next
            </button>
          </div>
        ) : currentPage === 2 ? (
          <div className="flex flex-col gap-4 items-center">
            <h3 className=" font-semibold">Project Updates</h3>
            <p className="text-center my-auto text-sm">
              Use the updates section to post regular updates on the project. You can make a post either public or
              private, to specify whether users outside your project can view your posts.
            </p>
            <div className="h-52 w-full overflow-hidden relative">
              <Image src={"/tutorial/updates.png"} alt="updates" className="object-contain" fill={true} unoptimized />
            </div>
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setCurrentPage(1)}
                className="bg-primary hover:bg-primarydark px-2 py-1 hover:text-neutral-200 text-white rounded mt-4"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentPage(3)}
                className="bg-primary hover:bg-primarydark px-2 py-1 hover:text-neutral-200 text-white rounded mt-4"
              >
                Next
              </button>
            </div>
          </div>
        ) : currentPage === 3 ? (
          <div className="flex flex-col gap-4 items-center">
            <h3 className="font-semibold">Project Sprints</h3>
            <p className="text-sm text-center my-auto">
              The tasks necessary to complete this project have been divided into "sprints." Members must work together
              to complete a sprint, with each sprint having tasks specific to each role. You can use the{" "}
              <span className="font-bold text-primary">Assign Yourself</span> button to get started so others know which
              tasks you are working on.
            </p>
            <div className="h-52 w-full overflow-hidden relative">
              <Image src={"/tutorial/sprints.png"} alt="updates" className="object-contain" fill={true} unoptimized />
            </div>
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setCurrentPage(2)}
                className="bg-primary hover:bg-primarydark px-2 py-1 hover:text-neutral-200 text-white rounded mt-4"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentPage(4)}
                className="bg-primary hover:bg-primarydark px-2 py-1 hover:text-neutral-200 text-white rounded mt-4"
              >
                Next
              </button>
            </div>
          </div>
        ) : currentPage === 4 ? (
          <div className="flex flex-col gap-4 items-center">
            <h3 className="font-semibold">Project Sprints</h3>
            <p className="text-sm text-center my-auto">
              You can message your team members using the <span className="font-bold text-primary">Messages</span> tab
              on the bottom right of the screen.
            </p>
            <div className="h-96 w-full overflow-hidden relative">
              <Image src={"/tutorial/chat.png"} alt="updates" className="object-contain" fill={true} unoptimized />
            </div>
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setCurrentPage(3)}
                className="bg-primary hover:bg-primarydark px-2 py-1 hover:text-neutral-200 text-white rounded mt-4"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentPage(5)}
                className="bg-primary hover:bg-primarydark px-2 py-1 hover:text-neutral-200 text-white rounded mt-4"
              >
                Next
              </button>
            </div>
          </div>
        ) : currentPage === 5 ? (
          <div className="flex flex-col gap-4 items-center ">
            <h3 className="font-semibold">Meetings</h3>
            <p className="text-sm text-center my-auto">
              Schedule meetings with your teammates easily using the create meetings tab. To find a common time for all
              members, just enter your availability and a common time will automatically be found.
            </p>
            <div className="h-80 w-full overflow-hidden relative">
              <Image src={"/tutorial/meetings.png"} alt="updates" className="object-contain" fill={true} unoptimized />
            </div>
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setCurrentPage(4)}
                className="bg-primary hover:bg-primarydark px-2 py-1 hover:text-neutral-200 text-white rounded mt-4"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentPage(6)}
                className="bg-primary hover:bg-primarydark px-2 py-1 hover:text-neutral-200 text-white rounded mt-4"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(createPost)} className="flex flex-col gap-2 w-full">
            <h3 className="font-semibold">Create your first post</h3>
            <textarea
              placeholder="Tell us about yourself!"
              className="w-full resize-none overflow-y-auto bg-white rounded-md dark:bg-backgrounddark dark:focus:bg-neutral-800 p-2 text-sm dark:border-[1px] dark:border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
              id="scrollableDiv"
              rows={10}
              {...register("post", { required: "Post cannot be empty" })}
              type="text"
            />
            {errors.post && (
              <p role="alert" className="text-xs text-red-500">
                {errors.post.message}
              </p>
            )}
            <div className="flex items-center justify-between w-full">
              <button
                onClick={() => setCurrentPage(4)}
                className="bg-primary hover:bg-primarydark px-2 py-1 hover:text-neutral-200 text-white rounded mt-4"
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-primarydark px-2 py-1 hover:text-neutral-200 text-white rounded mt-4"
              >
                Create
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TutorialModal;
