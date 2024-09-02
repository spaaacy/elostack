import SignUp from "@/components/auth/SignUp";
import { Suspense } from "react";

export const metadata = { title: "Sign Up | EloStack" };
const Page = () => {
  return (
    <Suspense>
      <SignUp />
    </Suspense>
  );
};

export default Page;
