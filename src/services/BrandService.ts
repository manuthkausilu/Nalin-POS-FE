import apiClient from "./ApiClient";

export const saveBrand = async (brandData: any) => {
  try {
    const response = await apiClient.post("/admin/brands", brandData);
    return response.data;
  } catch (error) {
    console.error("Saving brand failed:", error);
    throw error;
  }
};

export const getAllBrands = async () => {
  try {
    const response = await apiClient.get("/brands");
    return response.data;
  } catch (error) {
    console.error("Fetching brands failed:", error);
    throw error;
  }
};

export const getBrandById = async (id: string | number) => {
  try {
    const response = await apiClient.get(`/brands/${id}`);
    return response.data;
  } catch (error) {
    console.error("Fetching brand by ID failed:", error);
    throw error;
  }
};

export const updateBrand = async (id: string | number, brandData: any) => {
  try {
    const response = await apiClient.put(`/admin/brands/${id}`, brandData);
    return response.data;
  } catch (error) {
    console.error("Updating brand failed:", error);
    throw error;
  }
};

export const deleteBrand = async (id: string | number) => {
  try {
    const response = await apiClient.delete(`/admin/brands/${id}`);
    return response.data;
  } catch (error) {
    console.error("Deleting brand failed:", error);
    throw error;
  }
};
