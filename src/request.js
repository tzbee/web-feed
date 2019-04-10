/*
    Network wrapper
        Request a url 
        Returns a Promise resolving in the data
*/

const request = require('request');

module.exports = url => {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                resolve(body);
            } else {
                const message =
                    (error && error.message) ||
                    'Status code: ' + response.statusCode;
                reject('Error during network request: ' + message);
            }
        });
    });
};
