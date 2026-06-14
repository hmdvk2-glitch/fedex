"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerDashboard() {
  const router = useRouter();
  const [parcels, setParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const hasToken = document.cookie.includes("token");
    if (!hasToken) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/parcels");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch parcels");
      }
      const data = await res.json();
      if (data.success) {
        setParcels(data.data || []);
      } else {
        setError(data.error || "Failed to load parcels");
      }
    } catch (err) {
      setError("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-purple-700">Customer Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading shipments...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        ) : parcels.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <p className="text-gray-500 text-xl mb-4">No shipments found.</p>
            <p className="text-gray-400 text-sm">Once a shipment is booked for your email, it will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-50 text-purple-700 font-bold border-b">
                  <th className="p-4">Tracking Number</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Origin</th>
                  <th className="p-4">Destination</th>
                  <th className="p-4">Created Date</th>
                </tr>
              </thead>
              <tbody>
                {parcels.map((parcel) => (
                  <tr key={parcel.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-mono font-bold text-gray-800">{parcel.tracking_number}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
                        {parcel.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{parcel.pickup_address}</td>
                    <td className="p-4 text-gray-600">{parcel.delivery_address}</td>
                    <td className="p-4 text-gray-500">
                      {new Date(parcel.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
