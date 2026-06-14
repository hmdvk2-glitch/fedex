"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        document.cookie = `token=${data.token}; path=/; max-age=604800`;
        if (data.user.role === "admin") {
          router.push("/dashboard/admin");
        } else {
          router.push("/dashboard/customer");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center text-purple-700 mb-6">FedEx Courier Login</h1>
        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg mb-4" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg mb-4" required />
          <button type="submit" disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center mt-4">Don't have an account? <Link href="/register" className="text-purple-600">Register</Link></p>
        <p className="text-center text-sm text-gray-500 mt-4">Admin: admin@fedex.com / admin123</p>
      </div>
    </div>
  );
}
