"use client";

import { UserContext } from "@/context/UserContext";
import { useContext, useState } from "react";
import toast from "react-hot-toast";

const SetupModal = ({ project, setShowModal }) => {
  const { session } = useContext(UserContext);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const saveRoles = async () => {
    const userId = session.data.session.user.id;
    if (!userId) return;

    try {
      const response = await fetch("/api/member/set-role", {
        method: "PATCH",
        headers: {
          "X-Supabase-Auth": `${session.data.session.access_token} ${session.data.session.refresh_token}`,
        },
        body: JSON.stringify({
          userId,
          projectId: project.id,
          role: selectedRoles.join(", ").toLowerCase(),
        }),
      });
      if (response.status === 200) {
        setShowModal(false);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong...");
    }
  };

  const selectRole = (r) => {
    setSelectedRoles((prevRoles) =>
      prevRoles.includes(r)
        ? prevRoles.filter((role) => role !== r)
        : [...prevRoles, r]
    );
  };

  return (
    <div className="bg-backgrounddark backdrop-blur bg-opacity-50 h-screen w-screen fixed z-50">
      <div className="flex flex-col max-sm:w-72 items-center dark:border dark:border-gray-400 justify-center fixed sm:w-96 bg-gray-200 dark:bg-neutral-900 rounded p-4 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <h3 className="text-lg">Select a role</h3>
        <p className="mt-2 mb-4 text-center mx-auto font-light text-sm text-neutral-400">
          Please choose carefully, roles cannot be changed afterwards.
        </p>
        <ul className="flex flex-col gap-2">
          {[...new Set(project.roles.toLowerCase().split(", "))].map((r, i) => (
            <button
            key={i}
              onClick={() => selectRole(r)}
              type="button"
              className={`${
                selectedRoles.includes(r)
                  ? "bg-primary text-white"
                  : "bg-gray-300 dark:bg-neutral-800 hover:bg-gray-400 dark:hover:bg-neutral-700"
              } px-4 py-2 rounded capitalize mx-auto`}
            >
              {r}
            </button>
          ))}
        </ul>
        <p className="mt-4 text-center mx-auto font-light text-xs text-neutral-400">
          * You can select multiple roles
        </p>
        <button
          onClick={saveRoles}
          type="button"
          className="ml-auto bg-primary hover:bg-primarydark px-2 py-1 hover:text-neutral-200 text-white rounded mt-4"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SetupModal;
