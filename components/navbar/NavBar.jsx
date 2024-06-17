"use client";

import Image from "next/image";
import Link from "next/link";
import { Kanit } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/UserContext";
import { supabase } from "@/utils/supabase";
import { IoMenu } from "react-icons/io5";
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { useTheme } from "next-themes";
const kanit = Kanit({ subsets: ["latin"], weight: "600" });
import NotificationBell from "./NotificationBell";
import UserNav from "./UserNav";

const NavBar = () => {
  const { session } = useContext(UserContext);
  const router = useRouter();
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  const { systemTheme, theme, setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState();
  const pathname = usePathname();
  const showSignIn = pathname !== "/signin" && pathname !== "/signup";
  const isHomePage = pathname === "/";
  const [notifications, setNotifications] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    setCurrentTheme(theme === "system" ? systemTheme : theme);

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
  }, [session]);

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

  const toggleTheme = (theme) => {
    setCurrentTheme(theme);
    setTheme(theme);
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
            setNotifications((prevNotifications) => [payload.new, ...prevNotifications]);
          }
        )
        .subscribe();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <nav
      className={`${
        isHomePage && !session?.data.session
          ? "text-white"
          : "sticky top-0 bg-backgroundlight  dark:bg-backgrounddark border-b border-b-1 border-gray-400 drop-shadow z-50"
      } h-[67px] `}
    >
      <div
        className={`px-8 lg:px-16 py-2 flex items-center justify-start ${
          isHomePage && !session?.data.session ? "max-lg:bg-black" : ""
        }`}
      >
        <Link href={"/"} className={`${kanit.className} flex justify-center items-center text-2xl flex-shrink-0`}>
          {currentTheme && (
            <Image
              src={(isHomePage && !session?.data.session) || currentTheme === "dark" ? "/logo.png" : "/logo_black.png"}
              alt={"logo"}
              width={50}
              height={50}
            />
          )}
          <span className="max-lg:hidden">EloStack</span>
        </Link>
        <DesktopNav
          isHomePage={isHomePage}
          notifications={notifications}
          setNotifications={setNotifications}
          showSignIn={showSignIn}
          session={session}
          currentTheme={currentTheme}
          toggleTheme={toggleTheme}
          signOut={signOut}
        />
        <MobileNav
          notifications={notifications}
          setNotifications={setNotifications}
          setShowMobileDropdown={setShowMobileDropdown}
          showMobileDropdown={showMobileDropdown}
          currentTheme={currentTheme}
          toggleTheme={toggleTheme}
          session={session}
        />
      </div>
      {showMobileDropdown && (
        <MobileDropdown isHomePage={isHomePage} showSignIn={showSignIn} session={session} signOut={signOut} />
      )}
    </nav>
  );
};

const DesktopNav = ({
  isHomePage,
  notifications,
  setNotifications,
  showSignIn,
  session,
  currentTheme,
  toggleTheme,
  signOut,
}) => {
  return (
    <div className="ml-12 flex justify-start items-center gap-4 max-lg:hidden w-full">
      {!session?.data.session && (
        <Link
          href={"/feed"}
          className={`p-2  border-b-2 border-transparent  ${
            isHomePage && !session?.data.session
              ? " hover:text-gray-300"
              : "hover:text-gray-500 dark:hover:text-gray-300"
          }`}
        >
          Feed
        </Link>
      )}
      <Link
        href={"/projects"}
        className={`p-2  border-b-2 border-transparent  ${
          isHomePage && !session?.data.session ? " hover:text-gray-300" : "hover:text-gray-500 dark:hover:text-gray-300"
        }`}
      >
        Find Projects
      </Link>
      <Link
        href={"/create-project"}
        className={`p-2  border-b-2 border-transparent  ${
          isHomePage && !session?.data.session ? " hover:text-gray-300" : "hover:text-gray-500 dark:hover:text-gray-300"
        }`}
      >
        Create Project
      </Link>
      {session?.data.session && (
        <Link
          href={"/my-projects"}
          className={`p-2 border-b-2 border-transparent  ${
            isHomePage && !session?.data.session
              ? " hover:text-gray-300"
              : "hover:text-gray-500 dark:hover:text-gray-300"
          }`}
        >
          My Projects
        </Link>
      )}
      <Link
        target="_blank"
        href={"https://discord.gg/PPbGuu3u43"}
        className={`p-2 border-b-2 border-transparent  ${
          isHomePage && !session?.data.session ? " hover:text-gray-300" : "hover:text-gray-500 dark:hover:text-gray-300"
        }`}
      >
        Discord
      </Link>

      <div className="flex justify-center items-center ml-auto relative">
        {session?.data.session && (
          <NotificationBell notifications={notifications} setNotifications={setNotifications} />
        )}
        {currentTheme && (
          <button
            type="button"
            onClick={() => (currentTheme == "dark" ? toggleTheme("light") : toggleTheme("dark"))}
            className="mr-8 self-center text-xl"
          >
            {currentTheme === "light" ? <MdDarkMode /> : <MdLightMode />}
          </button>
        )}
        {showSignIn &&
          (session?.data.session ? (
            <UserNav signOut={signOut} />
          ) : (
            <Link
              href={"/signin"}
              className={`${
                isHomePage && !session?.data.session
                  ? "hover:bg-neutral-600 "
                  : "hover:bg-gray-300 dark:hover:bg-neutral-600 "
              } ml-4  px-3 py-1 rounded-full text-sm`}
            >
              Sign In
            </Link>
          ))}
      </div>
    </div>
  );
};

