// /src/api/summaries.js

import api from './api';

// Fetch all summaries
export const getAllSummaries = () => {
  return api.get('/summaries'); // Adjust the endpoint as necessary
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