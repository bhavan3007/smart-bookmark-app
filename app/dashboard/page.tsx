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

  // Get logged user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Fetch bookmarks
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
  if (user) {
    fetchBookmarks();
  }
}, [user]);


  // Realtime updates
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
        filter: `user_id=eq.${user.id}`, // VERY IMPORTANT
      },
      () => {
        fetchBookmarks();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user]);


  // Add bookmark
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

  // Delete bookmark
  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (!user) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">My Bookmarks</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      {/* Add Bookmark Form */}
      <div className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Bookmark Title"
          className="border p-2 w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Bookmark URL"
          className="border p-2 w-full"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={addBookmark}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Bookmark
        </button>
      </div>

      {/* Bookmark List */}
      {bookmarks.length === 0 && (
        <p className="text-gray-500">No bookmarks yet</p>
      )}

      {bookmarks.map((b) => (
  <div key={b.id} className="border p-3 mb-3">

    {editingId === b.id ? (
      <div className="space-y-2">
        <input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          value={editUrl}
          onChange={(e) => setEditUrl(e.target.value)}
          className="border p-2 w-full"
        />

        <div className="space-x-2">
          <button
            onClick={() => updateBookmark(b.id)}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Save
          </button>

          <button
            onClick={() => setEditingId(null)}
            className="bg-gray-500 text-white px-3 py-1 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    ) : (
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold">{b.title}</p>
          <a href={b.url} target="_blank" className="text-blue-500 text-sm">
            {b.url}
          </a>
        </div>

        <div className="space-x-2">
          <button
            onClick={() => {
              setEditingId(b.id);
              setEditTitle(b.title);
              setEditUrl(b.url);
            }}
            className="bg-yellow-500 text-white px-3 py-1 rounded"
          >
            Edit
          </button>

          <button
            onClick={() => deleteBookmark(b.id)}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    )}
  </div>
))}

    </div>
  );
}
