"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [shipments, setShipments] = useState([]);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  useEffect(() => {
    checkAuth();
    fetchShipments();
  }, []);

  const checkAuth = async () => {
    const token = document.cookie.includes("token");
    if (!token) router.push("/login");
  };

  const fetchShipments = async () => {
    const res = await fetch("/api/parcels");
    const data = await res.json();
    setShipments(data);
  };

  const createShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/shipments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tracking_number: trackingNumber,
        customer_name: customerName,
        customer_email: customerEmail,
        pickup_address: pickupAddress,
        delivery_address: deliveryAddress,
      }),
    });
    if (res.ok) {
      alert("Shipment created!");
      fetchShipments();
      setTrackingNumber("");
      setCustomerEmail("");
      setCustomerName("");
      setPickupAddress("");
      setDeliveryAddress("");
    } else {
      alert("Error creating shipment");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-700 mb-6">Admin Dashboard</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Create New Shipment</h2>
          <form onSubmit={createShipment} className="space-y-4">
            <input type="text" placeholder="Tracking Number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="w-full p-2 border rounded" required />
            <input type="text" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full p-2 border rounded" required />
            <input type="email" placeholder="Customer Email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full p-2 border rounded" required />
            <textarea placeholder="Pickup Address" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} className="w-full p-2 border rounded" required />
            <textarea placeholder="Delivery Address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="w-full p-2 border rounded" required />
            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Create Shipment</button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">All Shipments</h2>
          <div className="space-y-2">
            {shipments.map((shipment: any) => (
              <div key={shipment.id} className="border p-3 rounded">
                <p><strong>Tracking:</strong> {shipment.tracking_number}</p>
                <p><strong>Customer:</strong> {shipment.customer_name}</p>
                <p><strong>Status:</strong> {shipment.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
