"use client";

import { toast, Toaster } from "react-hot-toast";
import Footer from "../common/Footer";
import Loader from "../common/Loader";
import NavBar from "../common/NavBar";
import { useContext, useState } from "react";
import Feed from "../common/Feed";
import { UserContext } from "@/context/UserContext";

const FeedPage = () => {
  const { session } = useContext(UserContext);

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="max-w-[820px]">
        {/* <h1 className="text-xl font-semibold mb-4">Latest Posts</h1> */}
        <Feed />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
};

export default FeedPage;
