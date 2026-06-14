"use client";

import { useState } from "react";

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/track/${encodeURIComponent(trackingNumber.trim())}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Parcel not found");
        }
        throw new Error("Failed to search");
      }
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-purple-700 mb-6">FedEx Public Tracking</h1>

        <form onSubmit={handleTrack} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Enter Tracking Number (e.g. FX-12345)"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50 transition"
          >
            {loading ? "Searching..." : "Track Parcel"}
          </button>
        </form>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center mb-6">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Shipment Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <p><strong>Tracking Number:</strong> <span className="font-mono">{result.parcel.tracking_number}</span></p>
                <p><strong>Current Status:</strong> <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">{result.parcel.status}</span></p>
                <p><strong>Origin:</strong> {result.parcel.pickup_address}</p>
                <p><strong>Destination:</strong> {result.parcel.delivery_address}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Tracking History</h2>
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-200">
                {result.history.map((event: any, index: number) => (
                  <div key={event.id} className="flex gap-4 relative items-start">
                    <div className="w-6 h-6 rounded-full bg-purple-600 border-4 border-white flex items-center justify-center z-10 shadow-sm" />
                    <div className="flex-1">
                      <p className="font-bold text-purple-700">{event.status}</p>
                      {event.location && <p className="text-sm text-gray-500">{event.location}</p>}
                      <p className="text-xs text-gray-400">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
