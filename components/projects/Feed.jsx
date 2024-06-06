import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BiLike } from "react-icons/bi";
import { BiSolidLike } from "react-icons/bi";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

const Feed = ({ id, session, members }) => {
  const [posts, setPosts] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [likes, setLikes] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      if (!dataLoaded) {
        fetchPosts();
        fetchLikes();
        setDataLoaded(true);
      }
    };

    loadData();
  }, [session]);

  const {
    setValue, 
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const createPost = async (data, e) => {
    e?.preventDefault();
    const userId = session?.data.session.user.id;
    if (!userId) return;
    try {
      const postId = uuidv4();
      const response = await fetch("/api/post/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth":
            session.data.session.access_token +
            " " +
            session.data.session.refresh_token,
        },
        body: JSON.stringify({
          content: data.content,
          userId,
          projectId: id,
          postId: postId,
        }),
      });
      if (response.status === 201) {
        setValue("content", "");
        setPosts((prevPosts) => [
          {
            content: data.content,
            user_id: userId,
            project_id: id,
            id: postId,
            likes: 0
          },
          ...prevPosts,
        ]);
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/post/${id}`, {
        method: "GET",
        headers: {
          "X-Supabase-Auth":
            session.data.session.access_token +
            " " +
            session.data.session.refresh_token,
        },
      });
      if (response.status === 200) {
        const { posts } = await response.json();
        setPosts(posts);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLikes = async () => {
    const userId = session?.data.session.user.id;
    if (!userId) return;
    try {
      const response = await fetch(`/api/like/${userId}`, {
        method: "GET",
        headers: {
          "X-Supabase-Auth":
            session.data.session.access_token +
            " " +
            session.data.session.refresh_token,
        },
      });
      if (response.status === 200) {
        const { likes } = await response.json();
        setLikes(likes);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const likePost = async (postId) => {
    const userId = session?.data.session.user.id;
    if (!userId) return;
    try {
      const response = await fetch("/api/like/create", {
        method: "POST",
        headers: {
          "X-Supabase-Auth":
            session.data.session.access_token +
            " " +
            session.data.session.refresh_token,
        },
        body: JSON.stringify({
          userId,
          postId,
        }),
      });
      if (response.status === 201) {
        setLikes((prevLikes) => [
          {
            user_id: userId,
            post_id: postId,
          },
          ...prevLikes,
        ]);
        console.log(posts)
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
          )
        );
      } else {
        const { error } = await response.json();
        throw error;
      }
    } catch (error) {
      toast.error("Oops, something went wrong...");
      console.error(error);
    }
  };

  return (
    <div className=" sm:ml-4 max-sm:mt-4 sm:col-span-2 lg:col-span-4">
      <form
        onSubmit={handleSubmit(createPost)}
        className="rounded-xl bg-neutral-50 px-3 py-2 dark:bg-gray-900 flex flex-col gap-2"
      >
        <p className="text-base font-semibold ">Post an update</p>
        <textarea
          {...register("content", { required: "Content cannot be empty" })}
          id="scrollableDiv"
          placeholder="Tell everyone what's new..."
          className="p-2 text-sm w-full bg-gray-200 rounded-xl resize-none focus:bg-gray-300 dark:bg-gray-900 dark:focus:bg-gray-800 dark:border-[1px] dark:border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
          rows={3}
        />
        {errors.content && (
          <p role="alert" className="text-xs text-red-500">
            {errors.contet.message}
          </p>
        )}
        <button
          className="ml-auto px-2 py-1 bg-primary hover:bg-primarydark rounded-full text-sm text-gray-200 hover:text-gray-300 dark:shadow dark:shadow-gray-800"
          type="submit"
        >
          Create
        </button>
      </form>
      <hr className="border-0 h-[1px] bg-gray-400 my-4" />
      {members && (
        <ul className="flex flex-col gap-2 mt-4">
          {posts.map((p, i) => {
            const liked = likes.find((l) => l.post_id === p.id);
            return (
              <div
                className="rounded-xl bg-neutral-50 px-3 py-2 dark:bg-gray-900 flex flex-col gap-2"
                key={i}
              >
                <p className="font-bold">
                  {members.find((m) => m.user_id === p.user_id).user.username}
                </p>
                {p.content}
                <hr className="border-0 h-[1px] bg-neutral-300 my-2" />
                <div className="text-neutral-600 flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={
                      liked ? () => likePost(p.id) : () => likePost(p.id)
                    }
                    className="items-end flex"
                  >
                    {liked ? "Liked " : "Like "}
                    {liked ? (
                      <BiSolidLike className="ml-2 text-xl inline" />
                    ) : (
                      <BiLike className="ml-2 text-xl inline" />
                    )}
                  </button>
                  <p className="font-light">{`${p.likes} Likes`}</p>
                </div>
              </div>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Feed;
