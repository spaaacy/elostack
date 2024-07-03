"use client";

import { toast, Toaster } from "react-hot-toast";
import NavBar from "../navbar/NavBar";
import Footer from "../common/Footer";
import Loader from "../common/Loader";
import { useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { UserContext } from "@/context/UserContext";
import { MdEdit } from "react-icons/md";
import UserAvatar from "../common/UserAvatar";
import Link from "next/link";
import generateRandomString from "@/utils/generateRandomString";
import { useRouter, useSearchParams } from "next/navigation";
import { FaGithubAlt } from "react-icons/fa6";
import { useForm } from "react-hook-form";

const AccountSettings = () => {
  const { user, session, profile } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [avatar, setAvatar] = useState();
  const [file, setFile] = useState();
  const [hideGithub, setHideGithub] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [uniInput, setUniInput] = useState("");
  const [universities, setUniversities] = useState();
  const [uniOtherInput, setUniOtherInput] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    const loadData = async () => {
      await fetchUniversities();
      setLoading(false);
      if (searchParams.has("github_oauth") && searchParams.has("code")) githubOauth();
      if (searchParams.has("github_oauth_success")) {
        router.replace("/account-settings", undefined, { shallow: true });
        toast.success("GitHub connected");
      }
      setValue("username", profile.username);
      if (profile.other_university) {
        setUniOtherInput(profile.other_university);
      } else {
        setUniInput(profile.university);
      }
    };

    if (profile) loadData();
  }, [profile]);

  const githubOauth = async () => {
    const userId = session.data.session.user.id;
    if (!userId) return;
    try {
      const response = await fetch("/api/github/oauth", {
        method: "PATCH",
        body: JSON.stringify({ code: searchParams.get("code"), userId }),
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
      });
      if (response.status === 200) {
        setHideGithub(true);
        toast.success("GitHub connected!");
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong...");
    } finally {
      router.replace("/account-settings", undefined, { shallow: true });
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data, e) => {
    e.preventDefault();
    const userId = session.data.session.user.id;
    if (!userId || !profile) return;
    try {
      const maxSize = 5 * 1024 * 1024;
      if (file?.size > maxSize) {
        toast.error("File cannot exceed 5 mb");
        return;
      }

      setLoading(true);
      const formData = new FormData();
      if (avatar) {
        formData.append("profilePicture", file);
        formData.append("oldImageId", profile.image_id);
      }
      formData.append(
        "profile",
        JSON.stringify({
          userId,
          username: data.username,
          university: uniInput === "" ? null : uniInput.toUpperCase(),
          other_university: uniInput === "" ? uniOtherInput.toUpperCase() : null,
        })
      );

      const response = await fetch("/api/profile/edit", {
        method: "PATCH",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: formData,
      });
      if (response.status === 200) {
        setLoading(false);
        toast.success("Changes have been saved");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong...");
    }
  };

  const fetchUniversities = async () => {
    try {
      const response = await fetch("/api/university", {
        method: "GET",
      });
      if (response.status === 200) {
        const { universities } = await response.json();
        setUniversities(universities);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      {loading ? (
        <Loader />
      ) : (
        <main>
          <h1 className="text-2xl font-semibold">Account Settings</h1>

          <hr className="border-0 h-[1px] bg-gray-400 my-4" />

          <form onSubmit={handleSubmit(onSubmit)} className="mx-auto justify-center items-start flex gap-10 relative">
            <div className="relative cursor-pointer w-24 h-24" onClick={() => fileInputRef.current.click()}>
              {avatar || profile?.image_id ? (
                <Image
                  src={avatar ? avatar : profile.picture}
                  alt="profile picture"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full rounded-full"
                />
              ) : (
                <UserAvatar username={profile.username} size={96} />
              )}
              <div className="absolute inset-0 bg-white opacity-0 hover:opacity-25 rounded-full transition-opacity duration-200 flex justify-center items-center">
                <MdEdit className="text-xl text-black" />
              </div>
              <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
            <div className="flex flex-col gap-2 items-start">
              <label htmlFor="username" className="text-xs text-neutral-400 font-light self-start -mb-1">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="rounded-md bg-white dark:bg-backgrounddark p-2 text-sm dark:border-[1px] dark:border-gray-400 focus:border-white focus:ring-0 focus:outline-none  focus:bg-neutral-50 dark:focus:bg-neutral-800"
                {...register("username", { required: "Username is required" })}
              />
              {errors.username && (
                <p role="alert" className="text-xs text-red-500 -mt-1">
                  {errors.username.message}
                </p>
              )}
              {universities && (
                <>
                  <label className="text-xs text-neutral-400 font-light self-start -mb-1">University</label>
                  <div className="flex flex-col gap-2 items-start">
                    {universities.map((u, i) => (
                      <div key={i} className="flex gap-2 items-center justify-center">
                        <input
                          type="radio"
                          id={u.name}
                          value={u.name}
                          checked={uniInput === u.name}
                          onChange={() => setUniInput(u.name)}
                        />
                        <label
                          htmlFor={u.name}
                          className="text-sm px-2 rounded-full font-bold"
                          style={{ color: u.secondary_color, "background-color": u.primary_color }}
                        >
                          {u.name}
                        </label>
                      </div>
                    ))}
                    <div className="flex gap-2 items-center justify-center">
                      <input
                        type="radio"
                        id="other"
                        value=""
                        checked={uniInput === ""}
                        onChange={() => setUniInput("")}
                      />
                      {uniInput !== "" ? (
                        <label
                          htmlFor="other"
                          className="text-sm px-2 rounded-full dark:bg-white dark:text-black bg-black text-white font-bold"
                        >
                          Other
                        </label>
                      ) : (
                        <input
                          value={uniOtherInput}
                          onChange={(e) => setUniOtherInput(e.target.value)}
                          className="w-16 rounded-full px-3 py-1 text-xs bg-gray-200 dark:bg-backgrounddark hover:bg-gray-300 dark:hover:bg-neutral-800 focus:bg-gray-300 dark:focus:bg-neutral-800 border-gray-400 border"
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
              <button
                type="submit"
                className="ml-auto text-gray-200 px-2 py-1 bg-primary hover:bg-primarydark rounded-full text-sm hover:text-gray-300 dark:shadow dark:shadow-neutral-800"
              >
                Save
              </button>
            </div>
            {!user?.github_access_token && !hideGithub && (
              <Link
                href={{
                  pathname: "https://github.com/login/oauth/authorize",
                  query: {
                    client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
                    state: generateRandomString(),
                    redirect_uri: `${window.location.origin}/account-settings?github_oauth=true`,
                    allow_signup: true,
                  },
                }}
                className="bg-neutral-800 px-3 py-1 rounded-full text-white flex items-center gap-2 hover:bg-neutral-700 text-sm absolute top-0 right-0"
              >
                <FaGithubAlt />
                <p>Connect to GitHub</p>
              </Link>
            )}
          </form>
        </main>
      )}
      <Toaster />
    </div>
  );
};

export default AccountSettings;
