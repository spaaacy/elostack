"use client";

import Link from "next/link";
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
        (searchInput === ""
          ? true
          : project.title.toLowerCase().includes(searchInput) ||
            project.description.toLowerCase().includes(searchInput) ||
            project.technologies.toLowerCase().includes(searchInput))
    );

    setFilteredProjects(filteredProjects);
  }, [searchInput, statusInput, showModal, session]);

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
        method: "GET",
      });
      if (response.status === 200) {
        const { projects } = await response.json();
        setProjects(projects);
        setFilteredProjects(projects);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (project) => {
    setShowModal(true);
    setModalProject(project);
  };

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      {loading ? (
        <Loader />
      ) : (
        <main>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Find Projects</h1>
            <Link
              href={"/create-project"}
              className="px-2 py-1 bg-orangeaccent hover:bg-orangedark rounded-full text-sm hover:text-gray-300 shadow shadow-black"
            >
              Create a project
            </Link>
          </div>
          <hr className="border-0 h-[1px] bg-gray-400 my-4" />
          <div className="flex items-center justify-between gap-2">
            <input
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={"Search..."}
              type="text"
              className="w-96 text-sm p-2 rounded border bg-gray-900 bg-opacity-50 focus:bg-gray-800 border-gray-400"
            />
            <select
              name="selectedStatus"
              onChange={(e) => setStatusInput(e.target.value)}
              className="text-sm p-2 rounded border bg-gray-900 bg-opacity-50 hover:bg-gray-800 border-gray-400"
            >
              <option value={""}>Show All</option>
              <option value={"in progress"}>In Progress</option>
              <option value={"looking for members"}>Looking for members</option>
            </select>
          </div>
          <ul className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid gap-4 mt-4">
            {filteredProjects.map((p, i) => {
              return (
                <li key={i}>
                  <div
                    onClick={() => handleClick(p)}
                    className="hover:cursor-pointer h-48 p-2 flex flex-col border bg-gray-900 bg-opacity-50 rounded hover:bg-gray-800 border-gray-400 text-xs font-light"
                  >
                    <div className="flex justify-between items-start ">
                      <h3 className="text-base font-medium">{p.title}</h3>
                      <p className="text-right flex-shrink-0 bg-orangeaccent px-2 py-1 rounded-full ml-2 shadow shadow-black">
                        {p.status}
                      </p>
                    </div>
                    <p className="text-sm mt-2 line-clamp-4">{p.description}</p>
                    <div className="mt-auto flex justify-between items-center ">
                      <p className="text-orangeaccent">{formatDuration(p.duration_length, p.duration_type)}</p>
                      <div className="relative group">
                        <FaCircleInfo className="text-sm text-orangeaccent" />
                        <p className="right-0 shadow shadow-black transition-opacity opacity-0 group-hover:opacity-100 absolute bottom-6 bg-orangeaccent rounded-full truncate px-2 py-1">
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
          joined={session?.data.session ? memberList.some((m) => m.project_id === modalProject.id) : false}
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
