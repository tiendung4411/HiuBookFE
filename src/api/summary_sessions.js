import api from "./api";

const SummarySessionService = {
  // Create a new summary session (with createdBy and content)
  async createSession(userId, content) {
    try {
      const response = await api.post('/summary-sessions', {
        createdBy: {
          userId: userId
        },
        content: content
      });
      return response.data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  // Process PDF file and get cleaned text
  async processPdf(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/summary-sessions/process-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Assuming the response is a JSON string containing cleanedText
      const jsonData = JSON.parse(response.data);
      return jsonData.cleanedText; // Return just the cleaned text string
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw error;
    }
  },

  // Get session by ID
  async getSession(sessionId) {
    try {
      const response = await api.get(`/summary-sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  },

  // Update session content
  async updateSession(sessionId, content) {
    try {
      const response = await api.put(`/summary-sessions/${sessionId}`, {
        content: content
      });
      return response.data;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  },

  // Delete session
  async deleteSession(sessionId) {
    try {
      await api.delete(`/summary-sessions/${sessionId}`);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  // Start a new session and create summary history
  async startSession(userId, content, method) {
    try {
      const response = await api.post('/summary-histories/start-session', {
        userId: userId,
        content: content,
        method: method
      });
      console.log("Response from start session:", response.data); 
      return response.data; // Returns SummaryHistoryDTO
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  },

  // Create a new summary history for an existing session
  async createSummary(sessionId, method, content) {
    try {
      const response = await api.post('/summary-histories/create-summary', {
        sessionId: sessionId,
        method: method,
        content: content
      });
      return response.data; // Returns SummaryHistoryDTO
    } catch (error) {
      console.error('Error creating summary:', error);
      throw error;
    }
  },

  // Get summary history by ID
  async getSummaryHistory(historyId) {
    try {
      const response = await api.get(`/summary-histories/${historyId}`);
      return response.data; // Returns SummaryHistoryDTO
    } catch (error) {
      console.error('Error getting summary history:', error);
      throw error;
    }
  },

  // Update summary history by ID
  async updateSummaryHistory(historyId, updatedHistoryDTO) {
    try {
      const response = await api.put(`/summary-histories/${historyId}`, updatedHistoryDTO);
      return response.data; // Returns updated SummaryHistoryDTO
    } catch (error) {
      console.error('Error updating summary history:', error);
      throw error;
    }
  },

  // Delete summary history by ID
  async deleteSummaryHistory(historyId) {
    try {
      await api.delete(`/summary-histories/${historyId}`);
    } catch (error) {
      console.error('Error deleting summary history:', error);
      throw error;
    }
  },

  // Generate image for a session
  async generateImage(content) {
    try {
      const response = await api.post('/summary-sessions/generate-image', { content });
      return response.data; // Assuming the API returns an image URL or related data
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  },

  // New method: Get all histories for a specific session
  async getHistoriesBySession(sessionId) {
    try {
      console.log('Getting histories for session:', sessionId);
      const response = await api.get(`/summary-histories/session/${sessionId}`);
      return response.data; // Returns a list of SummaryHistoryDTOs
    } catch (error) {
      console.error('Error fetching histories for session:', error);
      throw error;
    }
  },
};

export default SummarySessionService;