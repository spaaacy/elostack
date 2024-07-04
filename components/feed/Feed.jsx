import { useContext, useEffect, useState } from "react";
import Post from "./Post";
import { UserContext } from "@/context/UserContext";
import CreatePost from "./CreatePost";
import { MdRefresh } from "react-icons/md";

const Feed = ({ posts, setPosts, project, isMember, showLoadMorePosts, setShowLoadMorePosts }) => {
  const { session } = useContext(UserContext);
  const [nextPostsPage, setNextPostsPage] = useState(2);

  const fetchPosts = async () => {
    try {
      setShowLoadMorePosts(false);
      let response;
      if (project && isMember) {
        response = await fetch(`/api/post/${project.id}`, {
          method: "POST",
          headers: {
            "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
          },
          body: JSON.stringify({ pageNumber: nextPostsPage }),
        });
      } else if (project && !isMember) {
        response = await fetch(`/api/post/${project.id}/public`, {
          method: "POST",
          body: JSON.stringify({ pageNumber: nextPostsPage }),
        });
      } else {
        response = await fetch("/api/post", {
          method: "POST",
          body: JSON.stringify({
            pageNumber: nextPostsPage,
            publicOnly: true,
          }),
        });
      }
      if (response.status === 200) {
        setNextPostsPage(nextPostsPage + 1);
        const { posts } = await response.json();
        if (posts.length === 5) {
          setShowLoadMorePosts(true);
        } else setShowLoadMorePosts(false);
        setPosts((prevPosts) => [...prevPosts, ...posts]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  console.log(showLoadMorePosts);

  return (
    <div className="flex flex-col w-full max-w-[840px] mx-auto">
      {session?.data.session && (!project || isMember) && <CreatePost project={project} setPosts={setPosts} />}
      {posts && (
        <>
          {posts.length > 0 ? (
            <ul className="flex flex-col gap-6">
              {posts.map((p, i) => (
                <Post key={p.id} post={p} setPosts={setPosts} project={project} />
              ))}
            </ul>
          ) : (
            <div className="text-center text-sm rounded-xl bg-neutral-50 px-3 py-8 dark:bg-backgrounddark dark:border dark:border-gray-400">
              No posts
            </div>
          )}
        </>
      )}
      {showLoadMorePosts && (
        <button
          onClick={() => {
            fetchPosts();
          }}
          className="my-10 mx-auto text-2xl text-primary"
        >
          <MdRefresh />
        </button>
      )}
    </div>
  );
};

export default Feed;
