import apiClient from "./ApiClient";

export const saveInventoryAudit = async (auditData: any) => {
  try {
    const response = await apiClient.post("/inventory-audits", auditData);
    return response.data;
  } catch (error) {
    console.error("Saving inventory audit failed:", error);
    throw error;
  }
};

export const getAllInventoryAudits = async () => {
  try {
    const response = await apiClient.get("/inventory-audits");
    return response.data;
  } catch (error) {
    console.error("Fetching inventory audits failed:", error);
    throw error;
  }
};

export const getInventoryAuditById = async (id: string | number) => {
  try {
    const response = await apiClient.get(`/inventory-audits/${id}`);
    return response.data;
  } catch (error) {
    console.error("Fetching inventory audit by ID failed:", error);
    throw error;
  }
};

export const updateInventoryAudit = async (id: string | number, auditData: any) => {
  try {
    const response = await apiClient.put(`/inventory-audits/${id}`, auditData);
    return response.data;
  } catch (error) {
    console.error("Updating inventory audit failed:", error);
    throw error;
  }
};

export const deleteInventoryAudit = async (id: string | number) => {
  try {
    const response = await apiClient.delete(`/inventory-audits/${id}`);
    return response.data;
  } catch (error) {
    console.error("Deleting inventory audit failed:", error);
    throw error;
  }
};
