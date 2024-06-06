"use client";

import Image from "next/image";
import Link from "next/link";
import { Kanit } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "@/context/UserContext";
import { supabase } from "@/utils/supabase";
import { IoMenu } from "react-icons/io5";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { useTheme } from "next-themes";
import { FaBell } from "react-icons/fa";
const kanit = Kanit({ subsets: ["latin"], weight: "600" });
import { FaXmark } from "react-icons/fa6";

const NavBar = () => {
  const { session } = useContext(UserContext);
  const router = useRouter();
  const [user, setUser] = useState();
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  const { systemTheme, theme, setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState();
  const [dataLoaded, setDataLoaded] = useState(false);
  const notificationsRef = useRef();

  useEffect(() => {
    setCurrentTheme(theme === "system" ? systemTheme : theme);

    const loadData = async () => {
      setDataLoaded(true);
      fetchUser();
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
  }, [session]);

  const handleClickOutside = (event) => {
    if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
      setShowNotifications(false);
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

  const fetchUser = async () => {
    const userId = session.data.session?.user.id;
    if (userId) {
      const response = await fetch(`/api/user/${userId}`, {
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        method: "GET",
      });
      if (response.status === 200) {
        const { user } = await response.json();
        setUser(user);
      } else {
        router.push("/signup?google_oauth=true");
      }
    }
  };

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

  const toggleTheme = (theme) => {
    setCurrentTheme(theme);
    setTheme(theme);
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      location.reload();
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };

  const pathname = usePathname();
  const showSignIn = pathname !== "/signin" && pathname !== "/signup";
  const isHomePage = pathname === "/";

  return (
    <nav className={"min-h-16"}>
      <div className={`px-8 lg:px-16 py-2 flex items-center justify-start ${isHomePage ? "max-lg:bg-black" : ""}`}>
        <Link href={"/"} className={`${kanit.className} flex justify-center items-center text-2xl flex-shrink-0`}>
          {currentTheme && (
            <Image src={isHomePage ? "/logo.png" : "/logo_black.png"} alt={"logo"} width={50} height={50} />
          )}
          <span className="max-lg:hidden">EloStack</span>
        </Link>
        <DesktopNav
          notifications={notifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          notificationsRef={notificationsRef}
          handleNotificationClick={handleNotificationClick}
          showSignIn={showSignIn}
          signOut={signOut}
          session={session}
          user={user}
          currentTheme={currentTheme}
          toggleTheme={toggleTheme}
          isHomePage={isHomePage}
          router={router}
        />
        <MobileNav
          isHomePage={isHomePage}
          currentTheme={currentTheme}
          setShowMobileDropdown={setShowMobileDropdown}
          showMobileDropdown={showMobileDropdown}
          toggleTheme={toggleTheme}
          notifications={notifications}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          notificationsRef={notificationsRef}
          handleNotificationClick={handleNotificationClick}
          session={session}
        />
      </div>
      {showMobileDropdown && (
        <MobileDropdown isHomePage={isHomePage} showSignIn={showSignIn} signOut={signOut} session={session} />
      )}
    </nav>
  );
};

export default NavBar;

const DesktopNav = ({
  showSignIn,
  signOut,
  session,
  user,
  currentTheme,
  toggleTheme,
  router,
  isHomePage,
  showNotifications,
  setShowNotifications,
  notifications,
  notificationsRef,
  handleNotificationClick,
}) => {
  return (
    <div className="ml-12 flex justify-start items-center gap-4 max-lg:hidden w-full">
      <Link
        href={"/projects"}
        className="p-2 border-b-2 border-transparent hover:text-gray-500 hover:border-b-gray-500 dark:hover:border-b-gray-300 dark:hover:text-gray-300"
      >
        Projects
      </Link>
      <Link
        href={"/create-project"}
        className="p-2 border-b-2 border-transparent hover:text-gray-500 hover:border-b-gray-500 dark:hover:border-b-gray-300 dark:hover:text-gray-300"
      >
        Create Project
      </Link>
      {session?.data.session && (
        <Link
          href={"/my-projects"}
          className="p-2 border-b-2 border-transparent hover:text-gray-500 hover:border-b-gray-500 dark:hover:border-b-gray-300 dark:hover:text-gray-300"
        >
          My Projects
        </Link>
      )}
      <Link
        target="_blank"
        href={"https://discord.gg/PPbGuu3u43"}
        className="p-2 border-b-2 border-transparent hover:text-gray-500 hover:border-b-gray-500 dark:hover:border-b-gray-300 dark:hover:text-gray-300"
      >
        Community
      </Link>

      <div className="flex justify-center items-baseline ml-auto">
        <NotificationBell
          session={session}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          notificationsRef={notificationsRef}
          notifications={notifications}
          handleNotificationClick={handleNotificationClick}
        />
        {/* {!isHomePage && currentTheme && (
          <button
            type="button"
            onClick={() => (currentTheme == "dark" ? toggleTheme("light") : toggleTheme("dark"))}
            className="mr-4 self-center text-xl"
          >
            {currentTheme === "light" ? <MdDarkMode /> : <MdLightMode />}
          </button>
        )} */}
        {!isHomePage && user && <p className="italic text-sm text-gray-600 dark:text-gray-300">{`${user.username}`}</p>}
        {showSignIn && (
          <div
            className="ml-4 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-1 rounded-full 
          text-sm"
          >
            {session?.data.session ? <button onClick={signOut}>Log out</button> : <Link href={"/signin"}>Sign In</Link>}
          </div>
        )}
      </div>
    </div>
  );
};

const MobileNav = ({
  setShowMobileDropdown,
  showMobileDropdown,
  currentTheme,
  toggleTheme,
  isHomePage,
  showNotifications,
  setShowNotifications,
  notifications,
  notificationsRef,
  handleNotificationClick,
  session,
}) => {
  return (
    <div className="flex items-center gap-2 ml-auto lg:hidden">
      {/* {!isHomePage && currentTheme && (
        <button
          type="button"
          onClick={() => (currentTheme == "dark" ? toggleTheme("light") : toggleTheme("dark"))}
          className="mr-4 self-center text-xl"
        >
          {currentTheme === "light" ? <MdDarkMode /> : <MdLightMode />}
        </button>
      )} */}

      <NotificationBell
        session={session}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        notificationsRef={notificationsRef}
        notifications={notifications}
        handleNotificationClick={handleNotificationClick}
      />
      <button type="button" onClick={() => setShowMobileDropdown(!showMobileDropdown)}>
        <IoMenu className="text-2xl" />
      </button>
    </div>
  );
};

const MobileDropdown = ({ showSignIn, signOut, session, isHomePage }) => {
  return (
    <div className={`${isHomePage ? "bg-black" : ""} flex flex-col justify-center items-center lg:hidden`}>
      <Link href={"/projects"} className="p-2 hover:bg-gray-300 dark:hover:bg-gray-600 w-full text-center">
        Projects
      </Link>
      <Link href={"/create-project"} className="p-2 hover:bg-gray-300 dark:hover:bg-gray-600 w-full text-center">
        Create Project
      </Link>
      {session?.data.session && (
        <Link href={"/my-projects"} className="p-2 hover:bg-gray-300 dark:hover:bg-gray-600 w-full text-center">
          My Projects
        </Link>
      )}
      <Link
        target="_blank"
        href={"https://discord.gg/PPbGuu3u43"}
        className="p-2 hover:bg-gray-300 dark:hover:bg-gray-600 w-full text-center"
      >
        Community
      </Link>
      <hr className="border-0 h-[1px] bg-gray-400 my-2 w-full" />
      {showSignIn && (
        <div className="p-2 hover:bg-gray-300 dark:hover:bg-gray-600 w-full text-center">
          {session?.data.session ? <button onClick={signOut}>Log out</button> : <Link href={"/signin"}>Sign In</Link>}
        </div>
      )}
    </div>
  );
};

const NotificationBell = ({
  showNotifications,
  setShowNotifications,
  notificationsRef,
  notifications,
  handleNotificationClick,
  session,
}) => {
  return (
    <div className="self-center relative mr-8">
      <button type="button" className="flex items-center " onClick={() => setShowNotifications(!showNotifications)}>
        <FaBell />
        {notifications?.length > 0 && (
          <div className="w-[6px] h-[6px] bg-red-500 absolute top-0 right-0 rounded-full" />
        )}
      </button>
      {showNotifications && (
        <div
          ref={notificationsRef}
          className="absolute top-8 right-0 bg-gray-300 rounded border border-gray-400 py-2 text-xs z-50 w-56 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          {notifications?.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                className="flex justify-between items-center hover:bg-gray-200 dark:hover:bg-gray-800 w-full py-2 px-2 relative"
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
