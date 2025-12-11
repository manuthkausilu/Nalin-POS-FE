import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaLock, FaBookOpen, FaEye, FaEyeSlash, FaUserPlus } from 'react-icons/fa';
import { BiLoader } from 'react-icons/bi';
import { registerUser } from '../../services/UserService';
import { Link, useNavigate } from 'react-router-dom';

// Update the signup request type to match the API
type SignupRequest = {
    userName: string;
    password: string;
    email: string;
    role: string;
    isActive: boolean;
};

const SignupSVG = () => (
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-h-80">
        {/* Simple signup/welcome illustration */}
        <rect x="50" y="100" width="300" height="200" rx="30" fill="#a5b4fc" />
        <circle cx="200" cy="180" r="40" fill="#fff" />
        <rect x="150" y="230" width="100" height="20" rx="10" fill="#fff" />
        <rect x="180" y="260" width="40" height="20" rx="10" fill="#fff" />
        <circle cx="200" cy="180" r="18" fill="#6366f1" />
        <rect x="120" y="70" width="160" height="30" rx="15" fill="#6366f1" />
    </svg>
);

const SignUpPage: React.FC = () => {
    const [formData, setFormData] = useState<SignupRequest>({
        userName: '',
        password: '',
        email: '',
        role: 'User',
        isActive: true,
    });
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Partial<SignupRequest>>({});

    const validateForm = (): boolean => {
        const errors: Partial<SignupRequest> = {};

        if (!formData.userName.trim()) errors.userName = 'Username is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
        if (!formData.password) errors.password = 'Password is required';
        else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const target = e.target as HTMLInputElement | HTMLSelectElement;
        const { name, value, type } = target;
        const checked = (target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));

        if (fieldErrors[name as keyof SignupRequest]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) return;

        setLoading(true);
        try {
            await registerUser(formData);
            navigate('/login');
            setSuccess('Account created successfully! Please log in.');
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess('');
                setError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
                {/* Form Side */}
                <div className="w-full md:w-1/2 flex flex-col justify-center p-8">
                    {/* Header */}
                    <div className="text-center mb-8 md:hidden">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
                            <FaBookOpen className="text-white text-2xl" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-indigo-800 tracking-tight mb-2 font-serif">Join Our Library</h1>
                        <p className="text-lg text-indigo-600 mb-8 font-medium">Create your account to access thousands of books</p>
                        <SignupSVG />
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                            {success}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="userName"
                                    value={formData.userName}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${fieldErrors.userName ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="johndoe"
                                />
                            </div>
                            {fieldErrors.userName && (
                                <p className="mt-1 text-xs text-red-600">{fieldErrors.userName}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${fieldErrors.email ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="john@example.com"
                                />
                            </div>
                            {fieldErrors.email && (
                                <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${fieldErrors.password ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                            )}
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Role
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors border-gray-300"
                            >
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        {/* Is Active */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="mr-2"
                                id="isActive"
                            />
                            <label htmlFor="isActive" className="text-sm text-gray-700">
                                Active
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <BiLoader className="animate-spin text-xl" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <FaUserPlus />
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-semibold">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
                {/* SVG/Text Side */}
                <div className="hidden md:flex flex-col justify-center items-center bg-indigo-50 w-1/2 p-8">
                    <h2 className="text-4xl font-extrabold text-indigo-800 tracking-tight mb-2 font-serif">Create Your Account</h2>
                    <p className="text-lg text-indigo-600 mb-8 text-center font-medium">Sign up and start exploring a world of books!</p>
                    <SignupSVG />
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;


