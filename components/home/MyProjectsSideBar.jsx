"use client";

import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MyProjectsSideBar = () => {
  const { projects } = useContext(UserContext);

  return (
    <div className="hidden xl:block fixed top-[83px] left-0 w-64 2xl:w-80 rounded-r-lg py-3 bg-white dark:bg-backgrounddark drop-shadow-xl dark:border-r dark:border-y dark:border-gray-400">
      <p className=" pl-3 font-medium">My Projects</p>
      <hr className="h-[0.5px] my-2 bg-gray-400 scale-y-50" />
      {projects?.length > 0 ? (
        <ul className="flex flex-col gap-2 items-start text-sm mx-3 ">
          {projects.map((p, i) => (
            <Link
              key={i}
              className="w-full block truncate pr-2  px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:border dark:border-gray-400 dark:bg-backgrounddark font-light dark:hover:bg-neutral-800"
              href={`/projects/${p.id}`}
            >
              {p.title}
            </Link>
          ))}
        </ul>
      ) : (
        <Link
          href={"/projects"}
          className="text-sm hover:underline mx-3 dark:text-blue-400 dark:hover:text-blue-500 text-blue-600 hover:text-blue-700"
        >
          Join projects to get started
        </Link>
      )}
    </div>
  );
};

export default MyProjectsSideBar;
