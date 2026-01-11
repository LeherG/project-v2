//WORKS!!!!!!!!

"use client";

import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
  useMutation,
  useQuery,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import ConnectionsFeature from "./ConnectionsFeature";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "connections" | "community" | "profile">("home");

  return (
    <>
      <header className="sticky top-0 z-10 bg-light dark:bg-dark border-b-2 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">SBHacks Proj Name...</h1>
          <SignOutButton />
        </div>
        <Authenticated>
          <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </Authenticated>
      </header>
      <main className="p-8 flex flex-col gap-8">
        <Authenticated>
          {currentPage === "home" && <HomePage />}
          {currentPage === "connections" && <ConnectionsFeature />}
          {currentPage === "community" && <CommunityPage />}
          {currentPage === "profile" && <ProfilePage />}
        </Authenticated>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
      </main>
    </>
  );
}

function Navigation({ 
  currentPage, 
  setCurrentPage 
}: { 
  currentPage: string; 
  setCurrentPage: (page: "home" | "connections" | "community" | "profile") => void;
}) {
  const navItems = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "connections", label: "Connections", icon: "🤝" },
    { id: "community", label: "Community", icon: "💬" },
    { id: "profile", label: "My Profile", icon: "👤" },
  ] as const;

  return (
    <nav className="flex gap-1 px-4 pb-2 overflow-x-auto">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setCurrentPage(item.id)}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap ${
            currentPage === item.id
              ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
          }`}
        >
          <span className="mr-2">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function HomePage() {
  const { viewer } = useQuery(api.myFunctions.listNumbers, { count: 10 }) ?? {};

  if (viewer === undefined) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Welcome, {viewer ?? "Anonymous"}! 👋</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-xl border-2 border-indigo-200 dark:border-indigo-800">
          <h3 className="text-xl font-semibold mb-3">🤝 Connections</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Find mentors or mentees to help you grow in your journey.
          </p>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">
            Browse Connections
          </button>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950 rounded-xl border-2 border-green-200 dark:border-green-800">
          <h3 className="text-xl font-semibold mb-3">💬 Community</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Share your thoughts and connect with the community.
          </p>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition">
            View Posts
          </button>
        </div>
      </div>

      <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900 rounded-xl">
        <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">0</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Connections</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">0</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Posts</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">0</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Interactions</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommunityPage() {
  const addPost = useMutation(api.myFunctions.addPost);
  const posts = useQuery(api.myFunctions.viewPosts);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showPostFields, setShowPostFields] = useState(false);
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

  if (posts === undefined) {
    return <div className="text-center p-8">Loading posts...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Community Posts</h2>

      <div className="flex flex-col gap-4 mb-8">
        <button
          className="self-start px-6 py-3 rounded-xl font-semibold
                     bg-indigo-600 text-white
                     hover:bg-indigo-700 active:scale-95
                     transition transform shadow-md"
          onClick={() => setShowPostFields(!showPostFields)}
        >
          {showPostFields ? "Cancel" : "Add a post"}
        </button>

        {showPostFields && (
          <div className="flex flex-col gap-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <input
              className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 
                         rounded-xl px-4 py-3 border border-slate-300 dark:border-slate-700
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         transition"
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
                         rounded-xl px-4 py-3 border border-slate-300 dark:border-slate-700
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         transition resize-none h-32"
              placeholder="Write your post..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />

            <button
              className="self-end px-6 py-3 rounded-xl font-semibold
                         bg-indigo-600 text-white
                         hover:bg-indigo-700 active:scale-95
                         transition transform shadow-md
                         disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!title.trim() || !body.trim()}
              onClick={async () => {
                await addPost({ title, body });
                setTitle("");
                setBody("");
                setShowPostFields(false);
              }}
            >
              Publish post
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {posts.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">
            No posts yet. Be the first to post!
          </p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="border-2 border-slate-200 dark:border-slate-800 rounded-xl p-4 flex gap-4 hover:shadow-lg transition"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  post.authorDisplayName ?? post.authorEmail ?? "?"
                )}&background=7c3aed&color=fff&size=64`}
                alt="User avatar"
                className="w-12 h-12 rounded-full object-cover"
              />

              <div className="flex flex-col w-full">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-300">
                    {post.authorDisplayName ?? post.authorEmail ?? "Unknown"}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    @{post.authorEmail?.split("@")[0] ?? "unknown"}
                  </span>
                </div>

                {post.title && <h3 className="font-semibold mt-1">{post.title}</h3>}
                <p className="text-sm mt-1 whitespace-pre-wrap">{post.body}</p>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
              <button
  className="text-sm text-indigo-600 dark:text-indigo-400 mt-2 self-start"
  onClick={() =>
    setOpenComments((prev) => ({
      ...prev,
      [post.id]: !prev[post.id],
    }))
  }
>
  {openComments[post.id] ? "Hide comments" : "Show comments"}
</button>

