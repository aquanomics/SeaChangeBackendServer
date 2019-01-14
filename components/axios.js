// AXIOS FUNCTIONS
// ===============================================

const axios = require('axios');

module.exports.getRequest = function axiosGet(url, onSuccess, onError) {
    axios.get(url)
        .then(response => {
            onSuccess(response.data);
        })
        .catch(error => {
            onError(error);
        });
};