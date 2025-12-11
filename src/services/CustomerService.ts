import apiClient from "./ApiClient";

export const saveCustomer = async (customerData: any) => {
  try {
    const response = await apiClient.post("/customers", customerData);
    return response.data;
  } catch (error) {
    console.error("Saving customer failed:", error);
    throw error;
  }
};

export const getAllCustomers = async () => {
  try {
    const response = await apiClient.get("/customers");
    return response.data;
  } catch (error) {
    console.error("Fetching customers failed:", error);
    throw error;
  }
};

export const getCustomerById = async (id: string | number) => {
  try {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Fetching customer by ID failed:", error);
    throw error;
  }
};

export const updateCustomer = async (id: string | number, customerData: any) => {
  try {
    const response = await apiClient.put(`/customers/${id}`, customerData);
    return response.data;
  } catch (error) {
    console.error("Updating customer failed:", error);
    throw error;
  }
};

export const deleteCustomer = async (id: string | number) => {
  try {
    const response = await apiClient.delete(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error("Deleting customer failed:", error);
    throw error;
  }
};
