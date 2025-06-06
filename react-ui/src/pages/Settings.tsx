import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

const Settings: React.FC = () => {
  const { user, token, setUser } = useAuth();
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage("Profile updated!");
        setEdit(false);
        if (user) {
          setUser({ ...user, name: form.name, email: form.email });
        }
      } else {
        setMessage("Update failed.");
      }
    } catch {
      setMessage("Server error.");
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-8 card">
        <h2 className="text-2xl font-bold mb-4">Settings</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              className="input"
              value={form.email}
              disabled={!edit}
              onChange={handleChange}
              type="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              className="input"
              value={form.name}
              disabled={!edit}
              onChange={handleChange}
              type="text"
            />
          </div>
          {edit ? (
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary flex-1">
                Save
              </button>
              <button
                type="button"
                className="btn btn-negative flex-1"
                onClick={() => {
                  setEdit(false);
                  setForm({ name: user?.name || "", email: user?.email || "" });
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={() => setEdit(true)}
            >
              Edit
            </button>
          )}
          {message && <div className="text-center mt-2">{message}</div>}
        </form>
      </div>
    </Layout>
  );
};

export default Settings;
