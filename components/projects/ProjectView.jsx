"use client";

import { useParams, useRouter } from "next/navigation";
import NavBar from "../navbar/NavBar";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { formatDuration } from "@/utils/formatDuration";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/UserContext";
import Loader from "../common/Loader";
import toast, { Toaster } from "react-hot-toast";
import SettingsDropdown from "./SettingsDropdown";
import ChatBox from "./ChatBox";
import Feed from "../common/Feed";

const ProjectView = () => {
  const { id } = useParams();
  const { session } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState();
  const [members, setMembers] = useState();
  const [showMoreDescription, setShowMoreDescription] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const router = useRouter();
  const [isLeader, setIsLeader] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setDataLoaded(true);
      await fetchProject();
      await fetchMembers();
    };

    if (session) {
      if (session.data.session) {
        if (!dataLoaded) loadData();
      } else {
        router.push("/signin");
      }
    }
  }, [session]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/project/${id}`, {
        method: "GET",
      });
      if (response.status === 200) {
        const { project } = await response.json();
        setProject(project);
        if (project.leader === session.data.session.user.id) {
          setIsLeader(true);
        }
      } else {
        router.push("/projects");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/project/${id}/member`, {
        method: "GET",
      });
      if (response.status === 200) {
        const { members } = await response.json();
        setMembers(members);
        const userId = session.data.session?.user.id;
        const access = members.some((m) => m.user_id === userId && !m.banned);
        if (!access) {
          router.push("/projects");
        } else setLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const changeStatus = async (status) => {
    if (!session.data.session) return;
    try {
      setLoading(true);
      const response = await fetch("/api/project/change-status", {
        method: "PATCH",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          status,
          projectId: id,
        }),
      });
      if (response.status === 200) {
        toast.success("Status changed");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <NavBar />
      {loading ? (
        <Loader />
      ) : (
        <main>
          <div className="flex justify-start items-end relative">
            <h1 className="font-bold text-2xl">{project.title}</h1>
            {project.github && (
              <Link href={project.github} target="_blank">
                <FaGithub className="ml-4 text-3xl dark:hover:text-gray-300 hover:text-gray-500" />
              </Link>
            )}
            <SettingsDropdown
              isLeader={isLeader}
              project={project}
              members={members}
              session={session}
              setLoading={setLoading}
            />
          </div>
          <p className="font-light ">{project.status}</p>
          <hr className="border-0 h-[1px] bg-gray-400 my-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 max-sm:mb-12">
            <div>
              <div className="p-2 rounded dark:border bg-gray-300 dark:bg-backgrounddark  dark:border-gray-400 flex flex-col font-light text-sm ">
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
                <p className="text-primary mt-4 dark:font-normal font-medium">
                  {`Duration: ${formatDuration(project.duration_length, project.duration_type)}`}
                </p>
              </div>
              {isLeader && (
                <button
                  onClick={() =>
                    changeStatus(
                      project.status.toLowerCase() === "just created"
                        ? "In progress"
                        : project.status.toLowerCase() === "in progress"
                        ? "Complete"
                        : "In progress"
                    )
                  }
                  type="button"
                  className="text-gray-200 bg-primary text-xs px-2 py-1 mt-2 rounded-full dark:shadow dark:shadow-neutral-800 hover:bg-primarydark hover:text-gray-300"
                >
                  {project.status.toLowerCase() === "just created"
                    ? "Start project"
                    : project.status.toLowerCase() === "in progress"
                    ? "Mark completed"
                    : "Resume project"}
                </button>
              )}
            </div>
            <Feed id={id} members={members} project={project} />
            <ChatBox session={session} isLeader={isLeader} project={project} id={id} members={members} />
          </div>
        </main>
      )}
      <Toaster />
    </div>
  );
};

export default ProjectView;
