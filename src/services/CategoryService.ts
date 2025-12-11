import apiClient from "./ApiClient";

export interface Category {
  categoryId?: string; // optional for creation
  name: string;
}

export const saveCategory = async (categoryData: any) => {
  try {
    const response = await apiClient.post("/admin/categories", categoryData);
    return response.data;
  } catch (error) {
    console.error("Saving category failed:", error);
    throw error;
  }
};

export const getAllCategories = async () => {
  try {
    const response = await apiClient.get("/categories");
    return response.data;
  } catch (error) {
    console.error("Fetching categories failed:", error);
    throw error;
  }
};

export const getCategoryById = async (id: string | number) => {
  try {
    const response = await apiClient.get(`/admin/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Fetching category by ID failed:", error);
    throw error;
  }
};

export const updateCategory = async (id: string | number, categoryData: any) => {
  try {
    const response = await apiClient.put(`/admin/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error("Updating category failed:", error);
    throw error;
  }
};

export const deleteCategory = async (id: string | number) => {
  try {
    const response = await apiClient.delete(`/admin/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Deleting category failed:", error);
    throw error;
  }
};
