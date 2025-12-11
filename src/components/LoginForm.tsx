import { useState, useRef, useCallback } from 'react';
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface FormErrors {
    username?: string;
    password?: string;
}

interface LoginFormData {
    username: string;
    password: string;
}

interface LoginFormProps {
    onSubmit: (formData: LoginFormData) => Promise<void>;
    isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
            toast.error('Username is required');
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
            if (isValid) toast.error('Password is required');
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            if (isValid) toast.error('Password must be at least 6 characters');
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = useCallback(async () => {
        if (isLoading) return;
        
        if (!validateForm()) return;

        try {
            await onSubmit(formData);
            // Reset form on successful submission
            setFormData({ username: '', password: '' });
            setErrors({});
        } catch (error) {
            // Only clear password on error, keep username
            setFormData(prev => ({ 
                ...prev, 
                password: '' 
            }));
            
            setErrors({ password: 'Invalid credentials' });
            
            // Focus password field after error
            setTimeout(() => {
                passwordRef.current?.focus();
            }, 100);
        }
    }, [formData, isLoading, onSubmit]);

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit();
        return false;
    };

    const handleUsernameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            passwordRef.current?.focus();
        }
    };

    const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit();
    };

    return (
        <form 
            className="space-y-6" 
            onSubmit={handleFormSubmit}
            method="POST"
            action="#"
        >
            {/* Username Field */}
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        ref={usernameRef}
                        onKeyDown={handleUsernameKeyDown}
                        disabled={isLoading}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                            errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter your username"
                        autoComplete="username"
                    />
                </div>
                {errors.username && (
                    <div className="mt-2 flex items-center text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.username}
                    </div>
                )}
            </div>

            {/* Password Field */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        ref={passwordRef}
                        onKeyDown={handlePasswordKeyDown}
                        disabled={isLoading}
                        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                            errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50"
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                    </button>
                </div>
                {errors.password && (
                    <div className="mt-2 flex items-center text-sm text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.password}
                    </div>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="button"
                onClick={handleButtonClick}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium text-base hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
                {isLoading ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Signing in...</span>
                    </>
                ) : (
                    <span>Sign In</span>
                )}
            </button>
        </form>
    );
};

export default LoginForm;