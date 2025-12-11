import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/UserService';
import { useAuth } from '../context/AuthContext';
import { Package } from 'lucide-react';
import { toast } from 'react-toastify';
import LoginForm from '../components/LoginForm';

interface LoginFormData {
    username: string;
    password: string;
}

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (formData: LoginFormData): Promise<void> => {
        setIsLoading(true);

        try {
            const response = await loginUser(formData.username, formData.password);
            login(response);

            toast.success('Login successful! Welcome to your POS system.');

            // Redirect based on role
            if (response.userDTO.role === 'Admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Invalid username or password. Please try again.';
            toast.error(errorMessage);
            
            // Re-throw error so LoginForm can handle it
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                ></div>
            </div>

            {/* Login Container */}
            <div className="w-full max-w-md relative">
                {/* Main Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="bg-white/20 p-3 rounded-full">
                                <Package className="w-8 h-8 text-white" />
                            </div>
                        </div>
                     <h1 className="text-2xl font-bold text-white mb-2">N I テンポ japan shop</h1>
                        <p className="text-blue-100 text-sm">Point Of Sales System</p>
                    </div>

                    {/* Form Content */}
                    <div className="px-8 py-8">
                        <div className="mb-8 text-center">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome Back</h2>
                            <p className="text-gray-600 text-sm">Please sign in to your account</p>
                        </div>

                        {/* Login Form Component */}
                        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

                        {/* Additional Links */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">
                                    Need help? Contact your{' '}
                                    <button 
                                        type="button"
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                        onClick={() => toast.info('Contact your system administrator for help.')}
                                    >
                                        system administrator
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="mt-6 text-center">
                    <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-600">System Online</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <p className="text-xs text-gray-500">© 2025 POSSystem. All rights reserved.</p>
            </div>
        </div>
    );
};

export default LoginPage;