"use client";

import { useParams } from "next/navigation";
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
import Image from "next/image";

const EditProject = () => {
  const { session } = useContext(UserContext);
  const { id } = useParams();
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const router = useRouter();
  const [file, setFile] = useState();
  const [image, setImage] = useState();
  const fileInputRef = useRef();
  const [dataLoaded, setDataLoaded] = useState(false);

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

  useEffect(() => {
    if (session) {
      if (session.data.session) {
        if (!dataLoaded) {
          setDataLoaded(true);
          fetchProject();
        }
      } else router.push("/projects");
    }
  }, [session]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/project/${id}`, {
        method: "GET",
      });
      if (response.status === 200) {
        const { project } = await response.json();
        if (project.deleted || project.leader !== session.data.session.user.id) router.push("/projects");
        setValue("title", project.title);
        setValue("description", project.description);
        setValue("durationType", project.duration_type);
        setValue("durationLength", project.duration_length);
        setValue("teamSize", project.team_size);
        setTechnologies(project.technologies.split(", "));
      } else {
        router.push("/projects");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (data, e) => {
    e.preventDefault();
    if (!session.data.session) return;
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append(
        "project",
        JSON.stringify({
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
        })
      );
      if (image) formData.append("projectImage", file);

      const response = await fetch("/api/project/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: formData,
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
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
          <h1 className="text-2xl font-semibold">Edit Project</h1>

          <hr className="border-0 h-[1px] bg-gray-400 my-4" />

          <form
            className="mt-4 px-8 py-4 rounded-lg dark:bg-backgrounddark bg-white flex flex-col gap-2 dark:border-gray-400 dark:border-[1px]"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex justify-center items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="text-gray-200 px-2 py-1 bg-primary hover:bg-primarydark rounded-full text-sm hover:text-gray-300 dark:shadow dark:shadow-neutral-800 flex items-center flex-shrink-0"
              >
                Select Image
              </button>
            </div>
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />

            {errors.imagePrompt && (
              <p role="alert" className="text-xs text-red-500 ml-auto">
                {errors.imagePrompt.message}
              </p>
            )}
            {image && (
              <Image
                src={image}
                alt={"project image"}
                width={256}
                height={256}
                unoptimized
                className="mx-auto max-w-64 max-h-64 object-cover"
              />
            )}

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
              {...register("description", {
                required: "Description is required",
              })}
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
                  {...register("teamSize", {
                    required: "Team size is required",
                  })}
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
                  {...register("durationLength", {
                    required: "Duration is required",
                  })}
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

export default EditProject;
