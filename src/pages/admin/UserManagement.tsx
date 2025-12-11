import React, { useState, useEffect } from 'react';
import { 
  registerUser, 
  getAllUsersAdmin, 
  updateUserAdmin, 
} from '../../services/UserService';
import { toast } from 'react-toastify';

interface User {
    userId: number;
    userName: string;
    email: string;
    role: string;
    isActive: boolean;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    role: '',
    password: '',
    isActive: true
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


    useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await getAllUsersAdmin();
      setUsers(response.userDTOList || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({ userName: '', email: '', role: '', password: '', isActive: true });
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      userName: user.userName,
      email: user.email,
      role: user.role,
      password: '',
      isActive: user.isActive
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedUser?.userId) {
        // Update existing user
        await updateUserAdmin(selectedUser.userId, {
          userName: formData.userName,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive
        });
      } else {
        // Create new user
        await registerUser({
          userName: formData.userName,
          email: formData.email,
          role: formData.role,
          password: formData.password,
          isActive: formData.isActive
        });
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = !user.isActive;
      // send explicit fields and set password to null when updating status
      await updateUserAdmin(Number(user.userId), {
        userName: user.userName,
        email: user.email,
        role: user.role,
        isActive: newStatus,
        password: null
      });
      loadUsers();
      toast.success(`${user.userName} has been ${newStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwordUser) return;
    
    if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match!");
        return;
    }

    if (newPassword.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
    }

    try {
      const updatedUser = { ...passwordUser, password: newPassword };
      await updateUserAdmin(passwordUser.userId, updatedUser);
      setPasswordUser(updatedUser);
      toast.success("Password updated successfully");
      setShowPasswordModal(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
        toast.error("Failed to update password");
        console.error("Password update error:", error);
    }
};

  // Add error state for empty users
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!Array.isArray(users)) {
    return <div>Error: Unable to load users</div>;
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-8xl mx-auto">
        {/* Header / Controls */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6 border border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black">User Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage application users and their status</p>
          </div>
          {/* Removed Add New User button here */}
        </div>

        {/* Table Card */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-blue-50 text-black border-b border-gray-200">
                <tr>
                  <th className="p-4 text-left font-semibold">Name</th>
                  <th className="p-4 text-left font-semibold">Email</th>
                  <th className="p-4 text-left font-semibold">Role</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user: User, index) => (
                    <tr
                      key={user.userId}
                      className={`border-b border-gray-100 hover:bg-blue-50 transition-all duration-150 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="p-4 text-black font-medium">{user.userName}</td>
                      <td className="p-4 text-black">{user.email}</td>
                      <td className="p-4 text-black">{user.role}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.isActive ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 px-3 py-1 text-sm font-medium border border-blue-100 rounded hover:bg-blue-50 w-full"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`px-3 py-1 text-sm font-medium rounded w-full ${
                              user.isActive
                                ? 'text-red-600 border border-red-100 hover:bg-red-50'
                                : 'text-blue-700 border border-blue-100 hover:bg-blue-50'
                            }`}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>

                          <button
                            onClick={() => {
                              setPasswordUser(user);
                              setNewPassword('');
                              setConfirmPassword('');
                              setShowPasswordModal(true);
                            }}
                            className="text-blue-600 px-3 py-1 text-sm font-medium border border-blue-100 rounded hover:bg-blue-50 w-full"
                          >
                            Change Password
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fixed Add User Button */}
      <button
        onClick={handleAddUser}
        className="fixed bottom-10 right-10 bg-blue-600 text-white border border-blue-600 shadow-lg px-6 py-3 rounded-lg font-semibold text-base hover:bg-blue-700 transition-all duration-200 z-50"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
      >
        Add New User
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-20">
          <div className="bg-white/90 p-6 rounded-lg w-96 shadow-xl backdrop-blur-md">
            <h2 className="text-xl font-bold mb-4">
              {selectedUser ? 'Edit User' : 'Add New User'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) => setFormData({...formData, userName: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              {!selectedUser && (
                <div className="mb-4">
                  <label className="block mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {showPasswordModal && passwordUser && (
            <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-20">
                <div className="bg-white/90 p-6 rounded-lg w-96 shadow-xl backdrop-blur-md">
                    <h3 className="text-lg font-semibold mb-4">Change Password</h3>

                    <div className="space-y-4">
                        {/* Username (readonly) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                value={passwordUser.userName}
                                readOnly
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
                            />
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="Enter new password"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePasswordUpdate}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Update Password
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default UserManagement;

