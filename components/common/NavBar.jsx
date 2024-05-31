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

const NavBar = () => {
  const { session } = useContext(UserContext);
  const router = useRouter();
  const [user, setUser] = useState();
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  const { systemTheme, theme, setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState();

  useEffect(() => {
    setCurrentTheme(theme === "system" ? systemTheme : theme);

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

    if (session && window.location.pathname !== "/signup") {
      fetchUser();
    }
  }, [session]);

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
            <Image
              src={currentTheme === "light" && !isHomePage ? "/logo_black.png" : "/logo.png"}
              alt={"logo"}
              width={50}
              height={50}
            />
          )}
          <span className="max-lg:hidden">EloStack</span>
        </Link>
        <DesktopNav
          showSignIn={showSignIn}
          signOut={signOut}
          session={session}
          user={user}
          currentTheme={currentTheme}
          toggleTheme={toggleTheme}
          isHomePage={isHomePage}
        />
        <MobileNav
          isHomePage={isHomePage}
          currentTheme={currentTheme}
          setShowMobileDropdown={setShowMobileDropdown}
          showMobileDropdown={showMobileDropdown}
          toggleTheme={toggleTheme}
        />
      </div>
      {showMobileDropdown && (
        <MobileDropdown isHomePage={isHomePage} showSignIn={showSignIn} signOut={signOut} session={session} />
      )}
    </nav>
  );
};

export default NavBar;

const DesktopNav = ({ showSignIn, signOut, session, user, currentTheme, toggleTheme, isHomePage }) => {
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
      <div className="flex justify-center items-baseline ml-auto">
        {!isHomePage && currentTheme && (
          <button
            type="button"
            onClick={() => (currentTheme == "dark" ? toggleTheme("light") : toggleTheme("dark"))}
            className="mr-4 self-center text-xl"
          >
            {currentTheme === "light" ? <MdDarkMode /> : <MdLightMode />}
          </button>
        )}
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

const MobileNav = ({ setShowMobileDropdown, showMobileDropdown, currentTheme, toggleTheme, isHomePage }) => {
  return (
    <div className="flex items-center gap-2 ml-auto lg:hidden">
      {!isHomePage && currentTheme && (
        <button
          type="button"
          onClick={() => (currentTheme == "dark" ? toggleTheme("light") : toggleTheme("dark"))}
          className="mr-4 self-center text-xl"
        >
          {currentTheme === "light" ? <MdDarkMode /> : <MdLightMode />}
        </button>
      )}
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
      <hr className="border-0 h-[1px] bg-gray-400 my-2 w-full" />
      {showSignIn && (
        <div className="p-2 hover:bg-gray-300 dark:hover:bg-gray-600 w-full text-center">
          {session?.data.session ? <button onClick={signOut}>Log out</button> : <Link href={"/signin"}>Sign In</Link>}
        </div>
      )}
    </div>
  );
};
