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
import Image from "next/image";
import ProjectOverview from "./ProjectOverview";
import availableRoles from "@/utils/availableRoles";
import { Tooltip } from "react-tooltip";
import { formatTime } from "@/utils/formatTime";

const ProjectPublic = ({ project, members }) => {
  const { session, projects } = useContext(UserContext);
  const [showAgreement, setShowAgreement] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState();
  const [showLoadMorePosts, setShowLoadMorePosts] = useState(false);
  const [currentState, setCurrentState] = useState("overview");
  const banned = members.some((m) => m.banned && m.user_id === session.data.session?.user.id);
  const canJoin =
    projects?.length > 0
      ? !projects.some(
          (p) => (p.status.toLowerCase() === "in progress" || p.status.toLowerCase() === "just created") && !p.deleted
        )
      : true;

  useEffect(() => {
    const loadData = async () => {
      setDataLoaded(true);
      fetchPosts();
      setLoading(false);
    };

    if (session) {
      if (!dataLoaded) loadData();
    }
  }, [session]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/post/${project.id}/public`, {
        method: "POST",
        body: JSON.stringify({ pageNumber: 1 }),
      });
      if (response.status === 200) {
        const { posts } = await response.json();
        setPosts(posts);
        if (posts.length === 5) {
          setShowLoadMorePosts(true);
        } else setShowLoadMorePosts(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleModalClose = (e) => {
    if (e.target === e.currentTarget) {
      setShowAgreement(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      {loading ? (
        <Loader />
      ) : (
        <main>
          <div className="flex items-center gap-4 flex-wrap">
            {project.image_id && (
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_STORAGE_PATH}/project-image/${project.id}/${project.image_id}`}
                alt="project image"
                width={64}
                height={64}
                className="object-cover w-16 h-16 rounded-full "
              />
            )}
            <div className="flex flex-col justify-start items-start">
              <h1 className="font-bold text-2xl">{project.title}</h1>
              <p className="text-primary dark:font-normal font-semibold">{project.status}</p>

              {project.deadline && (
                <p className="text-sm font-light">
                  Due Date:{` `}
                  {formatTime(project.deadline).replace(" at ", ", ")}
                </p>
              )}
            </div>

            <div className="ml-auto flex-shrink-0">
              {session?.data.session ? (
                project.total_members < project.team_size &&
                !banned && (
                  <>
                    <button
                      data-tooltip-id="join-tooltip"
                      data-tooltip-content="You are already in a project"
                      disabled={!canJoin}
                      onClick={() => setShowAgreement(true)}
                      className={`${
                        !canJoin
                          ? "hover:cursor-not-allowed bg-neutral-600 text-neutral-400"
                          : "bg-primary hover:bg-primarydark hover:text-gray-300  text-gray-200"
                      } flex-shrink-0 mt-auto self-end px-3 py-1  rounded-full text-sm`}
                    >
                      Join Project
                    </button>
                    {!canJoin && <Tooltip id="join-tooltip" place="bottom" type="dark" effect="float" />}
                  </>
                )
              ) : (
                <Link
                  href={"/signin"}
                  className={
                    "flex-shrink-0 bg-primary hover:bg-primarydark hover:text-gray-300 mt-auto self-end px-3 py-1 rounded-full text-sm  dark:shadow dark:shadow-neutral-800 text-gray-200"
                  }
                >
                  Join Project
                </Link>
              )}
              {banned && (
                <p className="bg-red-700 mt-auto self-end px-3 py-1  rounded-full text-sm  dark:shadow dark:shadow-neutral-800 flex-shrink-0 text-gray-200">
                  You were banned
                </p>
              )}
            </div>
          </div>
          <hr className="border-0 h-[1px] bg-gray-400 my-4" />
          <div className="flex gap-2 text-sm mb-4 flex-wrap">
            <button
              type="button"
              onClick={() => setCurrentState("overview")}
              className={`${
                currentState === "overview"
                  ? "bg-primary text-white"
                  : "bg-gray-200 dark:bg-backgrounddark hover:bg-gray-300 dark:hover:bg-neutral-800"
              } rounded dark:border px-2 py-1`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setCurrentState("updates")}
              className={`${
                currentState === "updates"
                  ? "bg-primary text-white"
                  : "bg-gray-200 dark:bg-backgrounddark hover:bg-gray-300 dark:hover:bg-neutral-800"
              } rounded dark:border px-2 py-1`}
            >
              Updates
            </button>
          </div>
          {currentState === "overview" ? (
            <ProjectOverview members={members} project={project} />
          ) : (
            <Feed
              posts={posts}
              setPosts={setPosts}
              project={project}
              isMember={false}
              showLoadMorePosts={showLoadMorePosts}
              setShowLoadMorePosts={setShowLoadMorePosts}
            />
          )}
        </main>
      )}
      {showAgreement && (
        <ProjectAgreement
          handleModalClose={handleModalClose}
          project={project}
          members={members}
          setLoading={setLoading}
          setShowAgreement={setShowAgreement}
        />
      )}
      <Toaster />
    </div>
  );
};

const ProjectAgreement = ({ handleModalClose, project, members, setLoading, setShowAgreement }) => {
  const [isDisabled, setIsDisabled] = useState(true);
  const { session, profile } = useContext(UserContext);
  const rolesAvailable = availableRoles(members, project.roles);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDisabled(false);
    }, 5000);

    // Cleanup the timer on component unmount
    return () => clearTimeout(timer);
  }, []);

  const joinProject = async (message) => {
    if (!session.data.session) return;
    try {
      setShowAgreement(false);
      setLoading(true);
      const response = await fetch("/api/member/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          username: profile.username,
          userId: session.data.session.user.id,
          projectId: project.id,
          projectTitle: project.title,
        }),
      });
      if (response.status === 201) {
        window.location.reload();
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      setLoading(false);
      toast.error("Oops, something went wrong...");
      console.error(error);
    }
  };

  return (
    <div
      onClick={handleModalClose}
      className="bg-backgrounddark bg-opacity-50 h-screen w-screen fixed backdrop-blur-sm z-50"
    >
      <div className="gap-2 dark:border dark:border-gray-400 flex flex-col items-center justify-center fixed max-sm:w-full sm:w-[480px] bg-gray-200 dark:bg-backgrounddark rounded p-4 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <h3 className="font-semibold">Please read before continuing</h3>
        <div className="flex flex-col">
          <li className="text-sm">By joining this project, you will not be able to join any other projects.</li>
          <li className="text-sm ">
            The role you choose once you are in a project will be permanent and cannot be changed.
          </li>
          <li className="text-sm ">
            By pressing agree, you acknowledge that you will be able to contribute the next{" "}
            <span className="font-semibold text-primary">
              {formatDuration(project.duration_length, project.duration_type)}
            </span>{" "}
            to the project.
          </li>
          <li className="text-sm ">
            The roles available for the project are:{" "}
            <span className="capitalize font-semibold text-primary">
              {rolesAvailable.join(", ")}
              {rolesAvailable.includes("frontend") && rolesAvailable.includes("backend") ? ", full-stack." : "."}
            </span>
          </li>
          <li className="text-sm ">Please ensure you are able to fill one of these roles before continuing.</li>
        </div>
        <button
          disabled={isDisabled}
          onClick={joinProject}
          type="button"
          className={`${
            isDisabled
              ? "hover:cursor-progress bg-neutral-600 text-neutral-300"
              : "bg-primary hover:bg-primarydark hover:text-gray-300  text-gray-200"
          }  px-2 py-1 rounded mt-2 text-md`}
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default ProjectPublic;
