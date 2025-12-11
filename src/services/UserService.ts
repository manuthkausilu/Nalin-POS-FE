import apiClient from "./ApiClient";

interface UserDTO {
  // Add your user properties here
  [key: string]: any;
}


// Register a new user (admin)
export const registerUser = async (userData: {
  userName: string;
  password: string;
  role: string;
  email: string;
  isActive: boolean;
}) => {
  try {
    // Updated endpoint to match @PostMapping("/register") under /admin/users
    const response = await apiClient.post("/admin/users/register", userData);
    return response.data;
  } catch (error) {
    console.error("User registration failed:", error);
    throw error;
  }
};

// Login user
export const loginUser = async (username: string, password: string) => {
  try {
    // Updated endpoint to match @PostMapping("/login") under /users
    const response = await apiClient.post("/users/login", {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("User login failed:", error);
    throw error;
  }
};

// Get all users (admin)
export const getAllUsersAdmin = async () => {
  try {
    // Updated endpoint to match @GetMapping under /admin/users
    const response = await apiClient.get('/admin/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users (admin):', error);
    throw error;
  }
};

// Get user by ID (non-admin/general)
export const getUserById = async (id: string | number) => {
  try {
    // Updated endpoint to match @GetMapping("/{id}") under /users
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error("Fetching user by ID failed:", error);
    throw error;
  }
};

// Update user (admin)
export const updateUserAdmin = async (userId: number, userData: UserDTO) => {
  try {
    // Updated endpoint to match @PutMapping("/{id}") under /admin/users
    const response = await apiClient.put(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user (admin):', error);
    throw error;
  }
};

// Change password
export const changeUserPassword = async (userId: number, oldPassword: string, newPassword: string) => {
    try {
        const response = await apiClient.post(`/users/change-password/${userId}?oldPassword=${encodeURIComponent(oldPassword)}&newPassword=${encodeURIComponent(newPassword)}`);
        return response.data;
    } catch (error) {
        console.error('Error change password:', error);
        throw error;
    }
};

// Delete user (admin)
export const deleteUserAdmin = async (userId: number) => {
  try {
    // Updated endpoint to match @DeleteMapping("/{id}") under /admin/users
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user (admin):', error);
    throw error;
  }
};

// User self info endpoints

export const getUserInfo = async () => {
  try {
    const response = await apiClient.get('/user/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    throw error;
  }
};

export const updateUserInfo = async (userData: any) => {
  try {
    const response = await apiClient.patch('/user/update', userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user info:', error);
    throw error;
  }
};

export const changePassword = async (passwordData: { oldPassword: string; newPassword: string }) => {
  try {
    const response = await apiClient.post('/user/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const deleteAccount = async () => {
  try {
    const response = await apiClient.delete('/user/delete');
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

