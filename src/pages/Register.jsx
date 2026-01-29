import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Mail, Lock, AlertCircle, User, Building2, Building } from 'lucide-react';
import { createUserProfile } from '../lib/firestore';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState('user'); // 'user', 'organizer', or 'hospital'
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); // New state to block updates during redirect
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (role === 'hospital') {
      navigate('/hospital-signup');
      return;
    }

    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }

    if (role === 'organizer' && !organizationName.trim()) {
      return setError('Organization Name is required for organizers');
    }

    try {
      setError('');
      setLoading(true);
      setIsRedirecting(true); // Start blocking updates

      const userCredential = await signup(email, password, fullName);

      // Create user profile in Firestore
      const userData = {
        name: fullName,
        email: email,
        role: role
      };

      if (role === 'organizer') {
        userData.organizationName = organizationName;
      }

      // Wait for Firestore write to complete BEFORE navigating
      await createUserProfile(userCredential.user.uid, userData);

      // Force a small delay to ensure AuthContext picks up the new role if it re-fetches
      // though our manual navigation below should handle it.

      // Force a hard navigation to ensure state is clean and router picks up the new role
      window.location.href = role === 'organizer' ? '/organizer' : '/dashboard';

    } catch (err) {
      console.error(err);
      setError('Failed to create an account: ' + err.message);
      setIsRedirecting(false); // Reset on error
      setLoading(false);
    }
    // Don't set loading false on success to prevent UI flicker before redirect completes
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="relative">
            <Heart className="h-12 w-12 text-brand-500 fill-brand-500" />
            <div className="absolute inset-0 bg-brand-500 blur-lg opacity-20 rounded-full"></div>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200 sm:rounded-2xl sm:px-10 border border-slate-100">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">I am a...</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${role === 'user'
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                >
                  <User className={`h-5 w-5 mb-1 ${role === 'user' ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs">Donor/Seeker</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('organizer')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${role === 'organizer'
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                >
                  <Building2 className={`h-5 w-5 mb-1 ${role === 'organizer' ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs">Organizer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('hospital')}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${role === 'hospital'
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                >
                  <Building className={`h-5 w-5 mb-1 ${role === 'hospital' ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span className="font-bold text-xs">Hospital</span>
                </button>
              </div>
            </div>

            {role === 'organizer' && (
              <div>
                <label htmlFor="orgName" className="block text-sm font-medium text-slate-700">
                  Organization Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="orgName"
                    type="text"
                    required
                    className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-3"
                    placeholder="e.g. Red Cross NY"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {role === 'hospital' ? (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                <Building className="h-10 w-10 text-blue-500 mx-auto mb-2" />
                <h3 className="font-bold text-blue-900 mb-1">Hospital Registration</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Hospitals require additional verification details like License ID and Location.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/hospital-signup')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors"
                >
                  Go to Hospital Registration
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      required
                      className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-3"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                    Email address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-3"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-3"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password-confirm" className="block text-sm font-medium text-slate-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="password-confirm"
                      name="password-confirm"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-3"
                      placeholder="••••••••"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
