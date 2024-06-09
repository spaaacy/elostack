"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { useRouter } from "next/navigation";

export const UserContext = React.createContext();

export const UserProvider = ({ children }) => {
  const [session, setSession] = useState();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [profile, setProfile] = useState();
  const [user, setUser] = useState();
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      await fetchUser();
      await fetchProfile();
    };

    if (!session) {
      fetchSession();
    } else if (window.location.pathname !== "/signup" && window.location.pathname !== "/signin") {
      if (session.data.session) {
        if (!dataLoaded) {
          setDataLoaded(true);
          loadData();
        }
      }
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile/${session.data.session.user.id}`, {
        method: "GET",
      });
      if (response.status === 200) {
        const { profile } = await response.json();
        setProfile(profile);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUser = async () => {
    const userId = session.data.session?.user.id;
    if (userId) {
      const response = await fetch(`/api/user/${userId}`, {
        headers: {
          "X-Supabase-Auth": session.data.session.access_token + " " + session.data.session.refresh_token,
        },
        method: "GET",
      });
      if (response.status === 200) {
        const { user } = await response.json();
        setUser(user);
      } else {
        router.push("/signup?google_oauth=true");
      }
    }
  };

  const fetchSession = async () => {
    const session = await supabase.auth.getSession();
    setSession(session);
  };

  return <UserContext.Provider value={{ session, profile, user }}>{children}</UserContext.Provider>;
};
