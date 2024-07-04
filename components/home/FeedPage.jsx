"use client";

import { Toaster } from "react-hot-toast";
import NavBar from "../navbar/NavBar";
import Feed from "../feed/Feed";
import MyProjectsSideBar from "./MyProjectsSideBar";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/UserContext";

const FeedPage = () => {
  const { session } = useContext(UserContext);
  const [posts, setPosts] = useState();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showLoadMorePosts, setShowLoadMorePosts] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!dataLoaded) {
        setDataLoaded(true);
        fetchPosts();
      }
    };

    loadData();
  }, [session]);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/post", {
        method: "POST",
        body: JSON.stringify({
          pageNumber: 1,
          publicOnly: true,
        }),
      });
      if (response.status === 200) {
        const { posts } = await response.json();
        setPosts(posts);
        if (posts.length === 5) {
          setShowLoadMorePosts(true);
        } else setShowLoadMorePosts(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      <NavBar />
      <MyProjectsSideBar />
      <main>
        <Feed
          posts={posts}
          setPosts={setPosts}
          showLoadMorePosts={showLoadMorePosts}
          setShowLoadMorePosts={setShowLoadMorePosts}
        />
      </main>
      <Toaster />
    </div>
  );
};

export default FeedPage;