const MobileNav = ({
  notifications,
  setNotifications,
  setShowMobileDropdown,
  showMobileDropdown,
  currentTheme,
  toggleTheme,
  session,
}) => {
  return (
    <div className="flex items-center gap-2 ml-auto lg:hidden">
      {currentTheme && (
        <button
          type="button"
          onClick={() => (currentTheme == "dark" ? toggleTheme("light") : toggleTheme("dark"))}
          className="mr-4 self-center text-xl"
        >
          {currentTheme === "light" ? <MdDarkMode /> : <MdLightMode />}
        </button>
      )}
      {session?.data.session && <NotificationBell notifications={notifications} setNotifications={setNotifications} />}
      <button type="button" onClick={() => setShowMobileDropdown(!showMobileDropdown)}>
        <IoMenu className="text-2xl" />
      </button>
    </div>
  );
};

const MobileDropdown = ({ isHomePage, showSignIn, session, signOut }) => {
  return (
    <div
      className={`${
        isHomePage && !session?.data.session ? "bg-black" : "bg-backgroundlight dark:bg-backgrounddark"
      } flex flex-col justify-center items-center lg:hidden py-2`}
    >
      {!session?.data.session && (
        <Link href={"/feed"} className="p-2 hover:bg-gray-300 dark:hover:bg-neutral-600 w-full text-center">
          Feed
        </Link>
      )}
      <Link href={"/projects"} className="p-2 hover:bg-gray-300 dark:hover:bg-neutral-600 w-full text-center">
        Find Projects
      </Link>
      <Link href={"/create-project"} className="p-2 hover:bg-gray-300 dark:hover:bg-neutral-600 w-full text-center">
        Create Project
      </Link>
      {session?.data.session && (
        <Link href={"/my-projects"} className="p-2 hover:bg-gray-300 dark:hover:bg-neutral-600 w-full text-center">
          My Projects
        </Link>
      )}
      <Link
        target="_blank"
        href={"https://discord.gg/PPbGuu3u43"}
        className="p-2 hover:bg-gray-300 dark:hover:bg-neutral-600 w-full text-center"
      >
        Discord
      </Link>
      <hr className="border-0 h-[1px] bg-gray-400 my-2 w-full" />
      {session?.data.session && (
        <Link href={"/account-settings"} className="p-2 hover:bg-gray-300 dark:hover:bg-neutral-600 w-full text-center">
          My Account
        </Link>
      )}
      {showSignIn && (
        <div className="p-2 hover:bg-gray-300 dark:hover:bg-neutral-600 w-full text-center">
          {session?.data.session ? <button onClick={signOut}>Log out</button> : <Link href={"/signin"}>Sign In</Link>}
        </div>
      )}
    </div>
  );
};

export default NavBar;
