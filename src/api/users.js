import api from './api';


//fetch all users
export const getAllUsers = () => {
  return api.get('/users');
};  
//fetch user by id
export const getUserById = (id) => {
  return api.get(`/users/${id}`);
};


export const uploadImageToCloudinary = (file) => {
  console.log("Uploading image:", file.name, "Size:", file.size);
  const formData = new FormData();
  formData.append("file", file);

  return api.post('/summary-sessions/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(response => {
    console.log("Image upload response:", response.data);
    return response.data; // Returns { imageUrl, success }
  }).catch(error => {
    console.error("Error uploading image:", error.response ? error.response.data : error.message);
    throw error;
  });
};

export const updateUserProfile = (userId, userData) => {
  return api.put(`/users/${userId}/profile`, userData)
    .then(response => {
      console.log("User profile updated:", response.data);
      return response.data;
    })
    .catch(error => {
      console.error("Error updating user profile:", error.response ? error.response.data : error.message);
      throw error;
    });
};

