"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/utils/supabase";
import { FaBell } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { UserContext } from "@/context/UserContext";

const NotificationBell = () => {
  const { session } = useContext(UserContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const notificationsRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    const loadData = async () => {
      setDataLoaded(true);
      await fetchNotifications();
      listenToNotifications();
    };

    if (session && window.location.pathname !== "/signup" && window.location.pathname !== "/signin") {
      if (session.data.session) {
        if (!dataLoaded) loadData();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [session, notificationsRef]);

  const fetchNotifications = async () => {
    const userId = session.data.session.user.id;
    if (!userId) return;
    try {
      const response = await fetch(`/api/notification/${userId}`, {
        method: "GET",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
      });
      if (response.status === 200) {
        const { notifications } = await response.json();
        const reversed = notifications.reverse();
        setNotifications(reversed);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotificationClick = async (notification, redirect) => {
    if (!session?.data.session) return;
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      const response = await fetch("/api/notification/delete", {
        method: "DELETE",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({ notificationId: notification.id }),
      });
      if (response.status !== 200) {
        const { error } = await response.json();
        throw error;
      } else if (redirect === true) {
        if (notification.payload.accepted !== false) router.push(`/projects/${notification.project_id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const listenToNotifications = async () => {
    if (!session.data.session) return;
    try {
      const auth = await supabase.auth.setSession({
        access_token: session.data.session.access_token,
        refresh_token: session.data.session.refresh_token,
      });
      if (auth.error) throw auth.error;

      supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notification",
            filter: `user_id=eq.${session.data.session.user.id}`,
          },
          (payload) => {
            setNotifications((prevNotification) => [payload.new, ...prevNotification]);
          }
        )
        .subscribe();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="self-center relative mr-4 lg:mr-8">
      <button
        disabled={showNotifications}
        type="button"
        className="flex items-center "
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <FaBell />
        {notifications?.length > 0 && (
          <div className="w-[6px] h-[6px] bg-red-500 absolute top-0 right-0 rounded-full" />
        )}
      </button>
      {showNotifications && (
        <div
          ref={notificationsRef}
          className="absolute top-8 right-0 bg-gray-300 rounded border border-gray-400 py-2 text-xs z-50 w-56  dark:bg-backgrounddark dark:text-gray-300"
        >
          {console.log(notifications)}
          {notifications?.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className="flex justify-between items-center hover:bg-gray-200 dark:hover:bg-neutral-800 w-full py-2 px-2 relative"
              >
                <button type="button" className={"text-left"} onClick={() => handleNotificationClick(n, true)}>
                  {n.payload.type === "chat"
                    ? `New messages in ${n.payload.projectTitle}`
                    : n.payload.type === "request-response" && n.payload.accepted === true
                    ? `${
                        n.payload.userId === session.data.session.user.id
                          ? `You request was accepted into ${n.payload.projectTitle}`
                          : `A new member has joined ${n.payload.projectTitle}`
                      }`
                    : n.payload.type === "request-response" &&
                      n.payload.accepted === false &&
                      n.payload.userId === session.data.session.user.id
                    ? `Your request into ${n.payload.projectTitle} was rejected`
                    : n.payload.type === "request-created"
                    ? `You have a new request to join ${n.payload.projectTitle}`
                    : n.payload.type === "member-remove"
                    ? `You were removed from ${n.payload.projectTitle}`
                    : n.payload.type === "member-ban"
                    ? `You were banned from ${n.payload.projectTitle}`
                    : n.payload.type === "like" && n.payload.projectTitle
                    ? `Your post in ${n.payload.projectTitle} received a like!`
                    : n.payload.type === "like" && !n.payload.projectTitle
                    ? "Your post in received a like!"
                    : ""}
                </button>
                <button type="button" onClick={() => handleNotificationClick(n, false)}>
                  <FaXmark className="text-base" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-center">You have no new notifications</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
