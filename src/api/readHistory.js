import api from './api';


//read-history/user/:id

export const getReadHistoryByUser = (id) => {
    console.log('getReadHistoryByUser called with id:', id);
    return api.get(`/read-history/user/${id}`)
        .then(response => {
            console.log('API response:', response);
            return response;
        })
        .catch(error => {
            console.error('API error:', error);
            throw error;
        });
};
