import { useContext, useEffect, useRef, useState } from "react";
import Post from "./Post";
import { UserContext } from "@/context/UserContext";
import CreatePost from "./CreatePost";

const Feed = ({ id, project }) => {
  const { session } = useContext(UserContext);
  const [posts, setPosts] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [nextPostsPage, setNextPostsPage] = useState(1);
  const [showLoadMorePosts, setShowLoadMorePosts] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!dataLoaded) {
        fetchPosts();
        setDataLoaded(true);
      }
    };

    loadData();
  }, [session]);

  const fetchPosts = async () => {
    try {
      setShowLoadMorePosts(false);
      let response;
      if (project) {
        response = await fetch(`/api/post/${id}`, {
          method: "POST",
          headers: {
            "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
          },
          body: JSON.stringify({ pageNumber: nextPostsPage }),
        });
      } else {
        response = await fetch("/api/post", {
          method: "POST",
          body: JSON.stringify({
            pageNumber: nextPostsPage,
          }),
        });
      }
      if (response.status === 200) {
        setNextPostsPage(nextPostsPage + 1);
        const { posts } = await response.json();
        if (posts.length === 5) {
          setShowLoadMorePosts(true);
        } else setShowLoadMorePosts(false);

        if (nextPostsPage > 1) {
          setPosts((prevPosts) => [...prevPosts, ...posts]);
        } else setPosts(posts);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col sm:ml-4 max-sm:mt-4 sm:col-span-2 lg:col-span-4">
      {session?.data.session && <CreatePost project={project} setPosts={setPosts} />}
      <ul className="flex flex-col gap-6 ">
        {posts.map((p, i) => (
          <Post key={p.id} post={p} setPosts={setPosts} project={project} />
        ))}
      </ul>
      {showLoadMorePosts && (
        <button
          onClick={() => {
            fetchPosts();
          }}
          className="my-10 mx-auto text-gray-400 hover:underline"
        >
          Load more posts...
        </button>
      )}
    </div>
  );
};

export default Feed;
