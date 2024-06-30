"use client";

import { FaGithubAlt } from "react-icons/fa6";
import Link from "next/link";
import generateRandomString from "@/utils/generateRandomString";

const GithubModal = () => {
  return (
    <div className="bg-backgrounddark backdrop-blur bg-opacity-50 h-screen w-screen fixed z-50">
      <div className="max-sm:w-full sm:w-80 flex flex-col gap-4 items-center dark:border dark:border-gray-400 fixed bg-gray-200 dark:bg-neutral-900 rounded p-4 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <h3 className="font-semibold text-center">Please connect to GitHub to continue</h3>
        <Link
          target="_blank"
          href={{
            pathname: "https://github.com/login/oauth/authorize",
            query: {
              client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
              state: generateRandomString(),
              redirect_uri: `${window.location.origin}/account-settings?github_oauth=true`,
              allow_signup: true,
            },
          }}
          className="bg-neutral-800 px-3 py-1 rounded-full text-white flex items-center gap-2 hover:bg-neutral-700 text-sm"
        >
          <FaGithubAlt />
          <p>Connect to GitHub</p>
        </Link>
      </div>
    </div>
  );
};

export default GithubModal;
