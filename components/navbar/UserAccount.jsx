"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const UserAccount = ({ signOut }) => {
  const accountRef = useRef();
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
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
      <button
        disabled={showAccountDropdown}
        onClick={() => setShowAccountDropdown(!showAccountDropdown)}
        className="rounded-full max- "
      >
        <Image
          src={"/sample.jpg"}
          alt="profile picture"
          className="object-cover rounded-full w-10 h-10"
          width={40}
          height={40}
        />
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

export default UserAccount;
