"use client";

import { useParams } from "next/navigation";
import NavBar from "../navbar/NavBar";
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "@/context/UserContext";
import Loader from "../common/Loader";
import toast, { Toaster } from "react-hot-toast";
import SettingsDropdown from "./SettingsDropdown";
import ChatBox from "./ChatBox";
import Feed from "../feed/Feed";
import Image from "next/image";
import ProjectOverview from "./ProjectOverview";
import { MdOutlineCheckBox, MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";

const ProjectView = ({ project, members }) => {
  const { id } = useParams();
  const { session, user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [currentState, setCurrentState] = useState("overview");
  const [posts, setPosts] = useState();

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto">
      <NavBar />
      {loading ? (
        <Loader />
      ) : (
        <main>
          <div className="flex items-center gap-4 relative">
            {project.image_id && (
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_STORAGE_PATH}/project-image/${project.id}/${project.image_id}`}
                alt="project image"
                width={64}
                height={64}
                className="object-cover w-16 h-16 rounded-full"
              />
            )}
            <div className="flex flex-col justify-start items-start">
              <h1 className="font-bold text-2xl">{project.title}</h1>
              <p className="font-light ">{project.status}</p>
            </div>
            <SettingsDropdown project={project} members={members} setLoading={setLoading} />
          </div>
          <hr className="border-0 h-[1px] bg-gray-400 my-4" />
          <div className="flex gap-2 text-sm mb-4">
            <button
              type="button"
              onClick={() => setCurrentState("overview")}
              className={`${
                currentState === "overview"
                  ? "bg-primary text-white"
                  : "bg-gray-200 dark:bg-backgrounddark hover:bg-gray-300 dark:hover:bg-neutral-800"
              } rounded dark:border px-2 py-1`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setCurrentState("updates")}
              className={`${
                currentState === "updates"
                  ? "bg-primary text-white"
                  : "bg-gray-200 dark:bg-backgrounddark hover:bg-gray-300 dark:hover:bg-neutral-800"
              } rounded dark:border px-2 py-1`}
            >
              Updates
            </button>
            <button
              type="button"
              onClick={() => setCurrentState("requirements")}
              className={`${
                currentState === "requirements"
                  ? "bg-primary text-white"
                  : "bg-gray-200 dark:bg-backgrounddark hover:bg-gray-300 dark:hover:bg-neutral-800"
              } rounded dark:border px-2 py-1`}
            >
              Requirements
            </button>
          </div>
          {currentState === "overview" ? (
            <ProjectOverview user={user} members={members} project={project} setLoading={setLoading} />
          ) : currentState === "updates" ? (
            <Feed posts={posts} setPosts={setPosts} project={project} isMember={true} />
          ) : (
            <Requirements members={members} />
          )}
          <ChatBox session={session} project={project} id={id} members={members} />
        </main>
      )}
      <Toaster />
    </div>
  );
};

const fakeRequirements = [
  { title: "User Authentication System", complete: false, role: "backend" },
  { title: "Database Integration", complete: true, role: "backend" },
  { title: "Responsive UI Design", complete: false, role: "frontend" },
  { title: "Real-time Notifications", complete: true, role: "backend" },
  { title: "File Upload and Management", complete: false, role: "backend" },
  { title: "Search Functionality", complete: true, role: "frontend" },
  { title: "Admin Dashboard", complete: false, role: "frontend" },
  { title: "Payment Gateway Integration", complete: false, role: "backend" },
  { title: "Multilingual Support", complete: true, role: "frontend" },
  { title: "API Documentation", complete: false, role: "backend" },
  { title: "Automated Testing Suite", complete: true, role: "backend" },
  { title: "Caching Mechanism", complete: false, role: "backend" },
  { title: "Performance Optimization", complete: true, role: "frontend" },
  { title: "Security Auditing", complete: false, role: "backend" },
  { title: "Deployment and Monitoring", complete: true, role: "backend" },
];

const fakeSprints = [
  { id: 1, title: "Sprint 1: Setup" },
  { id: 2, title: "Sprint 2: Authentication" },
  { id: 3, title: "Sprint 3: User Management" },
  { id: 4, title: "Sprint 4: Database Integration" },
  { id: 5, title: "Sprint 5: UI/UX Design" },
  { id: 6, title: "Sprint 6: File Management" },
  { id: 7, title: "Sprint 7: Search Functionality" },
  { id: 8, title: "Sprint 8: Notifications and Alerts" },
  { id: 9, title: "Sprint 9: Payment Integration" },
  { id: 10, title: "Sprint 10: Multilingual Support" },
  { id: 11, title: "Sprint 11: API Development" },
  { id: 12, title: "Sprint 12: Automated Testing" },
  { id: 13, title: "Sprint 13: Caching and Performance" },
  { id: 14, title: "Sprint 14: Security Auditing" },
  { id: 15, title: "Sprint 15: Deployment and Monitoring" },
];

const Requirements = ({ members }) => {
  const [requirements, setRequirements] = useState(fakeRequirements);
  const [sprints, setSprints] = useState(fakeSprints);
  const [selectedSprint, setSelectedSprint] = useState(1);
  const [showRoles, setShowRoles] = useState(false);
  const [currentRole, setCurrentRole] = useState("backend");
  const role = "backend";
  const roleRef = useRef();
  const buttonRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && buttonRef.current.contains(event.target)) {
        setShowRoles(true);
      }

      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setShowRoles(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [roleRef, buttonRef]);

  const changeComplete = (requirement) => {
    setRequirements((prevRequirements) =>
      prevRequirements.map((r) => (r === requirement ? { ...requirement, complete: !requirement.complete } : r))
    );
  };

  const selectSprint = (s) => {
    setSelectedSprint(s.id);
  };

  return (
    <div>
      <div className="flex gap-32 relative">
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold  ">Sprints</h3>
          {sprints.map((s, i) => {
            return (
              <button
                onClick={() => selectSprint(s)}
                key={i}
                className={`${
                  s.id === selectedSprint ? "text-primary  font-semibold dark:font-medium " : ""
                } text-left text-xs hover:underline rounded-full my-1`}
              >
                {s.title}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold mb-2 capitalize">{`${
            role === currentRole ? "Your" : currentRole
          } pending tasks`}</h3>
          {requirements.some((r) => !r.complete) ? (
            <ul className="flex flex-col gap-1">
              {requirements
                .filter((r) => !r.complete)
                .map((r, i) => {
                  return (
                    <button
                      disabled={role === currentRole}
                      onClick={() => changeComplete(r)}
                      type="button"
                      className={`${
                        role === currentRole ? "" : "hover:text-neutral-600 dark:hover:text-neutral-300"
                      } flex gap-2 items-center `}
                      key={i}
                    >
                      <MdOutlineCheckBoxOutlineBlank className="text-xl" />
                      <p className={`${r.complete ? "line-through" : ""} text-sm`}>{r.title}</p>
                    </button>
                  );
                })}
            </ul>
          ) : (
            <p className="text-sm">All tasks completed</p>
          )}
        </div>
        {requirements.some((r) => r.complete) && (
          <div className="flex flex-col">
            <h3 className="font-semibold capitalize">{`${
              role === currentRole ? "Your" : currentRole
            } completed tasks`}</h3>
            <ul className="mt-2 flex flex-col gap-1">
              {requirements
                .filter((r) => r.complete)
                .map((r, i) => {
                  return (
                    <button
                      disabled={role === currentRole}
                      onClick={() => changeComplete(r)}
                      type="button"
                      className={`${
                        true ? "" : "hover:text-neutral-600 dark:hover:text-neutral-300"
                      } flex gap-2 items-center `}
                      key={i}
                    >
                      <MdOutlineCheckBox className="text-xl " />
                      <p className={`${r.complete ? "line-through" : ""} text-sm`}>{r.title}</p>
                    </button>
                  );
                })}
            </ul>
          </div>
        )}
        <div className="absolute top-0 right-0 ">
          <button
            ref={buttonRef}
            className="capitalize bg-primary hover:bg-primarydark text-sm px-2 py-1 rounded-full flex justify-between items-center gap-1 hover:text-gray-200 text-white w-24"
          >
            {currentRole}
            <IoIosArrowDown />
          </button>
          {showRoles && (
            <div
              ref={roleRef}
              className="absolute top-8 right-1/2 translate-x-1/2 dark:bg-backgrounddark bg-gray-100 rounded border border-gray-400 "
            >
              <div className="flex flex-col items-end justify-center gap-1 py-1 ">
                {["backend", "frontend"].map((r, i) => (
                  <button
                    onClick={() => {
                      setShowRoles(false);
                      setCurrentRole(r);
                    }}
                    type="button"
                    className="capitalize text-left text-sm hover:bg-gray-300 dark:hover:bg-neutral-800 w-full py-1 px-2"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
