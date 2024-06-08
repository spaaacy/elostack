"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

export const UserContext = React.createContext();

export const UserProvider = ({ children }) => {
  const [session, setSession] = useState();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [profile, setProfile] = useState();

  useEffect(() => {
    if (!session) {
      fetchSession();
    } else {
      if (!dataLoaded) {
        setDataLoaded(true);
        fetchProfile();
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

  const fetchSession = async () => {
    const session = await supabase.auth.getSession();
    setSession(session);
  };

  return <UserContext.Provider value={{ session, profile }}>{children}</UserContext.Provider>;
};
