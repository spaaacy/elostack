import NavBar from "@/components/NavBar";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Page = () => {
  return (
    <>
      <NavBar />
      <main>
        <div className="flex flex-col w-1/5 mx-auto">
          <h1 className="text-lg mx-auto">Sign Up</h1>
          <form className="mt-4 px-8 py-6 rounded-lg bg-gray-700 bg-opacity-50 flex flex-col gap-2 border-gray-400 border-[1px]">
            <label className="text-sm">Username</label>
            <input
              type="text"
              className="rounded-md bg-gray-900 p-1 text-sm border-[1px] border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
            />
            <label className="text-sm">Email</label>
            <input
              type="email"
              className="rounded-md bg-gray-900 p-1 text-sm border-[1px] border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
            />
            <label className="text-sm">Password</label>
            <input
              type="password"
              className="rounded-md bg-gray-900 p-1 text-sm border-[1px] border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
            />
            <label className="text-sm">Confirm Password</label>
            <input
              type="password"
              className="rounded-md bg-gray-900 p-1 text-sm border-[1px] border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
            />
            <button type="submit" className="text-sm px-2 rounded bg-green-600 py-1 mt-2">
              Sign up
            </button>
            <button
              type="button"
              className="mt-4 gap-4 flex items-center justify-center shadow-lg bg-gray-200 mb-6 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              <Image src="/google.svg" alt="Google logo" width={23} height={23} />
              <span>Continue with Google</span>
            </button>
          </form>
          <p className="ml-auto mt-4 text-xs">
            Already have an account?
            <Link href={"/signin"} className="ml-1 text-blue-400 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </>
  );
};

export default Page;
