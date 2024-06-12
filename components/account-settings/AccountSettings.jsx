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

const AccountSettings = () => {
  const { session, profile } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [avatar, setAvatar] = useState();
  const [showSave, setShowSave] = useState(false);
  const [file, setFile] = useState();

  useEffect(() => {
    if (profile) setLoading(false);
  }, [session, profile]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFile(file);
    if (file) {
      setShowSave(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    const userId = session.data.session.user.id;
    if (!userId || !profile) return;
    try {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File cannot exceed 5 mb");
        return;
      }

      setLoading(true);
      const formData = new FormData();
      if (avatar) formData.append("profilePicture", file);
      formData.append("userId", userId);
      formData.append("imageId", profile.image_id);

      const response = await fetch("/api/profile/edit-profile", {
        method: "PATCH",
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        body: formData,
      });
      if (response.status === 200) {
        setLoading(false);
        toast.success("Changes have been saved");
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      console.error(error);
      toast.error("Oops, something went wrong...");
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

          <div className="mx-auto justify-center items-center flex gap-10">
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
            <div className="relative">
              <h2 className="font-semibold text-xl">{profile.username}</h2>
              {showSave && (
                <button
                  onClick={uploadImage}
                  className="absolute right-0 top-8 text-gray-200 px-2 py-1 bg-primary hover:bg-primarydark rounded-full text-sm hover:text-gray-300 dark:shadow dark:shadow-neutral-800"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </main>
      )}
      <Toaster />
    </div>
  );
};

export default AccountSettings;
