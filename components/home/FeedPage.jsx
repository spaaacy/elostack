"use client";

import { toast, Toaster } from "react-hot-toast";
import Footer from "../common/Footer";
import Loader from "../common/Loader";
import NavBar from "../navbar/NavBar";
import { useContext, useState } from "react";
import Feed from "../feed/Feed";
import { UserContext } from "@/context/UserContext";
import MyProjectsSideBar from "./MyProjectsSideBar";

const FeedPage = () => {
  const { session } = useContext(UserContext);

  return (
    <div className="flex flex-col min-h-screen relative">
      <NavBar />
      <main className="max-w-[820px]">
        <Feed />
      </main>
      <MyProjectsSideBar />
      <Toaster />
    </div>
  );
};

export default FeedPage;
