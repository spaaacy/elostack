"use client";

import { formatTime } from "@/utils/formatTime";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/utils/supabase";
import toast from "react-hot-toast";
import { UserContext } from "@/context/UserContext";

const ChatBox = ({ project, id }) => {
  const { session, user, profile } = useContext(UserContext);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [chat, setChat] = useState();
  const [requests, setReqests] = useState();
  const [nextMessagePage, setNextMessagePage] = useState(1);
  const [loadMoreMessages, setLoadMoreMessages] = useState(false);
  const [showLoadMoreMessages, setShowLoadMoreMessages] = useState(false);
  const [showChatBox, setShowChatBox] = useState(true);
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    const loadData = async () => {
      if (!dataLoaded) {
        setDataLoaded(true);
        await fetchChat();
        await listenToMessages();
        if (user.admin) await fetchRequests();
      }
    };

    if (session) loadData();

    // Scrolls the chat to the bottom
    if (chat && !loadMoreMessages) {
      var chatDiv = document.getElementById("scrollableDiv");
      if (chatDiv) chatDiv.scrollTop = chatDiv.scrollHeight;
    }

    const handleResize = () => {
      if (window.innerWidth < 1280) {
        // assuming 768px as the threshold for small screens
        setShowChatBox(false);
      } else {
        setShowChatBox(true);
      }
    };

    handleResize(); // Check screen size when component mounts
    window.addEventListener("resize", handleResize); // Update on window resize

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [session, chat]);

  const sendMessage = async (data, e) => {
    e.preventDefault();

    setValue("message", "");
    if (!session.data.session) return;
    const randomId = Math.floor(Math.random() * (100 + 1));
    const newMessage = {
      message: data.message.trim(),
      user_id: session.data.session.user.id,
      project_id: project.id,
    };
    setLoadMoreMessages(false);
    setChat([
      ...chat,
      { ...newMessage, created_at: new Date().toISOString(), id: randomId, username: profile.username },
    ]);

    try {
      const response = await fetch("/api/chat/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({ chat: newMessage, projectTitle: project.title }),
      });
      if (response.status !== 201) {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      setChat((prevChat) => prevChat.filter((m) => m.id !== randomId));
      toast.error("Oops, something went wrong...");
      console.error(error);
    }
  };

  const listenToMessages = async () => {
    if (!session.data.session) return;
    try {
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
            event: "INSERT",
            schema: "public",
            table: "chat",
            filter: `project_id=eq.${id}`,
          },
          (payload) => {
            if (payload.new.user_id !== session.data.session.user.id) {
              setLoadMoreMessages(false);
              setChat((prevChat) => [...prevChat, payload.new]);
            }
          }
        )
        .subscribe();
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
            member: { user_id: request.user_id, project_id: project.id },
            userId: session.data.session.user.id,
            projectTitle: project.title,
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
            userId: request.user_id,
            projectId: project.id,
            projectTitle: project.title,
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

  const fetchChat = async () => {
    try {
      setShowLoadMoreMessages(false);
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
        if (chatReversed.length === 15) {
          setShowLoadMoreMessages(true);
        } else {
          setShowLoadMoreMessages(false);
        }

        if (nextMessagePage > 1) {
          setChat((prevChat) => [...chatReversed, ...prevChat]);
        } else {
          setChat(chatReversed);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className={`fixed max-sm:left-1/2 max-sm:-translate-x-1/2 bottom-0 right-4 text-xs drop-shadow-xl  dark:bg-backgrounddark border-t border-x border-gray-300 dark:border-gray-400 bg-white rounded max-sm:w-[80%] w-72 ${
        showChatBox ? "max-sm:h-[85%] h-[480px] pb-2" : ""
      } flex flex-col`}
    >
      <div
        className="text-sm font-semibold dark:text-white text-black text-center hover:cursor-pointer rounded-t py-2"
        onClick={() => setShowChatBox(!showChatBox)}
      >
        Messages
      </div>
      {showChatBox && (
        <>
          <hr className="h-[0.5px] my-2 bg-gray-400 scale-y-50" />
          {user?.admin && (
            <div className="flex items-center w-full gap-2 mb-2 p-2">
              <button
                disabled={!showRequests}
                type="button"
                onClick={() => setShowRequests(false)}
                className={`${
                  showRequests
                    ? "bg-gray-300 dark:bg-backgrounddark hover:bg-gray-400 dark:hover:bg-neutral-800"
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
                    : "bg-gray-300 dark:bg-backgrounddark  hover:bg-gray-400 dark:hover:bg-neutral-800"
                }  flex-1 rounded p-1`}
              >
                Requests
              </button>
            </div>
          )}
          <div id="scrollableDiv" className=" p-2 rounded flex flex-col items-start justify-start overflow-y-auto">
            {showRequests ? (
              <>
                {requests &&
                  requests
                    .filter((r) => !r.accepted && !r.rejected)
                    .map((r, i) => {
                      return (
                        <div key={i} className={"px-3 py-2 rounded-lg bg-gray-100 dark:bg-backgrounddark   mb-4 "}>
                          <p key={i}>
                            {<span className="font-semibold">{r.profile.username}</span>}
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
                    className=" mx-auto mb-8 text-gray-400 hover:underline"
                  >
                    Load more messages...
                  </button>
                )}
                {chat &&
                  chat.map((message, i) => {
                    return (
                      <div
                        key={i}
                        className={`break-words w-full px-2 py-1 rounded-lg  mb-2  ${
                          message.user_id === session.data.session.user.id ? "self-end text-right" : ""
                        }`}
                      >
                        <p>
                          <span className="font-semibold">{message.username}</span>
                          <br />
                          {message.message}
                          <br />
                          <span className=" font-extralight">{formatTime(message.created_at)}</span>
                        </p>
                      </div>
                    );
                  })}
              </>
            )}
          </div>
          {!showRequests && (
            <form onSubmit={handleSubmit(sendMessage)} className="flex items-center gap-2 justify-center mt-auto px-2">
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
                className="w-full focus:ring-0 focus:outline-none min-w-0  p-2 rounded border bg-gray-300 dark:bg-backgrounddark focus:bg-gray-300 dark:focus:bg-neutral-800 dark:border-gray-400"
              />
              <button type="submit" className="text-gray-200 rounded-lg px-3 py-2 bg-primary  hover:bg-primarydark">
                Send
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default ChatBox;
