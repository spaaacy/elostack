export const dynamic = "force-dynamic";
import Projects from "@/components/projects/Projects";
import { Suspense } from "react";

export const metadata = {
  title: "Find Projects | EloStack",
};

const Page = () => {
  return (
    <Suspense>
      <Projects />
    </Suspense>
  );
};

export default Page;
