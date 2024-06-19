import ProjectWrapper from "@/components/projects/ProjectWrapper";

export const generateMetadata = async ({ params, searchParams }) => {
  const response = await fetch(`https://www.elostack.com/api/project/${params.id}/metadata`);
  const { title } = await response.json();
  if (title) {
    return {
      title: `${title} | EloStack`,
    };
  } else return { title: "EloStack" };
};

const Page = () => {
  return <ProjectWrapper />;
};

export default Page;
