"use client";

import { UserContext } from "@/context/UserContext";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useRef, useState } from "react";

const UserNav = ({ signOut }) => {
  const { profile } = useContext(UserContext);
  const buttonRef = useRef();
  const accountRef = useRef();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && buttonRef.current.contains(event.target)) {
        setShowAccountDropdown(true);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setShowAccountDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  return (
    <>
      <button className="rounded-full" ref={buttonRef}>
        {profile && (
          <Image
            src={profile.picture ? profile.picture : "/default_user.png"}
            alt="profile picture"
            className="object-cover rounded-full w-9 h-9"
            width={36}
            height={36}
          />
        )}
      </button>
      {showAccountDropdown && (
        <div
          ref={accountRef}
          className="absolute top-12 right-0 dark:bg-backgrounddark border border-gray-400 text-sm rounded-lg py-2 flex flex-col items-end w-28"
        >
          <Link
            href={"/account-settings"}
            className="w-full hover:dark:bg-neutral-800 hover:bg-gray-200 px-3 py-1 text-right "
          >
            Account
          </Link>
          <hr className="border-0 h-[1px] bg-gray-300 w-full dark:bg-neutral-600 my-1 rounded-full" />

          <button
            onClick={signOut}
            className="text-right w-full hover:dark:bg-neutral-800 hover:bg-gray-200 px-3 py-1 dark:text-red-400 text-red-500 dark:font-normal font-medium"
          >
            Sign Out
          </button>
        </div>
      )}
    </>
  );
};

export default UserNav;
