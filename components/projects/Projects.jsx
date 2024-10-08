"use client";

import NavBar from "../navbar/NavBar";
import { formatDuration } from "@/utils/formatDuration";
import { FaCircleInfo } from "react-icons/fa6";
import { useContext, useEffect, useState } from "react";
import Loader from "../common/Loader";
import { UserContext } from "@/context/UserContext";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import Footer from "../common/Footer";
import Image from "next/image";
import Avatar from "boring-avatars";
import Head from "next/head";
import Markdown from "react-markdown";
import { useRouter, useSearchParams } from "next/navigation";

const Projects = () => {
  const { session } = useContext(UserContext);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filteredProjects, setFilteredProjects] = useState();
  const [searchInput, setSearchInput] = useState("");
  const [projects, setProjects] = useState([]);
  const [pages, setPages] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (session && !dataLoaded) {
      setDataLoaded(true);
      if (searchParams.get("cancelled") === "true") {
        toast.error("Payment unsuccessful");
        router.replace(`/projects`, undefined, { shallow: true });
      }
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

  const fetchProjects = async (page) => {
    try {
      const response = await fetch("/api/project", {
        method: "POST",
        body: JSON.stringify({ pageNumber: page ? page : 1 }),
      });
      if (response.status === 200) {
        const { projects, count } = await response.json();
        setProjects(projects);
        const lastPage = Math.ceil(count / 10);
        setLastPage(lastPage);
        if (!page) {
          const pagesArray = [];
          for (let i = 0; i < lastPage; i++) {
            if (i === 4) break;
            pagesArray.push(i + 1);
            if (i === 3 && lastPage != i) pagesArray.push(lastPage);
          }
          setCurrentPage(1);
          setPages(pagesArray);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProjects(page);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (lastPage <= 5) {
      const pagesArray = [];
      for (let i = 0; i < lastPage; i++) pagesArray.push(i + 1);
      setPages(pagesArray);
      return;
    }

    // Generate page array
    const pagesArray = [1];
    if (page === 1 || page === 2) {
      pagesArray.push(2, 3, 4);
      pagesArray.push(lastPage);
    } else if (page === lastPage || page === lastPage - 1) {
      pagesArray.push(lastPage - 3, lastPage - 2, lastPage - 1, lastPage);
    } else {
      pagesArray.push(lastPage);
      pagesArray.splice(1, 0, page - 1, page, page + 1);
    }
    setPages(pagesArray);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <meta name="description" content="EloStack is your place to discover and collaborate on software projects." />
      </Head>
      <NavBar />
      {loading ? (
        <Loader />
      ) : (
        <main>
          <h1 className="text-2xl font-semibold">Find Projects</h1>

          <hr className="border-0 h-[1px] bg-gray-400 my-4 " />
          <div className="flex items-center gap-2 flex-wrap ">
            <input
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={"Search..."}
              type="text"
              className="focus:ring-0 focus:outline-none min-w-0 w-96 text-sm px-3 py-2 rounded-full border bg-gray-200 dark:bg-backgrounddark hover:bg-gray-300 dark:hover:bg-neutral-800 focus:bg-gray-300 dark:focus:bg-neutral-800 border-gray-400"
            />
          </div>
          <ul className="flex flex-col gap-4 mt-4 mx-auto">
            {filteredProjects.map((p, i) => {
              return (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="drop-shadow bg-neutral-200 hover:bg-neutral-300 hover:cursor-pointer sm:h-56 p-4 flex max-sm:flex-col max-sm:items-center gap-8 items-start border dark:bg-backgrounddark  rounded dark:hover:bg-neutral-800 border-gray-400 text-xs font-light"
                  >
                    {p.image_id ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_STORAGE_PATH}/project-image/${p.id}/${p.image_id}`}
                        alt={`project ${i} image`}
                        height={176}
                        width={176}
                        className="object-cover h-44 w-44 drop-shadow"
                      />
                    ) : (
                      <div className="drop-shadow">
                        <Avatar variant="sunset" square={true} name={p.title} className="rounded" size={176} />
                      </div>
                    )}
                    <div className="flex flex-col h-full">
                      <div className="flex flex-col justify-start items-start">
                        <h3 className="text-base font-medium">{p.title}</h3>
                        <div className="flex items-baseline gap-2 text-gray-200 flex-wrap w-full">
                          <p className=" flex-shrink-0 text-right  bg-primary mt-1 px-2 py-1 rounded-full dark:shadow shadow-neutral-800">
                            {p.status}
                          </p>
                          <p
                            className={`${
                              p.total_members < p.team_size ? "bg-green-600" : "bg-red-700"
                            }  mt-1 px-2 py-1 rounded-full dark:shadow shadow-neutral-800  flex-shrink-0`}
                          >
                            {p.total_members < p.team_size ? "Open" : "Full"}
                          </p>
                        </div>
                      </div>
                      <Markdown className="text-sm mt-2 line-clamp-4 ">{p.description}</Markdown>
                      <p className="dark:font-normal font-medium text-primary mt-auto">{`Team ${p.total_members}/${p.team_size}`}</p>
                      <div className="flex justify-between items-center pt-1 ">
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
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <ul className="flex justify-center items-center my-4">
            {pages?.length > 1 &&
              pages.map((page, i) => {
                return (
                  <li className="flex items-baseline justify-center" key={i}>
                    {i === 1 && currentPage !== 1 && lastPage !== 5 && lastPage > 5 && (
                      <p className="ml-8 text-sm text-gray-400">...</p>
                    )}
                    {i === 4 && currentPage !== lastPage && lastPage !== 5 && lastPage > 5 && (
                      <p className="ml-8 text-sm text-gray-400">...</p>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`inline ml-8 hover:underline text-sm w-8 h-8  ${
                        page === currentPage
                          ? "bg-neutral-800 text-white dark:bg-white dark:text-black rounded-full drop-shadow"
                          : "dark:text-neutral-200 text-neutral-800"
                      }`}
                      key={page}
                    >
                      {page}
                    </button>
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

export default Projects;
