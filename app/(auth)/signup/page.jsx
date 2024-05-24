"use client";

import Footer from "@/components/common/Footer";
import Loader from "@/components/common/Loader";
import NavBar from "@/components/common/NavBar";
import { UserContext } from "@/context/UserContext";
import { supabase } from "@/utils/supabase";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const Page = () => {
  const { session } = useContext(UserContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.data.session) {
      router.push("/");
    } else if (session) {
      setLoading(false);
    }
  }, [session]);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const onSubmit = async (data, e) => {
    e.preventDefault();
    if (!session || session.data.session) return;
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      {loading ? (
        <Loader />
      ) : (
        <main>
          <div className="flex flex-col px-8 md:w-[480px] mx-auto">
            <h1 className="text-lg mx-auto">Sign Up</h1>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-4 px-8 py-6 rounded-lg bg-gray-900 bg-opacity-50 flex flex-col gap-2 border-gray-400 border-[1px]"
            >
              <label className="text-sm">Username</label>
              <input
                {...register("username", { required: "Username is required" })}
                type="text"
                className="rounded-md bg-gray-900 p-2 text-sm border-[1px] border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
              />
              {errors.username && (
                <p role="alert" className="text-xs text-red-500">
                  {errors.username?.message}
                </p>
              )}
              <label className="text-sm">Email</label>
              <input
                {...register("email", { required: "Email is required" })}
                type="text"
                className="rounded-md bg-gray-900 p-2 text-sm border-[1px] border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
              />
              {errors.email && (
                <p role="alert" className="text-xs text-red-500">
                  {errors.email?.message}
                </p>
              )}
              <label className="text-sm">Password</label>
              <input
                {...register("password", { required: "Password is required", min: 6 })}
                type="password"
                className="rounded-md bg-gray-900 p-2 text-sm border-[1px] border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
              />
              {errors.password && (
                <p role="alert" className="text-xs text-red-500">
                  {errors.password?.message}
                </p>
              )}
              <label className="text-sm">Confirm Password</label>
              <input
                {...register("confirmPassword", {
                  required: "Confirm password is required",
                  min: 6,
                  validate: (value, formValues) => value === formValues.password,
                })}
                type="password"
                className="rounded-md bg-gray-900 p-2 text-sm border-[1px] border-gray-400 focus:border-white focus:ring-0 focus:outline-none"
              />
              {errors.confirmPassword && (
                <p role="alert" className="text-xs text-red-500">
                  {errors.confirmPassword.type === "validate"
                    ? "Passwords do not match"
                    : errors.confirmPassword?.message}
                </p>
              )}
              <button type="submit" className="text-sm rounded-full bg-orangeaccent hover:bg-orangedark py-2 mt-2">
                Sign Up
              </button>
              <hr className="border-0 h-[1px] bg-gray-400 my-2" />
              <button
                type="button"
                className="text-sm gap-4 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded-full"
              >
                <Image src="/google.svg" alt="google_logo" width={20} height={20} />
                <span>Continue with Google</span>
              </button>
            </form>
            <p className="ml-auto mt-4 text-sm">
              Already have an account?
              <Link href={"/signin"} className="ml-1 text-blue-400 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </main>
      )}
      <Footer />
    </div>
  );
};

export default Page;
