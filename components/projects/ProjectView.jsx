"use client";

import { useParams } from "next/navigation";
import NavBar from "../navbar/NavBar";
import { useContext, useState } from "react";
import { UserContext } from "@/context/UserContext";
import Loader from "../common/Loader";
import toast, { Toaster } from "react-hot-toast";
import SettingsDropdown from "./SettingsDropdown";
import ChatBox from "./ChatBox";
import Feed from "../feed/Feed";
import Image from "next/image";
import ProjectOverview from "./ProjectOverview";

const ProjectView = ({ project, members }) => {
  const { id } = useParams();
  const { session, user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [currentState, setCurrentState] = useState("overview");
  const [posts, setPosts] = useState();

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <NavBar />
      {loading ? (
        <Loader />
      ) : (
        <main>
          <div className="flex items-center gap-4 relative">
            {project.image_id && (
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_STORAGE_PATH}/project-image/${project.id}/${project.image_id}`}
                alt="project image"
                width={64}
                height={64}
                className="object-cover w-16 h-16 rounded-full"
              />
            )}
            <div className="flex flex-col justify-start items-start">
              <h1 className="font-bold text-2xl">{project.title}</h1>
              <p className="font-light ">{project.status}</p>
            </div>
            <SettingsDropdown project={project} members={members} setLoading={setLoading} />
          </div>
          <hr className="border-0 h-[1px] bg-gray-400 my-4" />
          <div className="flex gap-2 text-sm mb-4">
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
            {/* <button
              type="button"
              onClick={() => setCurrentState("requirements")}
              className={`${
                currentState === "requirements"
                  ? "bg-primary text-white"
                  : "bg-gray-200 dark:bg-backgrounddark hover:bg-gray-300 dark:hover:bg-neutral-800"
              } rounded dark:border px-2 py-1`}
            >
              Requirements
            </button> */}
          </div>
          {currentState === "overview" ? (
            <ProjectOverview user={user} members={members} project={project} setLoading={setLoading} />
          ) : (
            <Feed posts={posts} setPosts={setPosts} project={project} isMember={true} />
          )}
          <ChatBox session={session} project={project} id={id} members={members} />
        </main>
      )}
      <Toaster />
    </div>
  );
};

export default ProjectView;
