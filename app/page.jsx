"use client";

// export const dynamic = "force-dynamic";
import FeedPage from "@/components/home/FeedPage";
import LandingPage from "@/components/home/LandingPage";
import { UserContext } from "@/context/UserContext";
import { useContext, useEffect } from "react";

const Page = () => {
  const { session } = useContext(UserContext);

  useEffect(() => {}, [session]);

  if (session) {
    if (session?.data.session) {
      return <FeedPage />;
    } else return <LandingPage />;
  }
};

export default Page;
