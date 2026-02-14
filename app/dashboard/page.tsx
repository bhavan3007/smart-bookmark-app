"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editUrl, setEditUrl] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };

  const updateBookmark = async (id: string) => {
    await supabase
      .from("bookmarks")
      .update({ title: editTitle, url: editUrl })
      .eq("id", id);

    setEditingId(null);
  };

  useEffect(() => {
    if (user) fetchBookmarks();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("realtime-bookmarks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchBookmarks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addBookmark = async () => {
    if (!title || !url) return alert("Fill all fields");

    await supabase.from("bookmarks").insert({
      title,
      url,
      user_id: user.id,
    });

    setTitle("");
    setUrl("");
  };

  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 p-4">
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl text-center w-full max-w-sm">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
            Loading Dashboard...
          </h2>
          <p className="text-gray-500 text-sm">
            Please wait while we fetch your bookmarks
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">

      {/* HEADER */}
      <div className="bg-white shadow-lg px-4 sm:px-6 md:px-10 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <h1 className="text-lg sm:text-xl font-bold text-gray-800">
          🔖 Bookmark Manager
        </h1>

        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center">
          <p className="text-gray-600 text-xs sm:text-sm break-all">
            {user.email}
          </p>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8">

        {/* ADD BOOKMARK CARD */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-8 sm:mb-10">
          <h2 className="text-base sm:text-lg font-semibold mb-4">
            Add New Bookmark
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder="Title"
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              placeholder="URL"
              className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 outline-none w-full"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <button
              onClick={addBookmark}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:scale-105 transition w-full"
            >
              + Add Bookmark
            </button>
          </div>
        </div>

        {/* BOOKMARK GRID */}
        {bookmarks.length === 0 ? (
          <p className="text-center text-gray-500 text-sm sm:text-base">
            No bookmarks yet
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {bookmarks.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-xl shadow-lg p-4 sm:p-5 hover:shadow-2xl transition"
              >
                {editingId === b.id ? (
                  <div className="space-y-3">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="border p-2 w-full rounded"
                    />
                    <input
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="border p-2 w-full rounded"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateBookmark(b.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Save
                      </button>

                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-400 text-white px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="break-all">
                      <p className="font-bold text-base sm:text-lg">
                        {b.title}
                      </p>
                      <a
                        href={b.url}
                        target="_blank"
                        className="text-blue-500 text-sm break-all"
                      >
                        {b.url}
                      </a>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(b.id);
                          setEditTitle(b.title);
                          setEditUrl(b.url);
                        }}
                        className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded text-white text-sm"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deleteBookmark(b.id)}
                        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
