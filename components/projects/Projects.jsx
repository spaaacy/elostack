"use client";

import NavBar from "../navbar/NavBar";
import { formatDuration } from "@/utils/formatDuration";
import { FaCircleInfo } from "react-icons/fa6";
import { useContext, useEffect, useState } from "react";
import Loader from "../common/Loader";
import { UserContext } from "@/context/UserContext";
import { Toaster } from "react-hot-toast";
import Link from "next/link";

const Projects = () => {
  const { session } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [filteredProjects, setFilteredProjects] = useState();
  const [searchInput, setSearchInput] = useState("");
  const [projects, setProjects] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (session && !dataLoaded) {
      setDataLoaded(true);
      fetchProjects();
    }

    const filteredProjects = projects.filter((project) =>
      searchInput === ""
        ? true
        : project.title.toLowerCase().includes(searchInput) ||
          project.description.toLowerCase().includes(searchInput) ||
          project.technologies.toLowerCase().includes(searchInput)
    );

    setFilteredProjects(filteredProjects);
  }, [searchInput, session, projects]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/project", {
        method: "GET",
      });
      if (response.status === 200) {
        const { projects } = await response.json();
        setProjects(projects);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      {loading ? (
        <Loader />
      ) : (
        <main>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h1 className="text-2xl font-semibold">Find Projects</h1>
            <Link
              href={"/create-project"}
              type="button"
              className="text-gray-200 px-2 py-1 bg-primary hover:bg-primarydark rounded-full text-sm hover:text-gray-300 dark:shadow dark:shadow-neutral-800 flex items-center"
            >
              Create Project
            </Link>
          </div>
          <hr className="border-0 h-[1px] bg-gray-400 my-4" />
          <div className="flex items-center gap-2 flex-wrap">
            <input
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={"Search..."}
              type="text"
              className="focus:ring-0 focus:outline-none min-w-0 w-96 text-sm px-3 py-2 rounded-full border bg-gray-200 dark:bg-backgrounddark hover:bg-gray-300 dark:hover:bg-neutral-800 focus:bg-gray-300 dark:focus:bg-neutral-800 border-gray-400"
            />
          </div>
          <ul className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid gap-4 mt-4">
            {filteredProjects.map((p, i) => {
              return (
                <li key={i}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="bg-gray-200 hover:bg-gray-300 hover:cursor-pointer h-56 p-2 flex flex-col dark:border dark:bg-backgrounddark  rounded dark:hover:bg-neutral-800 border-gray-400 text-xs font-light"
                  >
                    <div className="flex flex-col justify-start items-start">
                      <h3 className="text-base font-medium">{p.title}</h3>
                      <div className="flex items-baseline gap-2 text-gray-200 flex-wrap w-full">
                        <p className=" flex-shrink-0 text-right  bg-primary mt-1 px-2 py-1 rounded-full dark:shadow shadow-neutral-800">
                          {p.status}
                        </p>
                        <p
                          className={`${
                            p.is_open ? "bg-green-600" : "bg-red-700"
                          }  mt-1 px-2 py-1 rounded-full dark:shadow shadow-neutral-800  flex-shrink-0`}
                        >
                          {p.is_open ? "Open" : "Closed"}
                        </p>
                        <p className="ml-auto dark:font-normal font-medium text-primary flex-shrink-0">{`Leader: ${p.leader_username}`}</p>
                      </div>
                    </div>
                    <p className="text-sm mt-2 line-clamp-4 ">{p.description}</p>
                    <p className="dark:font-normal font-medium text-primary mt-auto">{`Team ${p.total_members}/${p.team_size}`}</p>
                    <div className="flex justify-between items-center pt-1">
                      <p className="dark:font-normal font-medium text-primary">
                        {formatDuration(p.duration_length, p.duration_type)}
                      </p>
                      <div className="relative group">
                        <FaCircleInfo className="text-sm text-primary" />
                        <p className="text-gray-200 right-0 dark:shadow shadow-neutral-800 transition-opacity opacity-0 group-hover:opacity-100 absolute bottom-6 bg-primary w-80 rounded-xl px-2 py-1  drop-shadow ">
                          {p.technologies}
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </main>
      )}
      <Toaster />
    </div>
  );
};

export default Projects;
