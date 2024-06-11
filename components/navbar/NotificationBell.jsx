"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/utils/supabase";
import { FaBell } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { UserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";

const NotificationBell = ({ notifications, setNotifications }) => {
  const { session } = useContext(UserContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef();
  const buttonRef = useRef();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && buttonRef.current.contains(event.target)) {
        setShowNotifications(true);
      }

      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationsRef]);

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
      } else if (redirect === true && notification.payload.projectId) {
        if (notification.payload?.accepted !== false) router.push(`/projects/${notification.payload.projectId}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="self-center relative mr-4 lg:mr-8">
      <button ref={buttonRef} type="button" className="flex items-center ">
        <FaBell />
        {notifications?.length > 0 && (
          <div className="w-[6px] h-[6px] bg-red-500 absolute top-0 right-0 rounded-full" />
        )}
      </button>
      {showNotifications && (
        <div
          ref={notificationsRef}
          id="scrollableDiv"
          className="overflow-y-auto max-h-96 absolute top-8 right-0 bg-gray-200 rounded border border-gray-400 py-2 text-xs z-50 w-56  dark:bg-backgrounddark dark:text-gray-300"
        >
          {notifications?.length > 0 ? (
            notifications.map((n, i) => (
              <div
                key={i}
                className="flex justify-between items-center hover:bg-gray-200 dark:hover:bg-neutral-800 w-full py-2 px-2 relative"
              >
                <button type="button" className={"text-left"} onClick={() => handleNotificationClick(n, true)}>
                  {n.type === "chat"
                    ? `New messages in ${n.payload?.projectTitle}`
                    : n.type === "request-response" && n.payload?.accepted === true
                    ? `${
                        n.payload?.userId === session.data.session.user.id
                          ? `You request was accepted into ${n.payload?.projectTitle}`
                          : `A new member has joined ${n.payload?.projectTitle}`
                      }`
                    : n.type === "request-response" &&
                      n.payload?.accepted === false &&
                      n.payload?.userId === session.data.session.user.id
                    ? `Your request into ${n.payload?.projectTitle} was rejected`
                    : n.type === "request-created"
                    ? `You have a new request to join ${n.payload?.projectTitle}`
                    : n.type === "member-remove"
                    ? `You were removed from ${n.payload?.projectTitle}`
                    : n.type === "member-ban"
                    ? `You were banned from ${n.payload?.projectTitle}`
                    : n.type === "like" && n.payload?.projectTitle
                    ? `Your post in ${n.payload?.projectTitle} received a like!`
                    : n.type === "like" && !n.payload?.projectTitle
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
