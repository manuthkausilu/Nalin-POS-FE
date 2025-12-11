import apiClient from "./ApiClient";

export const saveLog = async (logData: any) => {
  try {
    const response = await apiClient.post("/logs", logData);
    return response.data;
  } catch (error) {
    console.error("Saving log failed:", error);
    throw error;
  }
};

export const getAllLogs = async () => {
  try {
    const response = await apiClient.get("/inventory-audits");
    return response.data;
  } catch (error) {
    console.error("Fetching logs failed:", error);
    throw error;
  }
};

export const getLogById = async (id: string | number) => {
  try {
    const response = await apiClient.get(`/inventory-audits/${id}`);
    return response.data;
  } catch (error) {
    console.error("Fetching log by ID failed:", error);
    throw error;
  }
};

export const updateLog = async (id: string | number, logData: any) => {
  try {
    const response = await apiClient.put(`/inventory-audits/${id}`, logData);
    return response.data;
  } catch (error) {
    console.error("Updating log failed:", error);
    throw error;
  }
};

export const deleteLog = async (id: string | number) => {
  try {
    const response = await apiClient.delete(`/inventory-audits/${id}`);
    return response.data;
  } catch (error) {
    console.error("Deleting log failed:", error);
    throw error;
  }
};
