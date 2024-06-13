"use client";

import { Toaster } from "react-hot-toast";
import NavBar from "../navbar/NavBar";
import Feed from "../feed/Feed";
import MyProjectsSideBar from "./MyProjectsSideBar";

const FeedPage = () => {
  return (
    <div className="flex flex-col min-h-screen relative">
      <NavBar />
      <MyProjectsSideBar />
      <main className="max-w-[840px]">
        <Feed />
      </main>
      <Toaster />
    </div>
  );
};

export default FeedPage;
