import React, { useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [passwordWarning, setPasswordWarning] = useState<string | null>(null);
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false);

  const navigate = useNavigate();

  const allowedSymbols = '!@#$%^&*()_+-=[]{};:,.?/';

  const escapeRegex = (str: string) =>
    str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

  const validatePasswordStrength = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasSymbol = new RegExp(`[${escapeRegex(allowedSymbols)}]`).test(password);
    const onlyValidChars = new RegExp(`^[A-Za-z0-9${escapeRegex(allowedSymbols)}]*$`).test(password);

    if (!hasMinLength) {
      setPasswordWarning('Password must be at least 8 characters.');
    } else if (!hasNumber) {
      setPasswordWarning('Password must include at least one number.');
    } else if (!hasSymbol) {
      setPasswordWarning('Password must include at least one symbol.');
    } else if (!onlyValidChars) {
      setPasswordWarning('Password contains invalid characters.');
    } else {
      setPasswordWarning(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'password') validatePasswordStrength(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { email, password, confirmPassword } = formData;

    if (!email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (passwordWarning) {
      setError(passwordWarning);
      return;
    }

    console.log('Form submitted:', formData);
    // TODO: Connect to signup API
  };

  return (
    <div className="min-h-screen bg-darkBg text-textLight">
      <Header />

      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] px-4">
        <div className="w-full max-w-md rounded-2xl bg-cardBg p-8 shadow-xl">
          <h2 className="mb-6 text-center text-2xl font-bold">Sign Up</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm text-textMuted">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-borderGreen bg-darkBg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryGreen"
              />
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center text-sm text-textMuted">
                Password
                <div className="relative ml-1">
                  <span className="peer text-xs text-primaryGreen border border-borderGreen rounded-full px-1.5 pb-[1px] ml-1 cursor-pointer">
                    ⓘ
                  </span>
                  <div className="absolute left-1/2 top-full z-10 w-72 -translate-x-1/2 mt-1 rounded-lg bg-gray-800 text-xs text-white p-3 shadow-lg opacity-0 peer-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <p className="font-semibold mb-1">Password Requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Minimum length: 8</li>
                      <li>At least 1 number</li>
                      <li>At least 1 symbol from:</li>
                    </ul>
                    <code className="block mt-1 break-all text-primaryGreen">
                      {allowedSymbols}
                    </code>
                  </div>
                </div>
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                required
                className="w-full mt-1 rounded-lg border border-borderGreen bg-darkBg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryGreen"
              />

              {passwordFocused && passwordWarning && (
                <p className="mt-1 text-xs text-negative">{passwordWarning}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-textMuted">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full mt-1 rounded-lg border border-borderGreen bg-darkBg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaryGreen"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-negative -mt-2 mb-1">{error}</p>
            )}

            {/* Submit + Cancel */}
            <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primaryGreenHover text-textLight hover:bg-primaryGreen hover:text-primaryGreenHover px-4 py-2 transition-colors duration-150"
                >
                  Create Account
                </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full rounded-lg bg-negative text-white hover:bg-negativeHover px-4 py-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
