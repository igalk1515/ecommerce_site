"use client";
import { useState } from "react";
import { api } from "../../../lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin123!");
  return (
    <main className="container py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">כניסת מנהל</h1>
      <form className="card space-y-2" onSubmit={async (e) => {
        e.preventDefault();
        await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
        window.location.href = "/admin";
      }}>
        <input className="border p-2 rounded w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border p-2 rounded w-full" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn w-full">כניסה</button>
      </form>
    </main>
  );
}
