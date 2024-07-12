"use client";

import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { formatDuration } from "@/utils/formatDuration";
import Markdown from "react-markdown";

const ProjectOverview = ({ project, members, user, setLoading }) => {
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
    </div>
  );
};

export default ProjectOverview;
