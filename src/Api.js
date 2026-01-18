import axios from "axios";
import { getAdminToken, clearAdminAuth } from "./auth/adminAuth"; // adjust path

export class API {
  constructor() {
    this.baseUrl = "https://blogbackend.precisionstock.io";
  }
  //"http://13.64.149.30:3000";
  async getBlogEntries() {
    const response = await fetch(`${this.baseUrl}/entries`);
    return await response.json();
  }
  async getBlogEntry(id) {
    const response = await fetch(`${this.baseUrl}/entry/${id}`);
    return await response.json();
  }
  async pushComment(id, comment, author) {
    try {
      const response = await axios.post(`${this.baseUrl}/comment`, {
        id: id,
        comment: comment,
        author: author,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
async pushNewEntry(formData, onUploadProgress) {
  try {
    const token = getAdminToken();

    if (!token) {
      const err = new Error("Not authenticated");
      err.status = 401;
      throw err;
    }

    const response = await axios.post(`${this.baseUrl}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.lengthComputable && onUploadProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        }
      },
    });

    return response.data;
  } catch (error) {
    // If token expired / invalid, clear local auth so ProtectedRoute redirects next render
    if (error?.response?.status === 401) {
      clearAdminAuth();
    }
    throw error;
  }
}
  async verifyAdminKey(key) {
    const response = await axios.post(`${this.baseUrl}/verify`, { pass: key });
    return response.data; // { success, token, expiresAt }
  }
}
