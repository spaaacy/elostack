"use client";

import { toast, Toaster } from "react-hot-toast";
import Footer from "../common/Footer";
import Loader from "../common/Loader";
import NavBar from "../navbar/NavBar";
import { useContext, useState } from "react";
import Feed from "../common/Feed";
import { UserContext } from "@/context/UserContext";

const FeedPage = () => {
  const { session } = useContext(UserContext);

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="max-w-[820px]">
        <Feed />
      </main>
      <Toaster />
    </div>
  );
};

export default FeedPage;
