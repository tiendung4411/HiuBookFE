// /src/api/summaries.js

import api from './api';

// Fetch all summaries
export const getAllSummaries = () => {
  return api.get('/summaries'); // Adjust the endpoint as necessary
};

// Fetch all summaries for admin
export const getAllSummariesAdmin = () => {
  return api.get('/summaries/admin');
};

// Get summaries by grade
export const getSummariesByGrade = (grade) => {
  // Add more console.log to debug
  console.log("grade", grade);
  return api.get(`/summaries/grade/${grade}`);
};
// /src/api/summaries.js


// New bulk delete function
export const deleteSummaries = (ids) => {
  return api.delete('/summaries/bulk', { data: ids });
};
// Get top 10 summaries
export const getTop10Summaries = () => {
  return api.get('/summaries/top10');
};

// Get summaries by contributor (user)
export const getSummariesByContributor = (userId) => {
  return api.get(`/summaries/contributor/${userId}`);
};

// Get summary by ID with userId
export const getSummaryById = (id, userId) => {
  return api.get(`/summaries/${id}?userId=${userId}`);
};

// Create a new summary
export const createSummary = (summaryData) => {
  return api.post('/summaries', summaryData);
};

// General-purpose update (PATCH)
export const updateSummary = (id, updates) => {
  return api.patch(`/summaries/${id}`, updates);
};

// Specific status update (sets status to APPROVED or REJECTED based on action)
export const updateSummaryStatus = (id, status) => {
  console.log(`Updating summary ${id} status to: ${status}`); // Debug log
  return updateSummary(id, { status });
};

// Update title and content
export const updateSummaryContent = (id, title, content) => {
  return updateSummary(id, { title, content });
};

// Update image URL
export const updateSummaryImage = (id, imageUrl) => {
  return updateSummary(id, { imageUrl });
};

// Delete a summary
export const deleteSummary = (id) => {
  return api.delete(`/summaries/${id}`);
};

// Search summaries by title and grade
export const searchSummariesByTitleAndGrade = (title, grade) => {
  return api.get(`/summaries/search`, {
    params: { searchTerm: title, grade: grade }
  });
};

// Process PDF file
export const processPdf = (file) => {
  // Debug log to check the file being sent
  console.log("Processing PDF file:", {
    name: file.name,
    size: file.size,
    type: file.type,
  });

  // Create FormData to send the file
  const formData = new FormData();
  formData.append("file", file);

  // Debug log to confirm FormData contents
  console.log("FormData prepared for POST:", Array.from(formData.entries()));

  // Return the API POST request
  return api
    .post("/summary-sessions/process-pdf", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => {
      // Debug log to check the full response
      console.log("PDF process response received:", {
        status: response.status,
        data: response.data,
      });
      return {
        cleanedText: response.data.cleanedText,
        titles: response.data.titles, // Ensure titles are returned
      };
    })
    .catch((error) => {
      // Detailed error logging
      console.error("Error processing PDF:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
      });
      throw error; // Re-throw the error for handling in the component
    });
};

// Upload image to Cloudinary
export const uploadImageToCloudinary = (file) => {
  console.log("Uploading image:", file.name, "Size:", file.size); // Debug log
  const formData = new FormData();
  formData.append("file", file);

  return api.post('/summary-sessions/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(response => {
    console.log("Image upload response:", response.data); // Debug log
    return response.data; // Returns { imageUrl, success }
  }).catch(error => {
    console.error("Error uploading image:", error.response ? error.response.data : error.message);
    throw error;
  });
};