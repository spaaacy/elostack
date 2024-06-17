"use client";

import { useParams, useRouter } from "next/navigation";
import NavBar from "../navbar/NavBar";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/UserContext";
import Loader from "../common/Loader";
import ProjectView from "./ProjectView";
import ProjectPublic from "./ProjectPublic";

const ProjectWrapper = () => {
  const { id } = useParams();
  const { session, user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState();
  const [members, setMembers] = useState();
  const [dataLoaded, setDataLoaded] = useState(false);
  const router = useRouter();
  const [access, setAccess] = useState();

  useEffect(() => {
    const loadData = async () => {
      setDataLoaded(true);
      await fetchProject();
      await fetchMembers();
    };

    if (session && user) {
      if (!dataLoaded) loadData();
    }
  }, [session, user]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/project/${id}`, {
        method: "GET",
      });
      if (response.status === 200) {
        const { project } = await response.json();
        if (project.deleted) router.push("/projects");
        setProject(project);
      } else {
        router.push("/projects");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/project/${id}/member`, {
        method: "GET",
      });
      if (response.status === 200) {
        const { members } = await response.json();
        setMembers(members);
        const userId = session.data.session?.user.id;
        const access = members.some((m) => m.user_id === userId && !m.banned);
        console.log(user);
        if (access || user.admin) setAccess(access);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <Loader />
      </div>
    );

  if (access) {
    return <ProjectView project={project} members={members} />;
  } else return <ProjectPublic project={project} members={members} />;
};

export default ProjectWrapper;
