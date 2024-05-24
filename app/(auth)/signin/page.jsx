import NavBar from "@/components/NavBar";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Page = () => {
  return (
    <>
      <NavBar />
      <main>
        <div className="flex flex-col w-1/2 lg:w-1/5 mx-auto">
          <h1 className="text-lg mx-auto">Sign In</h1>
          <form className="mt-4 px-8 py-6 rounded-lg bg-gray-700 bg-opacity-50 flex flex-col gap-2 border-gray-400 border-[1px]">
            <label className="text-sm">Email</label>
            <input
              type="email"
              className="rounded-md bg-gray-900 p-2 text-sm border-[1px] border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
            />
            <label className="text-sm">Password</label>
            <input
              type="password"
              className="rounded-md bg-gray-900 p-2 text-sm border-[1px] border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
            />
            <button type="submit" className="text-sm rounded-full bg-green-600 py-2 mt-2 hover:bg-green-700">
              Sign in
            </button>
            <hr className="border-0 h-[1px] bg-gray-400 my-2" />
            <button
              type="button"
              className="text-sm gap-4 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded-full"
            >
              <Image src="/google.svg" alt="google_logo" width={20} height={20} />
              <span>Continue with Google</span>
            </button>
          </form>
          <p className="ml-auto mt-4 text-xs">
            Don't have an account?
            <Link href={"/signup"} className="ml-1 text-blue-400 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </>
  );
};

export default Page;
