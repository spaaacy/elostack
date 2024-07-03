"use client";

import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { formatDuration } from "@/utils/formatDuration";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ProjectOverview = ({ project, members, user, setLoading }) => {
  const { session } = useContext(UserContext);
  const { id } = useParams();

  const changeStatus = async (status) => {
    if (!session.data.session) return;
    try {
      setLoading(true);
      const response = await fetch("/api/project/change-status", {
        method: "PATCH",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          status,
          projectId: id,
        }),
      });
      if (response.status === 200) {
        toast.success("Status changed");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="relative p-2 rounded dark:border bg-gray-200 dark:bg-backgrounddark  dark:border-gray-400 flex flex-col font-light text-sm ">
        {project.github && (
          <Link className="ml-auto absolute max-sm:bottom-4 sm:top-4 right-4" href={project.github} target="_blank">
            <FaGithub className=" text-2xl dark:hover:text-gray-300 hover:text-gray-700" />
          </Link>
        )}
        <Markdown className="markdown">{project.description}</Markdown>
        <p className="mt-4 font-semibold">Members</p>
        <ul>
          {members
            .filter((member) => !member.banned)
            .map((member, i) => {
              return (
                <li key={i} className="flex items-center justify-start gap-2">
                  <p className=" ">
                    {member.profile.username}
                    {member.role && (
                      <span className="font-medium capitalize">{`: ${
                        member.role.includes("frontend") && member.role.includes("backend") ? "full-stack" : member.role
                      }`}</span>
                    )}
                  </p>
                  {console.log(member)}
                  {(member.profile.university || member.profile.other_university) && (
                    <p
                      className="text-sm px-2 rounded-full font-bold bg-black dark:bg-white text-white dark:text-black"
                      style={
                        member.profile.university && {
                          color: member.profile.university.secondary_color,
                          "background-color": member.profile.university.primary_color,
                        }
                      }
                    >
                      {member.profile.university ? member.profile.university.name : member.profile.other_university}
                    </p>
                  )}
                </li>
              );
            })}
        </ul>
        <p className="mt-4 font-semibold">Technologies</p>
        <p>{project.technologies}</p>
        <p className="text-primary mt-4 dark:font-normal font-medium">
          {`Duration: ${formatDuration(project.duration_length, project.duration_type)}`}
        </p>
      </div>
      {user?.admin && project.status.toLowerCase() === "in progress" && (
        <button
          onClick={() => changeStatus("Complete")}
          type="button"
          className="text-gray-200 bg-primary text-xs px-2 py-1 mt-2 rounded-full dark:shadow dark:shadow-neutral-800 hover:bg-primarydark hover:text-gray-300"
        >
          Mark completed
        </button>
      )}
    </div>
  );
};

export default ProjectOverview;
