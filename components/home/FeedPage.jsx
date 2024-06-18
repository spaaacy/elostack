"use client";

import { Toaster } from "react-hot-toast";
import NavBar from "../navbar/NavBar";
import Feed from "../feed/Feed";
import MyProjectsSideBar from "./MyProjectsSideBar";
import { useState } from "react";

const FeedPage = () => {
  const [posts, setPosts] = useState();

  return (
    <div className="flex flex-col min-h-screen relative">
      <NavBar />
      <MyProjectsSideBar />
      <main>
        <Feed posts={posts} setPosts={setPosts} />
      </main>
      <Toaster />
    </div>
  );
};

export default FeedPage;
