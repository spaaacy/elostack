"use client";

import { useForm } from "react-hook-form";
import NavBar from "../navbar/NavBar";
import { useContext, useEffect, useRef, useState } from "react";
import { IoAddCircleSharp } from "react-icons/io5";
import { UserContext } from "@/context/UserContext";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Loader from "../common/Loader";
import { BsStars } from "react-icons/bs";
import Link from "next/link";

const CreateProject = () => {
  const { session } = useContext(UserContext);
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ideaPrompt, setIdeaPrompt] = useState();
  const [showIdeaPrompt, setShowIdeaPrompt] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const router = useRouter();

  const {
    watch,
    reset,
    getValues,
    clearErrors,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    watch(() => {
      setShowClear(true);
    });
  }, [watch]);

  const onSubmit = async (data, e) => {
    e.preventDefault();
    if (!session.data.session) return;
    try {
      setLoading(true);
      const response = await fetch("/api/project/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          technologies: technologies.join(", "),
          leader: session.data.session.user.id,
          duration_length: data.durationLength,
          duration_type: data.durationType,
          team_size: data.teamSize,
          status: "Just created",
          is_open: true,
          deleted: false,
        }),
      });
      if (response.status === 201) {
        const { projectId } = await response.json();
        router.push(`/projects/${projectId}`);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong...");
    }
  };

  const generateIdea = async () => {
    setShowIdeaPrompt(false);
    setLoading(true);
    try {
      const response = await fetch("/api/gemini/generate-idea", {
        method: "POST",
        body: JSON.stringify({ ideaPrompt: ideaPrompt ? ideaPrompt : "Full-Stack React" }),
      });
      if (response.status === 200) {
        const { idea } = await response.json();
        setValue("title", idea.title);
        setValue("description", idea.description);
        setValue("durationType", idea.durationType);
        setValue("durationLength", idea.durationLength);
        setValue("teamSize", idea.teamSize);
        setTechnologies(idea.technologies);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addTechnology = () => {
    const technology = getValues("technology");
    if (technology === "") return;
    clearErrors("technology");
    setTechnologies([...technologies, technology]);
    setValue("technology", "");
  };

  const removeTechnology = (technology) => {
    setTechnologies(technologies.filter((t) => t !== technology));
  };

  const technologyKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTechnology();
    }
  };

  const generateIdeaKeyDown = (e) => {
    if (e.key === "Enter") {
      generateIdea();
    }
  };

  const clearValues = () => {
    reset();
    setTechnologies([]);
    setShowClear(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      {loading ? (
        <Loader />
      ) : (
        <main className="md:w-[860px]">
          <div className="flex items-center relative flex-wrap gap-2">
            <h1 className="text-2xl font-semibold">Create Project</h1>
            <input
              onKeyDown={generateIdeaKeyDown}
              onChange={(e) => setIdeaPrompt(e.target.value)}
              className="border-gray-400  border rounded-full bg-gray-200 focus:bg-gray-300 dark:bg-backgrounddark dark:focus:bg-neutral-800 focus:ring-0 focus:outline-none text-xs px-3 py-2 ml-auto min-w-0 w-96"
              type="text"
              placeholder="Prompt (e.g., Full-Stack React)"
            />
            <button
              type="button"
              onClick={generateIdea}
              className="text-gray-200 px-2 py-1 bg-primary hover:bg-primarydark rounded-full text-sm hover:text-gray-300 dark:shadow dark:shadow-neutral-800 flex items-center"
            >
              <BsStars className="inline mr-2" />
              Generate Idea
            </button>
          </div>
          <hr className="border-0 h-[1px] bg-gray-400 my-4" />
          <form
            className="mt-4 px-8 py-6 rounded-lg dark:bg-backgrounddark bg-white flex flex-col gap-2 dark:border-gray-400 dark:border-[1px]"
            onSubmit={handleSubmit(onSubmit)}
          >
            <input
              placeholder="Title"
              className="focus:bg-gray-300 rounded-md bg-gray-200 dark:bg-backgrounddark dark:focus:bg-neutral-800 p-2 text-sm dark:border-[1px] dark:border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
              {...register("title", { required: "Title is required" })}
              type="text"
            />
            {errors.title && (
              <p role="alert" className="text-xs text-red-500">
                {errors.title.message}
              </p>
            )}
            <textarea
              placeholder="Description"
              className="resize-none overflow-y-auto focus:bg-gray-300 rounded-md bg-gray-200 dark:bg-backgrounddark dark:focus:bg-neutral-800 p-2 text-sm dark:border-[1px] dark:border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
              id="scrollableDiv"
              rows={10}
              {...register("description", { required: "Description is required" })}
              type="text"
            />
            {errors.description && (
              <p role="alert" className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex gap-2 items-center justify-start">
                <label htmlFor="teamSize" className="text-sm">
                  Team size
                </label>
                <input
                  type="number"
                  min={2}
                  id="teamSize"
                  className="w-12 focus:bg-gray-300 rounded-md bg-gray-200 dark:bg-backgrounddark dark:focus:bg-neutral-800 p-2 text-sm dark:border-[1px] dark:border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
                  {...register("teamSize", { required: "Team size is required" })}
                />
              </div>
              <div className="flex gap-2 items-center justify-start flex-wrap">
                <label htmlFor="durationLength" className="text-sm">
                  Duration
                </label>
                <input
                  type="number"
                  min={1}
                  id="durationLength"
                  className="w-12 focus:bg-gray-300 rounded-md bg-gray-200 dark:bg-backgrounddark dark:focus:bg-neutral-800 p-2 text-sm dark:border-[1px] dark:border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
                  {...register("durationLength", { required: "Duration is required" })}
                />

                <select
                  defaultValue={"week"}
                  className="text-sm p-2 rounded border bg-gray-200 hover:bg-gray-300 dark:bg-backgrounddark  dark:hover:bg-neutral-800 border-gray-400"
                  {...register("durationType", { required: true })}
                >
                  <option value={"day"}>Days</option>
                  <option value={"week"}>Weeks</option>
                </select>
              </div>
            </div>
            {errors.durationLength && (
              <p role="alert" className="ml-auto text-xs text-red-500">
                {errors.durationLength.message}
              </p>
            )}
            {errors.teamSize && (
              <p role="alert" className="ml-auto text-xs text-red-500">
                {errors.teamSize.message}
              </p>
            )}
            <label className="text-sm">Technologies</label>
            <div className="flex gap-2 items-center justify-start">
              <input
                {...register("technology", {
                  validate: (value, formValues) => technologies.length > 0,
                })}
                className="min-w-0 flex-1 focus:bg-gray-300 rounded-md bg-gray-200 dark:bg-backgrounddark dark:focus:bg-neutral-800 p-2 text-sm dark:border-[1px] dark:border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
                type="text"
                onKeyDown={technologyKeyDown}
              />
              <button type="button" onClick={addTechnology}>
                <IoAddCircleSharp className="text-primary text-2xl" />
              </button>
            </div>
            {errors.technology?.type === "validate" && (
              <p role="alert" className="text-xs text-red-500">
                Technologies is required
              </p>
            )}
            <ul className="flex gap-1 items-center flex-wrap">
              {technologies.length > 0 &&
                technologies.map((t, i) => {
                  return (
                    <li
                      onClick={() => removeTechnology(t)}
                      key={i}
                      className="hover:cursor-pointer flex-shrink-0 text-xs bg-primary px-2 py-1 rounded-full text-gray-200"
                    >
                      {t}
                    </li>
                  );
                })}
            </ul>

            <div className="flex justify-between items-center flex-wrap text-gray-200">
              {showClear && (
                <button
                  onClick={clearValues}
                  className="mt-4 px-2 py-1 bg-primary hover:bg-primarydark rounded-full text-sm hover:text-gray-300 dark:shadow dark:shadow-neutral-800"
                  type="button"
                >
                  Clear
                </button>
              )}
              {session?.data.session ? (
                <button
                  className="mt-4 ml-auto px-2 py-1 bg-primary hover:bg-primarydark rounded-full text-sm hover:text-gray-300 dark:shadow dark:shadow-neutral-800"
                  type="submit"
                >
                  Create
                </button>
              ) : (
                <Link
                  href={"/signin"}
                  className="mt-4 ml-auto px-2 py-1 bg-primary hover:bg-primarydark rounded-full text-sm hover:text-gray-300 dark:shadow dark:shadow-neutral-800"
                >
                  Create
                </Link>
              )}
            </div>
          </form>
        </main>
      )}
      <Toaster />
    </div>
  );
};

export default CreateProject;
