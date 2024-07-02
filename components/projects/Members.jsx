import React from "react";
import { FaCircleInfo } from "react-icons/fa6";

const MembersSidebar = ({ members }) => {
  return (
    <div className=" z-50 flex xl:block fixed top-[83px] left-0 w-64 2xl:w-80 rounded-r-lg py-3 bg-white dark:bg-backgrounddark drop-shadow-xl dark:border-r dark:border-y dark:border-gray-400">
      <div className="flex mx-4 items-center">
        <h4 className="font-bold">Member</h4>

        <div className="relative group ml-auto mx-1">
          <FaCircleInfo className="text-xs text-gray-300" />
          <p className="whitespace-pre-line dark:bg-neutral-800 dark:text-neutral-300 text-xs border dark:border-gray-400 text-neutral-800 left-0 top-6 transition-opacity opacity-0 group-hover:opacity-100 absolute bg-gray-300 bg-blur rounded-lg px-2 py-1 w-72">
            Blackpoints represents milestones missed by a member. Members are removed if they reach 3 milestones.
          </p>
        </div>
        <h4 className="font-bold">Blackpoints</h4>
      </div>
      <hr className="border-0 h-[1px] dark:bg-gray-400 bg-gray-200   my-1" />

      {members.map((m, i) => (
        <>
          <div className="mx-4 flex justify-between items-center text-sm">
            <p className="">{m.profile.username}</p>
            <div className="flex">
              {[...Array(m.blackpoints)].map((_, index) => (
                <div key={index} className="dark:bg-white bg-black rounded-full w-3 h-3 mx-0.5" />
              ))}
            </div>
          </div>
          {i + 1 < members.length && <hr className="border-0 h-[1px] dark:bg-gray-400 bg-gray-200 my-1" />}
        </>
      ))}
    </div>
  );
};

export default MembersSidebar;
