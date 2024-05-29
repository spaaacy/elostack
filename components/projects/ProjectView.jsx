"use client";

import { useParams, useRouter } from "next/navigation";
import NavBar from "../common/NavBar";
import Footer from "../common/Footer";
import Link from "next/link";
import { IoMdArrowBack } from "react-icons/io";
import { FaGithub } from "react-icons/fa";
import { formatDuration } from "@/utils/formatDuration";
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "@/context/UserContext";
import Loader from "../common/Loader";
import toast, { Toaster } from "react-hot-toast";
import SettingsDropdown from "./SettingsDropdown";
import { useForm } from "react-hook-form";
import { formatTime } from "@/utils/formatTime";

const ProjectView = () => {
  const { id } = useParams();
  const { session } = useContext(UserContext);
  const [project, setProject] = useState();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState();
  const [chat, setChat] = useState();

  const [dataLoaded, setDataLoaded] = useState(false);
  const router = useRouter();
  const [isLeader, setIsLeader] = useState(false);

  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    const loadData = async () => {
      await fetchProject();
      await fetchMembers();
      await fetchChat();
      setDataLoaded(true);
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
        if (project.leader === session.data.session.user.id) setIsLeader(true);
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
        let access = false;
        const userId = session.data.session?.user.id;
        for (const member of members) {
          if (member.user_id === userId) access = true;
        }
        if (!access) {
          router.push("/projects");
        } else setLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchChat = async () => {
    try {
      const response = await fetch(`/api/chat/${id}/`, {
        method: "GET",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
      });
      if (response.status === 200) {
        const { chat } = await response.json();
        setChat(chat);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async (data, e) => {
    e.preventDefault();
    setValue("message", "");
    if (!session.data.session) return;
    try {
      const newMessage = {
        message: data.message,
        user_id: session.data.session.user.id,
        project_id: project.id,
      };
      const response = await fetch("/api/chat/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify(newMessage),
      });
      if (response.status === 201) {
        setChat([...chat, newMessage]);
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
    <div className="flex flex-col h-screen overflow-y-auto">
      <NavBar />
      {loading ? (
        <Loader />
      ) : (
        <main className="">
          <div className="flex justify-start items-end relative">
            <Link href={"/projects"}>
              <IoMdArrowBack className="text-3xl hover:text-gray-300" />
            </Link>
            <h1 className="ml-4 font-bold text-2xl">{project.title}</h1>
            {project.github && (
              <Link href={project.github} target="_blank">
                <FaGithub className="ml-4 text-3xl hover:text-gray-300" />
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
          <p className="ml-12 font-light ">{project.status}</p>
          <hr className="border-0 h-[1px] bg-gray-400 my-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 ">
            <div>
              <div className="p-2 rounded border bg-gray-900 bg-opacity-50 border-gray-400 flex flex-col font-light text-sm ">
                <p>
                  <span className="font-semibold ">Description</span>
                  <br />
                  {project.description}
                </p>
                <p className="mt-4 font-semibold">Members</p>
                <ul>
                  <p href={"/"} className=" ">{`${
                    members.find((m) => m.user.user_id === project.leader).user.username
                  } (Leader)`}</p>
                  {members
                    .filter((member) => member.user_id !== project.leader && !member.removed)
                    .map((member, i) => {
                      return (
                        <li key={i}>
                          <p className=" ">{member.user.username}</p>
                        </li>
                      );
                    })}
                </ul>
                <p className="mt-4 font-semibold">Technologies</p>
                <p>{project.technologies}</p>
                <p className="text-orangeaccent mt-4">
                  {`Duration: ${formatDuration(project.duration_length, project.duration_type)}`}
                </p>
              </div>
            </div>
            <div className="sm:ml-4 max-sm:mt-4 sm:col-span-2 lg:col-span-4 ">
              <div
                id="scrollableDiv"
                className="h-[600px] p-4 rounded border bg-gray-900 bg-opacity-50 border-gray-400 flex flex-col items-start justify-start overflow-y-auto"
              >
                {chat &&
                  chat.map((message, i) => {
                    return (
                      <div
                        key={i}
                        className={`px-3 py-2 rounded-lg bg-gray-700 bg-opacity-50 mb-4 text-sm ${
                          message.user_id === session.data.session.user.id ? "self-end text-right" : ""
                        }`}
                      >
                        <p key={i}>
                          <span className="font-semibold">
                            {members.find((m) => m.user_id === message.user_id).user.username}
                          </span>
                          <br />
                          {message.message}
                          <br />
                          <span className="text-xs font-extralight">{formatTime(message.created_at)}</span>
                        </p>
                      </div>
                    );
                  })}
              </div>
              <form onSubmit={handleSubmit(sendMessage)} className="flex items-center gap-2 justify-center mt-2">
                <input
                  {...register("message", { required: "Message cannot be empty" })}
                  type="text"
                  placeholder="Send a message..."
                  className="w-full text-sm p-2 rounded border bg-gray-900 bg-opacity-50 focus:bg-gray-800 border-gray-400"
                />
                <button type="submit" className="rounded-full px-3 py-2 bg-orangeaccent text-sm hover:bg-orangedark">
                  Send
                </button>
              </form>
            </div>
          </div>
        </main>
      )}
      <Footer />
      <Toaster />
    </div>
  );
};

export default ProjectView;

const LeaderModal = ({ setShowModal, changeLeader, members, leader }) => {
  const handleModalClose = (e) => {
    if (e.target === e.currentTarget) {
      setShowModal(false);
    }
  };

  return (
    <div onClick={handleModalClose} className="bg-gray-900 bg-opacity-50 h-screen w-screen fixed">
      <div
        id="scrollableDiv"
        className="flex flex-col items-start justify-start fixed bg-gray-900 rounded p-4 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 overflow-y-auto"
      >
        {members
          .filter((m) => m.user_id !== leader)
          .map((m, i) => {
            return (
              <button
                onClick={() => changeLeader(m.user_id)}
                type="button"
                className="hover:bg-gray-800 px-2 py-1 rounded w-full text-left"
                key={i}
              >
                {m.user.username}
              </button>
            );
          })}
      </div>
    </div>
  );
};
