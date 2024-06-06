"use client";

import Footer from "../common/Footer";
import NavBar from "../common/NavBar";
import { formatDuration } from "@/utils/formatDuration";
import { FaCircleInfo } from "react-icons/fa6";
import { useContext, useEffect, useState } from "react";
import Loader from "../common/Loader";
import { UserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const MyProjects = () => {
  const { session } = useContext(UserContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [openInput, setOpenInput] = useState(true);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState();

  useEffect(() => {
    if (session && !dataLoaded) {
    }

    if (session) {
      if (session.data.session) {
        if (!dataLoaded) {
          setDataLoaded(true);
          fetchProjects();
        }
      } else {
        router.push("/signin");
      }
    }

    const filteredProjects = projects.filter((project) =>
      // (statusInput === "" ? true : project.status.toLowerCase() === statusInput) &&
      // (openInput ? project.is_open : true) &&
      searchInput === ""
        ? true
        : project.title.toLowerCase().includes(searchInput) ||
          project.description.toLowerCase().includes(searchInput) ||
          project.technologies.toLowerCase().includes(searchInput)
    );

    setFilteredProjects(filteredProjects);
  }, [searchInput, statusInput, session, openInput, projects]);

  const fetchProjects = async () => {
    const userId = session.data.session.user.id;
    if (!userId) return;
    try {
      const response = await fetch("/api/project/my-projects", {
        method: "POST",
        body: JSON.stringify({
          userId,
        }),
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
          <h1 className="text-2xl font-semibold">My Projects</h1>

          <hr className="border-0 h-[1px] bg-gray-400 my-4" />
          <div className="flex items-center gap-2 flex-wrap">
            <input
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={"Search..."}
              type="text"
              className="focus:ring-0 focus:outline-none min-w-0 w-96 text-sm px-3 py-2 rounded-full border bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-800 focus:bg-gray-300 dark:focus:bg-gray-800 border-gray-400"
            />
            {/* <div className="bg-gray-200 dark:bg-gray-900 p-2 text-sm rounded ml-auto flex items-center gap-2 border-gray-400 border">
              <label>Open</label>
              <input checked={openInput} onChange={() => setOpenInput(!openInput)} type="checkbox" />
            </div>
            <select
              name="selectedStatus"
              onChange={(e) => setStatusInput(e.target.value)}
              className="min-w-0  text-sm p-2 rounded border bg-gray-200 hover:bg-gray-300 dark:bg-gray-900  dark:hover:bg-gray-800 border-gray-400"
            >
              <option value={""}>Show All</option>
              <option value={"just created"}>Just created</option>
              <option value={"in progress"}>In Progress</option>
              <option value={"complete"}>Complete</option>
            </select> */}
          </div>
          <ul className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid gap-4 mt-4">
            {filteredProjects.map((p, i) => {
              return (
                <li key={i}>
                  <div
                    onClick={() => router.push(`/projects/${p.id}`)}
                    className="bg-gray-200 hover:bg-gray-300 hover:cursor-pointer h-56 p-2 flex flex-col dark:border dark:bg-gray-900  rounded dark:hover:bg-gray-800 border-gray-400 text-xs font-light"
                  >
                    <div className="flex flex-col justify-start items-start">
                      <h3 className="text-base font-medium">{p.title}</h3>
                      <div className="flex items-baseline gap-2 text-gray-200 flex-wrap w-full">
                        <p className=" flex-shrink-0 text-right  bg-primary mt-1 px-2 py-1 rounded-full dark:shadow shadow-gray-800">
                          {p.status}
                        </p>
                        <p
                          className={`${
                            p.is_open ? "bg-green-600" : "bg-red-700"
                          }  mt-1 px-2 py-1 rounded-full dark:shadow shadow-gray-800  flex-shrink-0`}
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
                        <p className="text-gray-200 right-0 dark:shadow shadow-gray-800 transition-opacity opacity-0 group-hover:opacity-100 absolute bottom-6 bg-primary w-80 rounded-xl px-2 py-1  drop-shadow">
                          {p.technologies}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </main>
      )}
      <Footer />
      <Toaster />
    </div>
  );
};

export default MyProjects;
