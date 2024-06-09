"use client";

import { toast, Toaster } from "react-hot-toast";
import NavBar from "../navbar/NavBar";
import Footer from "../common/Footer";
import Loader from "../common/Loader";
import { useContext, useRef, useState } from "react";
import Image from "next/image";
import { UserContext } from "@/context/UserContext";
import { MdEdit } from "react-icons/md";

const AccountSettings = () => {
  const { session, profile } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [avatar, setAvatar] = useState();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
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
              <Image
                src="/sample.jpg"
                // src={avatar}
                alt="profile picture"
                width={96}
                height={96}
                className="object-cover w-full h-full rounded-full"
              />
              <div className="absolute inset-0 bg-white opacity-0 hover:opacity-25 rounded-full transition-opacity duration-200 flex justify-center items-center">
                <MdEdit className="text-xl" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
            {profile && <h2 className="font-semibold text-xl">{profile.username}</h2>}
          </div>
        </main>
      )}
      <Footer />
      <Toaster />
    </div>
  );
};

export default AccountSettings;
