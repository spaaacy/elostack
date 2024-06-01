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
import { supabase } from "@/utils/supabase";

const ProjectView = () => {
  const { id } = useParams();
  const { session } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState();
  const [members, setMembers] = useState();
  const [chat, setChat] = useState();
  const [requests, setReqests] = useState();

  const [nextMessagePage, setNextMessagePage] = useState(1);
  const [loadMoreMessages, setLoadMoreMessages] = useState(false);
  const [showLoadMoreMessages, setShowLoadMoreMessages] = useState(false);
  const [showRequests, setShowRequests] = useState(false);

  const [dataLoaded, setDataLoaded] = useState(false);
  const router = useRouter();
  const [isLeader, setIsLeader] = useState(false);

  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    const loadData = async () => {
      setDataLoaded(true);
      await fetchProject();
      await fetchMembers();
      await fetchChat();
      await listenToMessages();
    };

    if (session) {
      if (session.data.session) {
        if (!dataLoaded) loadData();
      } else {
        router.push("/signin");
      }
    }

    // Scrolls the chat to the bottom
    if (chat && !loadMoreMessages) {
      var chatDiv = document.getElementById("scrollableDiv");
      if (chatDiv) chatDiv.scrollTop = chatDiv.scrollHeight;
    }
  }, [session, chat]);

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
          fetchRequests();
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

  const fetchChat = async () => {
    try {
      const response = await fetch(`/api/chat/`, {
        method: "POST",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          projectId: id,
          pageNumber: nextMessagePage,
        }),
      });
      if (response.status === 200) {
        setNextMessagePage(nextMessagePage + 1);
        const { chat } = await response.json();
        const chatReversed = chat.reverse();
        if (chatReversed.length < 15) setShowLoadMoreMessages(false);

        if (nextMessagePage > 1) {
          console.log(chatReversed.length);
          if (chatReversed.length === 0) {
            setShowLoadMoreMessages(false);
          } else {
            setChat((prevChat) => [...chatReversed, ...prevChat]);
          }
        } else {
          setChat(chatReversed);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/request/${id}`, {
        method: "GET",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
      });

      if (response.status === 200) {
        const { requests } = await response.json();
        setReqests(requests);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const respondToRequest = async (status, request) => {
    if (!session.data.session) return;
    try {
      let response;
      if (status === "accept") {
        response = await fetch("/api/request/accept-request", {
          method: "PATCH",
          headers: {
            "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
          },
          body: JSON.stringify({
            requestId: request.id,
            userId: request.user_id,
            projectId: project.id,
          }),
        });
      } else if (status === "reject") {
        response = await fetch("/api/request/reject-request", {
          method: "PATCH",
          headers: {
            "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
          },
          body: JSON.stringify({
            requestId: request.id,
          }),
        });
      }
      if (response.status === 200) {
        setReqests(requests.filter((r) => r.id !== request.id));
        if (status === "accept") window.location.reload();
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
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

  const sendMessage = async (data, e) => {
    e.preventDefault();
    setValue("message", "");
    if (!session.data.session) return;
    try {
      const newMessage = {
        message: data.message.trim(),
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
        setLoadMoreMessages(false);
        setChat([...chat, { ...newMessage, created_at: new Date().toISOString() }]);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
    }
  };

  const listenToMessages = async () => {
    if (!session.data.session) return;
    const auth = await supabase.auth.setSession({
      access_token: session.data.session.access_token,
      refresh_token: session.data.session.refresh_token,
    });
    if (auth.error) throw auth.error;

    supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat",
          filter: `user_id=neq.${session.data.session.user.id}`,
        },
        (payload) => {
          setLoadMoreMessages(false);
          setChat((prevChat) => [...prevChat, payload.new]);
        }
      )
      .subscribe();
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
              <div className="p-2 rounded dark:border bg-gray-300 dark:bg-gray-900  dark:border-gray-400 flex flex-col font-light text-sm ">
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
                    .filter((member) => member.user_id !== project.leader && !member.banned)
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
                  className="text-gray-200 bg-primary text-xs px-2 py-1 mt-2 rounded-full dark:shadow dark:shadow-gray-800 hover:bg-primarydark hover:text-gray-300"
                >
                  {project.status.toLowerCase() === "just created"
                    ? "Start project"
                    : project.status.toLowerCase() === "in progress"
                    ? "Mark completed"
                    : "Resume project"}
                </button>
              )}
            </div>
            <div className="sm:ml-4 max-sm:mt-4 sm:col-span-2 lg:col-span-4 ">
              {isLeader && (
                <div className="flex items-center w-full text-sm gap-2 mb-2">
                  <button
                    disabled={!showRequests}
                    type="button"
                    onClick={() => setShowRequests(false)}
                    className={`${
                      showRequests
                        ? "bg-gray-300 dark:bg-gray-900 hover:bg-gray-400 dark:hover:bg-gray-800"
                        : "bg-primary hover:bg-primarydark text-gray-200"
                    }  flex-1 rounded  p-1`}
                  >
                    Chat
                  </button>
                  <button
                    type="button"
                    disabled={showRequests}
                    onClick={() => setShowRequests(true)}
                    className={`${
                      showRequests
                        ? "bg-primary text-gray-200 hover:bg-primarydark "
                        : "bg-gray-300 dark:bg-gray-900  hover:bg-gray-400 dark:hover:bg-gray-800"
                    }  flex-1 rounded p-1`}
                  >
                    Requests
                  </button>
                </div>
              )}
              <div
                id="scrollableDiv"
                className="h-[550px] p-4 rounded dark:border bg-gray-300 dark:bg-gray-900  dark:border-gray-400 flex flex-col items-start justify-start overflow-y-auto"
              >
                {showRequests ? (
                  <>
                    {requests &&
                      requests
                        .filter((r) => !r.accepted && !r.rejected)
                        .map((r, i) => {
                          return (
                            <div key={i} className={"px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700  mb-4 text-sm"}>
                              <p key={i}>
                                <span className="font-semibold">{r.user.username}</span>
                                <br />
                                {r.message}
                                <br />
                                <span className="text-xs font-extralight">{formatTime(r.created_at)}</span>
                              </p>
                              <div className="text-xs flex items-center justify-start gap-2 mt-1">
                                <button className="hover:underline" onClick={() => respondToRequest("accept", r)}>
                                  Accept Request
                                </button>
                                <button className="hover:underline" onClick={() => respondToRequest("reject", r)}>
                                  Reject Request
                                </button>
                              </div>
                            </div>
                          );
                        })}
                  </>
                ) : (
                  <>
                    {showLoadMoreMessages && (
                      <button
                        onClick={() => {
                          setLoadMoreMessages(true);
                          fetchChat();
                        }}
                        className="text-sm mx-auto mb-8 text-gray-400 hover:underline"
                      >
                        Load more messages...
                      </button>
                    )}
                    {chat &&
                      chat.map((message, i) => {
                        return (
                          <div
                            key={i}
                            className={`px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700  mb-4 text-sm ${
                              message.user_id === session.data.session.user.id ? "self-end text-right" : ""
                            }`}
                          >
                            <p>
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
                  </>
                )}
              </div>
              {!showRequests && (
                <form onSubmit={handleSubmit(sendMessage)} className="flex items-center gap-2 justify-center mt-2">
                  <input
                    {...register("message", {
                      required: "Message cannot be empty",
                      validate: (value, formValues) => {
                        const trimmed = value.trim();
                        const valid = trimmed.length > 0;
                        if (!valid) setValue("message", "");
                        return valid;
                      },
                    })}
                    type="text"
                    placeholder="Send a message..."
                    className="w-full focus:ring-0 focus:outline-none min-w-0 text-sm p-2 rounded border bg-gray-300 dark:bg-gray-900 focus:bg-gray-300 dark:focus:bg-gray-800 dark:border-gray-400"
                  />
                  <button
                    type="submit"
                    className="text-gray-200 rounded-lg px-3 py-2 bg-primary text-sm hover:bg-primarydark"
                  >
                    Send
                  </button>
                </form>
              )}
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
