import React, { useEffect, useState, useCallback, memo, type Dispatch,type  SetStateAction } from "react";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import type { UserDTO } from "../types/Auth";
import { changeUserPassword, updateUserAdmin } from "../services/UserService";
import { toast } from "react-toastify";

interface UserProfileProps {
    loggedInUser: UserDTO | null;
    setLoggedInUser: Dispatch<SetStateAction<UserDTO | null>>;
    showPassword: boolean;
    setShowPassword: Dispatch<SetStateAction<boolean>>;
    showNewPassword: boolean;
    setShowNewPassword: Dispatch<SetStateAction<boolean>>;
    showConfirmPassword: boolean;
    setShowConfirmPassword: Dispatch<SetStateAction<boolean>>;
    currentPassword: string;
    setCurrentPassword: Dispatch<SetStateAction<string>>;
    newPassword: string;
    setNewPassword: Dispatch<SetStateAction<string>>;
    confirmPassword: string;
    setConfirmPassword: Dispatch<SetStateAction<string>>;
    handleUpdateProfile: () => Promise<void>;
    handleChangePassword: () => Promise<void>;
}

const UserProfile = memo(({
    loggedInUser,
    setLoggedInUser,
    showPassword,
    setShowPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    handleUpdateProfile,
    handleChangePassword
}: UserProfileProps) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Details */}
        {loggedInUser ? (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <User className="mr-2" size={20} /> User Details
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            key="email-input"
                            type="email"
                            value={loggedInUser.email}
                            onChange={(e) =>
                                setLoggedInUser({ ...loggedInUser, email: e.target.value })
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Role
                        </label>
                        <input
                            type="text"
                            value={loggedInUser.role}
                            readOnly
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
                        />
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        type="button"
                        onClick={handleUpdateProfile}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Update Profile
                    </button>
                </div>
            </div>
        ) : (
            <p>Loading profile...</p>
        )}

        {/* Password Change */}
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Lock className="mr-2" size={20} />
                Change Password
            </h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Current Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10"
                            placeholder="Enter current password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10"
                            placeholder="Enter new password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10"
                            placeholder="Confirm new password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-6">
                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600" onClick={handleChangePassword}>
                    Update Password
                </button>
            </div>

            {/* Password Requirements */}
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Contains uppercase and lowercase letters</li>
                    <li>• Contains at least one number</li>
                    <li>• Contains at least one special character</li>
                </ul>
            </div>
        </div>
    </div>
));

export const UserSettings: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loggedInUser, setLoggedInUser] = useState<UserDTO | null>(null);

    useEffect(() => {
        const loggedInUserString = localStorage.getItem("user");
        if (loggedInUserString) {
            try {
                setLoggedInUser(JSON.parse(loggedInUserString) as UserDTO);
            } catch (error) {
                console.error("Error parsing user from localStorage:", error);
            }
        }
    }, []);

    const handleUpdateProfile = useCallback(async () => {
        if (!loggedInUser) return;

        try {
            await updateUserAdmin(loggedInUser.userId, loggedInUser);
            toast.success("Profile updated successfully");
            localStorage.setItem("user", JSON.stringify(loggedInUser));
        } catch (error: unknown) {
            console.error(
                "Update error:",
                error instanceof Error ? error.message : error
            );
            toast.error("Profile update failed");
        }
    }, [loggedInUser]);

    const handleChangePassword = useCallback(async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New password and confirm password do not match");
            return;
        }

        if (!loggedInUser) {
            toast.error("User not logged in");
            return;
        }

        try {
            await changeUserPassword(loggedInUser.userId, currentPassword, newPassword);
            toast.success("Password updated successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: unknown) {
            toast.error("Failed to update password. Please try again.");
        }
    }, [currentPassword, newPassword, confirmPassword, loggedInUser]);

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-6">User Settings</h1>
            <UserProfile
                loggedInUser={loggedInUser}
                setLoggedInUser={setLoggedInUser}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showNewPassword={showNewPassword}
                setShowNewPassword={setShowNewPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmPassword={confirmPassword}
                setConfirmPassword={setConfirmPassword}
                handleUpdateProfile={handleUpdateProfile}
                handleChangePassword={handleChangePassword}
            />
        </div>
    );
};
