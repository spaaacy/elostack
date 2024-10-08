"use client";

import { UserContext } from "@/context/UserContext";
import availableRoles from "@/utils/availableRoles";
import { useContext, useState } from "react";
import toast from "react-hot-toast";

const SetupModal = ({ project, members, setMembers, setShowModal, setShowNextModal }) => {
  const { session } = useContext(UserContext);
  const [selectedRole, setSelectedRole] = useState();
  const rolesAvailable = availableRoles(members, project.roles);

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
          role: selectedRole.toLowerCase(),
        }),
      });
      if (response.status === 200) {
        setShowModal(false);
        setShowNextModal(true);
        setMembers((prevMembers) =>
          prevMembers.map((m) => (m.user_id === userId ? { ...m, role: selectedRole.toLowerCase() } : m))
        );
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong...");
    }
  };

  return (
    <div className="bg-backgrounddark backdrop-blur bg-opacity-50 h-screen w-screen fixed z-50">
      <div className="text-sm flex flex-col max-sm:w-72 items-center dark:border dark:border-gray-400 justify-center fixed sm:w-96 bg-gray-200 dark:bg-neutral-900 rounded p-4 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <h3 className="text-lg">Select a role</h3>
        <p className="mt-2 mb-4 text-center mx-auto font-light text-sm text-neutral-400">
          Please choose carefully, roles cannot be changed afterwards.
        </p>
        <ul className="flex flex-col gap-2">
          {rolesAvailable.map((r, i) => (
            <button
              key={i}
              onClick={() => setSelectedRole(r)}
              type="button"
              className={`${
                selectedRole === r
                  ? "bg-primary text-white"
                  : "bg-gray-300 dark:bg-neutral-800 hover:bg-gray-400 dark:hover:bg-neutral-700"
              } px-4 py-2 rounded capitalize mx-auto caplitalize w-full`}
            >
              {r}
            </button>
          ))}
          {rolesAvailable.includes("frontend") && rolesAvailable.includes("backend") && (
            <button
              onClick={() => setSelectedRole("frontend, backend")}
              type="button"
              className={`${
                selectedRole === "frontend, backend"
                  ? "bg-primary text-white"
                  : "bg-gray-300 dark:bg-neutral-800 hover:bg-gray-400 dark:hover:bg-neutral-700"
              } px-4 py-2 rounded capitalize mx-auto caplitalize w-full`}
            >
              Full-Stack
            </button>
          )}
        </ul>
        <button
          disabled={!selectedRole}
          onClick={saveRoles}
          type="button"
          className={`${
            selectedRole
              ? "bg-primary hover:bg-primarydark hover:text-neutral-200 text-white"
              : "bg-neutral-600 text-neutral-300 hover:cursor-not-allowed"
          } ml-auto  px-2 py-1  rounded mt-4`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SetupModal;
