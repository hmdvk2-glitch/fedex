"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
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
    <div className="flex flex-col min-h-screen font-sans bg-white text-gray-900">
      {/* SECTION 1: Top Navigation */}
      <header className="bg-[#4D148C] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight">
                <span className="text-white">Fed</span>
                <span className="text-[#FF6600]">Ex</span>
              </Link>
              <nav className="hidden md:flex gap-6 font-semibold text-sm">
                <Link href="/dashboard/customer" className="hover:text-gray-200">Shipping</Link>
                <Link href="/track" className="hover:text-gray-200">Tracking</Link>
                <Link href="#" className="hover:text-gray-200">Support</Link>
                <Link href="/dashboard" className="hover:text-gray-200">Account</Link>
              </nav>
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold">
              <Link href="/register" className="hover:text-gray-200">Sign Up</Link>
              <Link href="/login" className="flex items-center gap-1 hover:text-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Log In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* SECTION 2: Hero */}
      <section className="relative bg-gray-100">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop" 
            alt="Logistics" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 md:py-32">
          <h1 className="text-4xl md:text-5xl font-light text-white mb-8 max-w-2xl">
            Where now meets next.
          </h1>

          <div className="bg-white rounded-lg shadow-xl max-w-3xl overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button className="flex-1 py-4 text-center font-bold text-gray-600 hover:text-purple-700 bg-gray-50 hover:bg-white border-r border-gray-200">RATE & TRANSIT TIMES</button>
              <button className="flex-1 py-4 text-center font-bold text-purple-700 bg-white border-t-4 border-t-[#FF6600]">TRACK</button>
              <button className="flex-1 py-4 text-center font-bold text-gray-600 hover:text-purple-700 bg-gray-50 hover:bg-white border-l border-gray-200">SHIP</button>
            </div>
            
            <div className="p-6 md:p-8">
              <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Tracking ID"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="flex-1 px-4 py-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600 text-lg"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#FF6600] hover:bg-[#e65c00] text-white px-8 py-4 rounded font-bold text-lg disabled:opacity-50 transition uppercase tracking-wide"
                >
                  {loading ? "Searching..." : "Track"}
                </button>
              </form>

              {/* Live Tracking Result Rendering */}
              {error && (
                <div className="mt-6 bg-red-50 text-red-700 p-4 rounded text-sm">
                  {error}
                </div>
              )}

              {result && (
                <div className="mt-6 border border-gray-200 rounded p-6 bg-gray-50">
                  <h3 className="font-bold text-lg text-purple-800 mb-2">Tracking: <span className="font-mono text-gray-900">{result.parcel.tracking_number}</span></h3>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <p className="text-gray-600">Status: <span className="font-bold text-gray-900">{result.parcel.status}</span></p>
                    <p className="text-gray-600">From: <span className="font-bold text-gray-900">{result.parcel.pickup_address}</span></p>
                    <p className="text-gray-600">To: <span className="font-bold text-gray-900">{result.parcel.delivery_address}</span></p>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-bold text-sm mb-2 text-gray-700">History</h4>
                    <ul className="space-y-2">
                      {result.history.map((h: any) => (
                        <li key={h.id} className="text-sm flex gap-4 text-gray-600">
                          <span className="text-gray-400 w-32">{new Date(h.timestamp).toLocaleString()}</span>
                          <span className="font-semibold text-gray-800">{h.status}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Account CTA Banner */}
      <section className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 flex flex-col md:flex-row items-center justify-between border-l-4 border-[#4D148C]">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-2">Manage your shipments easily</h2>
              <p className="text-gray-600">Sign up for a FedEx account and get exclusive rates and tracking benefits.</p>
            </div>
            <Link href="/register" className="mt-6 md:mt-0 bg-[#4D148C] hover:bg-purple-900 text-white px-8 py-3 rounded-full font-bold transition">
              Open an Account
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-light text-center mb-12 text-gray-800">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Express Delivery", desc: "Fastest option for urgent shipments.", link: "/dashboard/customer" },
              { title: "Same Day Delivery", desc: "Door-to-door delivery within hours.", link: "/dashboard/customer" },
              { title: "Interstate Shipping", desc: "Reliable shipping across Nigeria.", link: "/dashboard/customer" },
              { title: "International Shipping", desc: "Connect with over 220 countries.", link: "/dashboard/customer" },
              { title: "Corporate Logistics", desc: "Tailored solutions for your business.", link: "/dashboard" },
              { title: "Warehousing", desc: "Secure storage and fulfillment.", link: "/dashboard" },
            ].map((srv, i) => (
              <div key={i} className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition bg-white">
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[#4D148C] opacity-10 group-hover:opacity-20 transition"></div>
                  <img src={`https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop&sig=${i}`} alt={srv.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{srv.title}</h3>
                  <p className="text-gray-600 mb-4">{srv.desc}</p>
                  <Link href={srv.link} className="text-[#4D148C] font-bold hover:underline flex items-center gap-1">
                    Learn More <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: Business Resources */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-light text-center mb-12 text-gray-800">Business Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded shadow-sm border-t-4 border-[#FF6600]">
              <h3 className="text-lg font-bold mb-4 text-[#4D148C]">E-commerce Solutions</h3>
              <p className="text-sm text-gray-600 mb-6">Integrate our shipping APIs seamlessly into your online store.</p>
              <Link href="#" className="text-[#FF6600] font-bold hover:underline text-sm uppercase tracking-wide">Explore APIs</Link>
            </div>
            <div className="bg-white p-8 rounded shadow-sm border-t-4 border-[#FF6600]">
              <h3 className="text-lg font-bold mb-4 text-[#4D148C]">Packaging Guide</h3>
              <p className="text-sm text-gray-600 mb-6">Learn how to pack your items securely for safe transit.</p>
              <Link href="#" className="text-[#FF6600] font-bold hover:underline text-sm uppercase tracking-wide">View Guide</Link>
            </div>
            <div className="bg-white p-8 rounded shadow-sm border-t-4 border-[#FF6600]">
              <h3 className="text-lg font-bold mb-4 text-[#4D148C]">Customs Clearance</h3>
              <p className="text-sm text-gray-600 mb-6">Navigate international shipping regulations with ease.</p>
              <Link href="#" className="text-[#FF6600] font-bold hover:underline text-sm uppercase tracking-wide">Get Help</Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Trust Indicators */}
      <section className="bg-[#4D148C] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div><h4 className="text-3xl font-bold mb-2 text-[#FF6600]">220+</h4><p className="text-sm">Countries & Territories</p></div>
            <div><h4 className="text-3xl font-bold mb-2 text-[#FF6600]">100%</h4><p className="text-sm">Secure Handling</p></div>
            <div><h4 className="text-3xl font-bold mb-2 text-[#FF6600]">24/7</h4><p className="text-sm">Support Availability</p></div>
            <div><h4 className="text-3xl font-bold mb-2 text-[#FF6600]">Live</h4><p className="text-sm">Real-time Tracking</p></div>
            <div><h4 className="text-3xl font-bold mb-2 text-[#FF6600]">Fast</h4><p className="text-sm">Delivery Speeds</p></div>
          </div>
        </div>
      </section>

      {/* SECTION 7: Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h5 className="text-white font-bold mb-4">Our Company</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition">About FedEx</Link></li>
              <li><Link href="#" className="hover:text-white transition">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition">Conditions of Carriage</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4">Customer Support</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-white transition">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-white transition">Track a Parcel</Link></li>
              <li><Link href="#" className="hover:text-white transition">File a Claim</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4">Language</h5>
            <select className="bg-gray-800 border border-gray-700 text-white text-sm rounded focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5">
              <option>English</option>
              <option>French</option>
            </select>
          </div>
          <div>
            <h5 className="text-white font-bold mb-4">Follow Us</h5>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 cursor-pointer"></div>
              <div className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 cursor-pointer"></div>
              <div className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 cursor-pointer"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© FedEx 1995-2026</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition">Terms of Use</Link>
            <Link href="#" className="hover:text-white transition">Security & Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
