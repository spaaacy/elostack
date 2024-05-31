"use client";

import Footer from "../common/Footer";
import NavBar from "../common/NavBar";
import { formatDuration } from "@/utils/formatDuration";
import { FaCircleInfo } from "react-icons/fa6";
import { useContext, useEffect, useState } from "react";
import ProjectModal from "./ProjectModal";
import Loader from "../common/Loader";
import { UserContext } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const Projects = () => {
  const { session } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [filteredProjects, setFilteredProjects] = useState();
  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [openInput, setOpenInput] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalProject, setModalProject] = useState();
  const [projects, setProjects] = useState([]);
  const router = useRouter();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [memberList, setMemberList] = useState();

  useEffect(() => {
    if (session && !dataLoaded) {
      fetchProjects();
      fetchUserMemberList();
      setDataLoaded(true);
    }

    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    const filteredProjects = projects.filter(
      (project) =>
        (statusInput === "" ? true : project.status.toLowerCase() === statusInput) &&
        (openInput ? project.is_open : true) &&
        (searchInput === ""
          ? true
          : project.title.toLowerCase().includes(searchInput) ||
            project.description.toLowerCase().includes(searchInput) ||
            project.technologies.toLowerCase().includes(searchInput))
    );

    setFilteredProjects(filteredProjects);
  }, [searchInput, statusInput, showModal, session, openInput, projects]);

  const handleJoin = async () => {
    if (!session.data.session) return;
    try {
      setShowModal(false);
      setLoading(true);
      const response = await fetch("/api/member/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          userId: session.data.session.user.id,
          projectId: modalProject.id,
        }),
      });
      if (response.status === 201) {
        router.push(`/projects/${modalProject.id}`);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      setLoading(false);
      toast.error("Oops, something went wrong...");
      console.error(error);
    }
  };

  const fetchUserMemberList = async () => {
    const userId = session.data.session?.user.id;
    if (!userId) return;
    try {
      const response = await fetch(`/api/member/${userId}`, {
        method: "GET",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
      });
      if (response.status === 200) {
        const { data } = await response.json();
        setMemberList(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/project", {
        method: "POST",
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

  const handleClick = (project) => {
    if (session.data.session && memberList.some((m) => m.project_id === project.id && !m.removed)) {
      router.push(`/projects/${project.id}`);
    } else {
      setShowModal(true);
      setModalProject(project);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      {loading ? (
        <Loader />
      ) : (
        <main>
          <h1 className="text-2xl font-semibold">Find Projects</h1>

          <hr className="border-0 h-[1px] bg-gray-400 my-4" />
          <div className="flex items-center gap-2 flex-wrap">
            <input
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={"Search..."}
              type="text"
              className="focus:ring-0 focus:outline-none min-w-0 w-96 text-sm p-2 rounded border bg-gray-200 dark:bg-gray-900 focus:bg-gray-300 dark:focus:bg-gray-800 border-gray-400"
            />
            <div className="bg-gray-200 dark:bg-gray-900 p-2 text-sm rounded ml-auto flex items-center gap-2 border-gray-400 border">
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
            </select>
          </div>
          <ul className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid gap-4 mt-4">
            {filteredProjects.map((p, i) => {
              return (
                <li key={i}>
                  <div
                    onClick={() => handleClick(p)}
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
      {showModal && (
        <ProjectModal
          removed={memberList ? memberList.some((m) => m.removed && modalProject.id === m.project_id) : false}
          project={modalProject}
          setShowModal={setShowModal}
          handleJoin={handleJoin}
          session={session}
        />
      )}
      <Toaster />
    </div>
  );
};

export default Projects;
