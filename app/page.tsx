"use client";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200 p-4">

      {/* Card */}
      <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-6 sm:p-8 md:p-10 w-full max-w-md text-center border border-white/40">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="google"
              className="w-6 h-6 sm:w-8 sm:h-8"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Welcome Back
        </h1>

        <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base">
          Sign in to continue to{" "}
          <span className="font-semibold">Bookmark Manager</span>
        </p>

        {/* Google Button */}
        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            className="w-5 h-5 sm:w-6 sm:h-6"
          />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="my-6 text-xs sm:text-sm text-gray-400">
          Secure authentication powered by Google
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 leading-relaxed">
          By continuing, you agree to our <br />
          <span className="underline cursor-pointer hover:text-blue-600">
            Terms of Service
          </span>{" "}
          &{" "}
          <span className="underline cursor-pointer hover:text-blue-600">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
}
