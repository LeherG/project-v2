// src/ConnectionsFeature.tsx
// Updated version without the Profile Editor tab

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

export default function ConnectionsFeature() {
  const [activeTab, setActiveTab] = useState("browse");
  const profile = useQuery(api.connections.getMyProfile);

  // If user hasn't set up profile, prompt them
  if (profile === undefined) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl text-center">
        <h2 className="text-2xl font-bold mb-4">Set Up Your Profile First</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Before you can browse connections, please set up your profile in the "My Profile" tab.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mentor-Mentee Connections</h1>
      
      <div className="mb-6 flex gap-2 border-b">
        <TabButton
          active={activeTab === "browse"}
          onClick={() => setActiveTab("browse")}
        >
          Browse {profile.role === "mentor" ? "Mentees" : "Mentors"}
        </TabButton>
        <TabButton
          active={activeTab === "requests"}
          onClick={() => setActiveTab("requests")}
        >
          Requests
        </TabButton>
        <TabButton
          active={activeTab === "connections"}
          onClick={() => setActiveTab("connections")}
        >
          My Connections
        </TabButton>
      </div>

      {activeTab === "browse" && (
        <BrowseUsers lookingFor={profile.role === "mentor" ? "mentees" : "mentors"} />
      )}
      {activeTab === "requests" && <PendingRequests />}
      {activeTab === "connections" && <MyConnections />}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium transition-colors ${
        active
          ? "border-b-2 border-blue-500 text-blue-500"
          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function BrowseUsers({ lookingFor }: { lookingFor: "mentors" | "mentees" }) {
  const users = useQuery(api.connections.browseUsers, { lookingFor });
  const sendRequest = useMutation(api.connections.sendConnectionRequest);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  if (users === undefined) {
    return <div className="text-center p-8">Loading users...</div>;
  }

  if (users.length === 0) {
    return (
      <div className="text-center p-8 text-slate-600 dark:text-slate-400">
        No {lookingFor} available right now. Check back later!
      </div>
    );
  }

  const handleSendRequest = async (userId: any) => {
    try {
      await sendRequest({ toUserId: userId, message: message || undefined });
      setSendingTo(null);
      setMessage("");
      alert("Connection request sent!");
    } catch (error: any) {
      alert(error.message || "Failed to send request");
    }
  };

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <div
          key={user.userId}
          className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg">{user.email}</h3>
              <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                {user.role}
              </span>
            </div>
            {sendingTo === user.userId ? (
              <button
                onClick={() => setSendingTo(null)}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={() => setSendingTo(user.userId)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
              >
                Connect
              </button>
            )}
          </div>

          {user.bio && (
            <p className="text-sm mb-2 text-slate-700 dark:text-slate-300">
              {user.bio}
            </p>
          )}

          {user.skills && user.skills.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Skills:{" "}
              </span>
              <span className="text-xs text-slate-700 dark:text-slate-300">
                {user.skills.join(", ")}
              </span>
            </div>
          )}

          {user.interests && user.interests.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Interests:{" "}
              </span>
              <span className="text-xs text-slate-700 dark:text-slate-300">
                {user.interests.join(", ")}
              </span>
            </div>
          )}

          {sendingTo === user.userId && (
            <div className="mt-4 p-3 bg-white dark:bg-slate-700 rounded">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message (optional)"
                className="w-full p-2 border rounded text-sm mb-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                rows={3}
              />
              <button
                onClick={() => handleSendRequest(user.userId)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm w-full"
              >
                Send Request
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PendingRequests() {
  const requests = useQuery(api.connections.getPendingRequests);
  const respond = useMutation(api.connections.respondToRequest);

  if (requests === undefined) {
    return <div className="text-center p-8">Loading requests...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="text-center p-8 text-slate-600 dark:text-slate-400">
        No pending requests
      </div>
    );
  }

  const handleRespond = async (requestId: any, accept: boolean) => {
    try {
      await respond({ requestId, accept });
      alert(accept ? "Request accepted!" : "Request rejected");
    } catch (error: any) {
      alert(error.message || "Failed to respond to request");
    }
  };

  return (
    <div className="grid gap-4">
      {requests.map((req) => (
        <div
          key={req.requestId}
          className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg"
        >
          <div className="mb-2">
            <h3 className="font-bold text-lg">{req.fromEmail}</h3>
            <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
              {req.fromRole}
            </span>
          </div>

          {req.fromBio && (
            <p className="text-sm mb-2 text-slate-700 dark:text-slate-300">
              {req.fromBio}
            </p>
          )}

          {req.message && (
            <div className="p-3 bg-blue-50 dark:bg-slate-700 rounded mb-3">
              <p className="text-sm italic text-slate-700 dark:text-slate-300">
                "{req.message}"
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => handleRespond(req.requestId, true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex-1"
            >
              Accept
            </button>
            <button
              onClick={() => handleRespond(req.requestId, false)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex-1"
            >
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function MyConnections() {
  const connections = useQuery(api.connections.getMyConnections);

  if (connections === undefined) {
    return <div className="text-center p-8">Loading connections...</div>;
  }

  const { mentors, mentees } = connections;

  return (
    <div className="grid gap-6">
      {mentors.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">My Mentors</h2>
          <div className="grid gap-3">
            {mentors.map((mentor) => (
              <ConnectionCard key={mentor.connectionId} user={mentor} />
            ))}
          </div>
        </div>
      )}

      {mentees.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">My Mentees</h2>
          <div className="grid gap-3">
            {mentees.map((mentee) => (
              <ConnectionCard key={mentee.connectionId} user={mentee} />
            ))}
          </div>
        </div>
      )}

      {mentors.length === 0 && mentees.length === 0 && (
        <div className="text-center p-8 text-slate-600 dark:text-slate-400">
          No connections yet. Start browsing to find mentors or mentees!
        </div>
      )}
    </div>
  );
}

function ConnectionCard({ user }: { user: any }) {
  return (
    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
      <h3 className="font-bold text-lg mb-1">{user.email}</h3>
      {user.bio && (
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
          {user.bio}
        </p>
      )}
      {user.skills && user.skills.length > 0 && (
        <div className="text-xs text-slate-600 dark:text-slate-400">
          Skills: {user.skills.join(", ")}
        </div>
      )}
      {user.interests && user.interests.length > 0 && (
        <div className="text-xs text-slate-600 dark:text-slate-400">
          Interests: {user.interests.join(", ")}
        </div>
      )}
    </div>
  );
}