// /src/api/summaries.js

import api from './api';

// Fetch all summaries
export const getAllSummaries = () => {
  return api.get('/summaries'); // Adjust the endpoint as necessary
};
export const getAllSummariesAdmin = () => {
  return api.get('/summaries/admin');
};

// Get summaries by grade
export const getSummariesByGrade = (grade) => {
  
  //add more console.log to debug
  console.log("grade", grade);
  return api.get(`/summaries/grade/${grade}`);

};

//get top10 summaries
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

// Update summary status
export const updateSummaryStatus = (id, status) => {
  return api.put(`/summaries/${id}/status`, null, {
    params: { status }
  });
};

// Delete a summary
export const deleteSummary = (id) => {
  return api.delete(`/summaries/${id}`);
};
export const searchSummariesByTitle = (title) => {
  return api.get(`/summaries/search`, {
    params: { searchTerm: title }
  });
};

export const processPdf = (file) => {
  // Debug log to check the file being sent
  console.log("Processing PDF file:", file.name, "Size:", file.size);

  // Create FormData to send the file
  const formData = new FormData();
  formData.append("file", file);

  // Return the API POST request
  return api.post('/summary-sessions/process-pdf', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(response => {
    // Debug log to check the response
    console.log("PDF process response:", response.data);
    return response.data; // Should return { "cleaned_text": "..." }
  }).catch(error => {
    console.error("Error processing PDF:", error.response ? error.response.data : error.message);
    throw error; // Re-throw the error for handling in the component
  });
};