{openComments[post.id] && (
  <CommentSection postId={post.id} />
)}

            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CommentSection({ postId }: { postId: string }) {
  const comments = useQuery(api.myFunctions.getComments, {
    postId: postId as any,
  });
  const addComment = useMutation(api.myFunctions.addComment);
  const [text, setText] = useState("");

  if (comments === undefined) {
    return <p className="text-sm text-slate-400">Loading comments...</p>;
  }

  return (
    <div className="mt-3 pl-4 border-l border-slate-200 dark:border-slate-700">
      <div className="flex flex-col gap-2">
        {comments.length === 0 && (
          <p className="text-sm text-slate-400">No comments yet</p>
        )}

        {comments.map((c) => (
          <div key={c.id} className="text-sm">
            <span className="font-semibold">
              {c.authorEmail?.split("@")[0] ?? "anon"}:
            </span>{" "}
            {c.body}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <input
          className="flex-1 text-sm px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
          placeholder="Write a comment…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="text-sm px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50"
          disabled={!text.trim()}
          onClick={async () => {
            await addComment({ postId: postId as any, body: text });
            setText("");
          }}
        >
          Post
        </button>
      </div>
    </div>
  );
}


function ProfilePage() {
  const profile = useQuery(api.connections.getMyProfile);
  const { viewer } = useQuery(api.myFunctions.listNumbers, { count: 10 }) ?? {};
  const upsertProfile = useMutation(api.connections.upsertProfile);
  
  const [isEditing, setIsEditing] = useState(false);
  const [role, setRole] = useState<"mentor" | "mentee" | "both">("mentee");
  const [bio, setBio] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [interestsInput, setInterestsInput] = useState("");

  // Initialize form when profile loads
  if (profile && !isEditing) {
    if (bio === "" && profile.bio) {
      setBio(profile.bio);
      setSkillsInput(profile.skills?.join(", ") || "");
      setInterestsInput(profile.interests?.join(", ") || "");
      setRole(profile.role);
    }
  }

  if (profile === undefined || viewer === undefined) {
    return <div className="text-center p-8">Loading profile...</div>;
  }

  const handleSave = async () => {
    try {
      await upsertProfile({
        role,
        bio: bio || undefined,
        skills: skillsInput
          ? skillsInput.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
        interests: interestsInput
          ? interestsInput.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined,
      });
      setIsEditing(false);
      alert("Profile updated!");
    } catch (error: any) {
      alert(error.message || "Failed to update profile");
    }
  };

  // If no profile exists, show setup form
  if (!profile) {
    return (
      <div className="max-w-2x1 mx-auto">
        <h2 className="text-3xl font-bold mb-6">Set Up Your Profile</h2>
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "mentor" | "mentee" | "both")}
                className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="mentor">Mentor</option>
                <option value="mentee">Mentee</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="e.g. JavaScript, React, Node.js"
                className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Interests (comma-separated)
              </label>
              <input
                type="text"
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
                placeholder="e.g. Web Development, AI, Mobile Apps"
                className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Create Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If editing, show edit form
  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Edit Profile</h2>
          <button
            onClick={() => setIsEditing(false)}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          >
            Cancel
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "mentor" | "mentee" | "both")}
                className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="mentor">Mentor</option>
                <option value="mentee">Mentee</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="e.g. JavaScript, React, Node.js"
                className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Interests (comma-separated)
              </label>
              <input
                type="text"
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
                placeholder="e.g. Web Development, AI, Mobile Apps"
                className="w-full p-3 border rounded-xl bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Display mode
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">My Profile</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
        >
          Edit Profile
        </button>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              viewer ?? "?"
            )}&background=7c3aed&color=fff&size=128`}
            alt="Profile avatar"
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h3 className="text-2xl font-bold">{viewer}</h3>
            <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-full text-sm font-semibold capitalize mt-2">
              {profile.role}
            </span>
          </div>
        </div>

        {profile.bio && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400 mb-1">Bio</h4>
            <p className="text-slate-800 dark:text-slate-200">{profile.bio}</p>
          </div>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.interests && profile.interests.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400 mb-2">Interests</h4>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  return (
    <>
      {isAuthenticated && (
        <button
          className="bg-slate-200 dark:bg-slate-800 text-dark dark:text-light rounded-md px-4 py-2 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      )}
    </>
  );
}

function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  
  return (
    <div className="flex flex-col gap-8 w-96 mx-auto mt-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Welcome!</h2>
        <p className="text-slate-600 dark:text-slate-400">Sign in to continue</p>
      </div>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData).catch((error) => {
            setError(error.message);
          });
        }}
      >
        <input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-xl p-3 border-2 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="email"
          name="email"
          placeholder="Email"
        />
        <input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-xl p-3 border-2 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="password"
          name="password"
          placeholder="Password"
        />
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 font-semibold transition"
          type="submit"
        >
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </button>
        <div className="flex flex-row gap-2 text-sm justify-center">
          <span>
            {flow === "signIn"
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>
          <span
            className="text-indigo-600 dark:text-indigo-400 underline hover:no-underline cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up" : "Sign in"}
          </span>
        </div>
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl p-3">
            <p className="text-red-700 dark:text-red-300 font-mono text-xs">
              {error}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}