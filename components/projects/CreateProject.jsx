"use client";

import { useForm } from "react-hook-form";
import Footer from "../common/Footer";
import NavBar from "../common/NavBar";
import { useContext, useState } from "react";
import { IoAddCircleSharp } from "react-icons/io5";
import { UserContext } from "@/context/UserContext";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Loader from "../common/Loader";

const CreateProject = () => {
  const { session } = useContext(UserContext);
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {
    getValues,
    clearErrors,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

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
          status: "Looking for members",
        }),
      });
      if (response.status === 201) {
        router.push("/projects");
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong...");
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

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      {loading ? (
        <Loader />
      ) : (
        <main className="md:w-[720px]">
          <h1 className="text-2xl font-semibold">Create Project</h1>
          <hr className="border-0 h-[1px] bg-gray-400 my-4" />
          <form
            className="mt-4 px-8 py-6 rounded-lg bg-gray-900 bg-opacity-50 flex flex-col gap-2 border-gray-400 border-[1px]"
            onSubmit={handleSubmit(onSubmit)}
          >
            <input
              placeholder="Title"
              className="flex-1 text-sm p-1 rounded border bg-gray-900 bg-opacity-50 focus:bg-gray-800 border-gray-400"
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
              className="resize-none overflow-y-auto text-sm p-1 rounded border bg-gray-900 bg-opacity-50 focus:bg-gray-800 border-gray-400"
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

            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2 items-center justify-start">
                <label htmlFor="teamSize" className="text-sm">
                  Team size
                </label>
                <input
                  type="number"
                  min={2}
                  id="teamSize"
                  className="w-12 text-sm p-1 rounded border bg-gray-900 bg-opacity-50 focus:bg-gray-800 border-gray-400"
                  {...register("teamSize", { required: "Team size is required" })}
                />
              </div>
              <div className="flex gap-2 items-center justify-start">
                <label htmlFor="durationLength" className="text-sm">
                  Duration
                </label>
                <input
                  type="number"
                  min={1}
                  id="durationLength"
                  className="w-12 text-sm p-1 rounded border bg-gray-900 bg-opacity-50 focus:bg-gray-800 border-gray-400"
                  {...register("durationLength", { required: "Duration is required" })}
                />

                <select
                  defaultValue={"week"}
                  className="text-sm p-1 rounded border bg-gray-900 bg-opacity-50 hover:bg-gray-800 border-gray-400"
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
                  validate: (value, formvalues) => technologies.length > 0,
                })}
                className="flex-1 text-sm p-1 rounded border bg-gray-900 bg-opacity-50 focus:bg-gray-800 border-gray-400"
                type="text"
                onKeyDown={technologyKeyDown}
              />
              <button type="button" onClick={addTechnology}>
                <IoAddCircleSharp className="text-orangeaccent text-2xl" />
              </button>
            </div>
            {errors.technology?.type === "validate" && (
              <p role="alert" className="text-xs text-red-500">
                Technologies is required
              </p>
            )}
            <ul className="flex gap-1 items-center">
              {technologies.length > 0 &&
                technologies.map((t, i) => {
                  return (
                    <li
                      onClick={() => removeTechnology(t)}
                      key={i}
                      className="hover:cursor-pointer text-xs bg-orangeaccent px-2 py-1 rounded-full"
                    >
                      {t}
                    </li>
                  );
                })}
            </ul>

            <button
              className="mt-4 ml-auto px-2 py-1 bg-orangeaccent hover:bg-orangedark rounded-full text-sm hover:text-gray-300 shadow shadow-black"
              type="submit"
            >
              Create
            </button>
          </form>
        </main>
      )}
      <Footer />
      <Toaster />
    </div>
  );
};

export default CreateProject;
