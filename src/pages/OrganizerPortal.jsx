import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addDonationCamp, getDonationCamps } from '../lib/firestore';
import { MapPin, Calendar, Phone, User, Save, Plus, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LocationPickerMap from '../components/LocationPickerMap';

export default function OrganizerPortal() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state
  const [campName, setCampName] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 40.7128, lng: -74.0060 }); // Default to NY

  const [message, setMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadCamps();
    }
  }, [currentUser]);

  const loadCamps = async () => {
    try {
      const data = await getDonationCamps();
      // Filter to show only upcoming camps (today or future)
      const today = new Date().toISOString().split('T')[0];
      const upcoming = data.filter(camp => camp.date >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setCamps(upcoming);
    } catch (error) {
      console.error("Error loading camps:", error);
    }
  };

  const handleLocationSelect = (locationData) => {
    setCoordinates({ lat: locationData.lat, lng: locationData.lng });
    if (locationData.address) {
      setAddress(locationData.address);
    }
  };

  const handleAddCamp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDonationCamp(currentUser.uid, {
        campName,
        organizerName,
        contact,
        address,
        date,
        startTime,
        endTime,
        location: coordinates
      });

      setMessage('Donation camp added successfully!');
      // Reset form
      setCampName('');
      setOrganizerName('');
      setContact('');
      setAddress('');
      setDate('');
      setStartTime('');
      setEndTime('');

      // Reload list
      loadCamps();

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error adding camp:", error);
      setMessage('Error adding camp. Please try again.');
    }
    setLoading(false);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-slate-600 mt-2">Please log in to access the Organizer Portal.</p>
          <button onClick={() => navigate('/login')} className="mt-4 text-brand-600 font-bold underline">Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Organizer Portal</h1>
            <p className="mt-2 text-slate-600">Manage blood donation camps and events.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Camp Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Plus className="h-5 w-5 text-brand-500" />
                Add New Camp
              </h2>

              {message && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleAddCamp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Camp Name</label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
                    value={campName}
                    onChange={(e) => setCampName(e.target.value)}
                    placeholder="e.g. City Center Blood Drive"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Organizer Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
                      value={organizerName}
                      onChange={(e) => setOrganizerName(e.target.value)}
                      placeholder="e.g. Red Cross NY"
                    />
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                    <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Time (24h)</label>
                    <div className="relative">
                      <input
                        type="time"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                      />
                      <Clock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">End Time (24h)</label>
                    <div className="relative">
                      <input
                        type="time"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                      <Clock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location / Address</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 123 Main St, New York"
                    />
                    <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="+1 234 567 8900"
                    />
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
                >
                  {loading ? 'Adding...' : (
                    <>
                      <Save className="h-5 w-5" />
                      Publish Camp
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Map & List Placeholder */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-h-[400px] flex flex-col">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Camp Location Selector</h2>
              <p className="text-sm text-slate-500 mb-4">
                Search for a venue or drag the marker to pinpoint the exact location. The address will update automatically.
              </p>
              <LocationPickerMap onLocationSelect={handleLocationSelect} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Upcoming Camps</h2>
              {camps.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No upcoming donation camps found.</p>
              ) : (
                <div className="grid gap-4">
                  {camps.map(camp => (
                    <div key={camp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-brand-200 transition-colors">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{camp.campName}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          <User className="h-3 w-3" /> Organized by {camp.organizerName}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {camp.address}
                        </p>
                      </div>
                      <div className="mt-3 sm:mt-0 text-right">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-medium">
                          <Calendar className="h-3.5 w-3.5" />
                          {camp.date}
                        </div>
                        {camp.startTime && camp.endTime && (
                          <div className="mt-1 flex items-center justify-end gap-1 text-xs text-slate-500 font-medium">
                            <Clock className="h-3 w-3" />
                            {camp.startTime} - {camp.endTime}
                          </div>
                        )}
                        <p className="text-sm text-slate-400 mt-1">{camp.contact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
