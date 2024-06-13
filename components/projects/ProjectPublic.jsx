"use client";

import Link from "next/link";
import NavBar from "../navbar/NavBar";
import { FaGithub } from "react-icons/fa6";
import { useContext, useEffect, useState } from "react";
import { formatDuration } from "@/utils/formatDuration";
import Feed from "../feed/Feed";
import { UserContext } from "@/context/UserContext";
import { useForm } from "react-hook-form";
import Loader from "../common/Loader";
import toast, { Toaster } from "react-hot-toast";

const ProjectPublic = ({ project, members }) => {
  const { session } = useContext(UserContext);
  const [showMoreDescription, setShowMoreDescription] = useState(false);
  const [banned, setBanned] = useState(false);
  const [request, setRequest] = useState();
  const [showRequest, setShowRequest] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (session) {
      if (session.data.session) {
        if (!dataLoaded) {
          setDataLoaded(true);
          fetchRequest();
          setBanned(members.some((m) => m.banned && m.user_id === session.data.session?.user.id));
        }
      }
    }
  }, [session]);

  const fetchRequest = async () => {
    const userId = session.data.session?.user.id;
    if (!userId) return;
    try {
      const response = await fetch("/api/request/user", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({ userId, projectId: project.id }),
      });
      if (response.status === 200) {
        const { requests } = await response.json();
        setRequest(requests);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const createRequest = async (message) => {
    if (!session.data.session) return;
    try {
      setShowRequest(false);
      setLoading(true);
      const response = await fetch("/api/request/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          userId: session.data.session.user.id,
          projectId: project.id,
          message,
          projectLeader: project.leader,
          projectTitle: project.title,
        }),
      });
      if (response.status === 201) {
        toast.success("Request has been made!");
        setRequest({
          user_id: session.data.session.user.id,
          project_id: project.id,
          message,
          accepted: false,
          rejected: false,
        });
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data, e) => {
    e.preventDefault();
    await createRequest(data.request);
  };

  const handleModalClose = (e) => {
    if (e.target === e.currentTarget) {
      setShowRequest(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {loading ? (
        <Loader />
      ) : (
        <main>
          <div className="flex justify-between items-center">
            <h1 className="font-bold text-2xl">{project.title}</h1>

            {session?.data.session ? (
              project.is_open &&
              !banned &&
              !request && (
                <button
                  onClick={() => setShowRequest(true)}
                  className="flex-shrink-0 bg-primary hover:bg-primarydark hover:text-gray-300 mt-auto self-end px-3 py-1  rounded-full text-sm  dark:shadow dark:shadow-neutral-800 text-gray-200"
                >
                  Request to Join
                </button>
              )
            ) : (
              <Link
                href={"/signin"}
                className={
                  "flex-shrink-0 bg-primary hover:bg-primarydark hover:text-gray-300 mt-auto self-end px-3 py-1  rounded-full text-sm  dark:shadow dark:shadow-neutral-800 text-gray-200"
                }
              >
                Request to Join
              </Link>
            )}
            {banned ? (
              <p className="bg-red-700 mt-auto self-end px-3 py-1  rounded-full text-sm  dark:shadow dark:shadow-neutral-800 flex-shrink-0 text-gray-200">
                You were banned
              </p>
            ) : (
              request && (
                <p
                  className={`${
                    request.rejected ? "bg-red-700" : "bg-green-600"
                  }  mt-auto self-end px-3 py-1  rounded-full text-sm  dark:shadow dark:shadow-neutral-800 flex-shrink-0 text-gray-200`}
                >
                  {request.rejected ? "Your were rejected" : "Request made"}
                </p>
              )
            )}
          </div>
          <p className="font-light ">{project.status}</p>
          <hr className="border-0 h-[1px] bg-gray-400 my-4" />
          <div className="flex gap-4 items-start max-lg:flex-col">
            <div className="lg:w-72 p-2 rounded dark:border bg-gray-300 dark:bg-backgrounddark  dark:border-gray-400 flex flex-col font-light text-sm ">
              <p className="relative">
                <span className="font-semibold">Description</span>
                <br />
                {showMoreDescription ? project.description : `${project.description.substring(0, 265)}...`}
                <button
                  type="button"
                  className="bg-gray-300 pl-2 dark:bg-backgrounddark absolute bottom-0 right-0 dark:text-blue-400 dark:hover:text-blue-500 text-blue-600 hover:text-blue-700 hover:underline"
                  onClick={() => setShowMoreDescription(!showMoreDescription)}
                >
                  {showMoreDescription ? "Show Less" : "Show More"}
                </button>
              </p>

              <p className="mt-4 font-semibold">Members</p>
              <ul>
                <p href={"/"} className=" ">{`${
                  members.find((m) => m.user_id === project.leader).profile.username
                } (Leader)`}</p>
                {members
                  .filter((member) => member.user_id !== project.leader && !member.banned)
                  .map((member, i) => {
                    return (
                      <li key={i}>
                        <p className=" ">{member.profile.username}</p>
                      </li>
                    );
                  })}
              </ul>
              <p className="mt-4 font-semibold">Technologies</p>
              <p>{project.technologies}</p>
              <div className="flex items-end">
                <p className="text-primary mt-4 dark:font-normal font-medium">
                  {`Duration: ${formatDuration(project.duration_length, project.duration_type)}`}
                </p>
                {project.github && (
                  <Link className="ml-auto" href={project.github} target="_blank">
                    <FaGithub className=" text-2xl dark:hover:text-gray-300 hover:text-gray-500" />
                  </Link>
                )}
              </div>
            </div>
            <Feed isMember={members.find((m) => m.user_id === session.data.session?.user.id)} project={project} />
          </div>
        </main>
      )}
      {showRequest && (
        <div
          onClick={handleModalClose}
          className="bg-backgrounddark bg-opacity-50 h-screen w-screen fixed backdrop-blur-sm z-50"
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="gap-2 dark:border dark:border-gray-400 flex flex-col items-start justify-start fixed max-sm:w-full sm:w-[480px] bg-gray-200 dark:bg-backgrounddark rounded p-4 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <label>Create request</label>
            <textarea
              placeholder="Tell us about yourself!"
              className="resize-none overflow-y-auto bg-white rounded-md dark:bg-backgrounddark dark:focus:bg-neutral-800 p-2 text-sm dark:border-[1px] dark:border-gray-400 focus:border-white focus:ring-0 focus:outline-none w-full"
              id="scrollableDiv"
              rows={10}
              {...register("request", { required: "Request cannot be empty" })}
              type="text"
            />
            {errors.request && (
              <p role="alert" className="text-xs text-red-500">
                {errors.request.message}
              </p>
            )}
            <button
              type="submit"
              className="flex-shrink-0 bg-primary hover:bg-primarydark hover:text-gray-300 self-end px-3 py-1  rounded-full text-sm  dark:shadow dark:shadow-neutral-800 text-gray-200 mt-2"
            >
              Create
            </button>
          </form>
        </div>
      )}
      <Toaster />
    </div>
  );
};

export default ProjectPublic;
