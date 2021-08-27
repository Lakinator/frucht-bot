const axios = require('axios');
const { coctoken } = require('../../config.json');

const path = 'https://api.clashofclans.com/v1/';
const config = {
    headers: {
        'authorization': 'Bearer ' + coctoken
    }
};

module.exports = {
    verify: function (playerid, usertoken) {

        return new Promise(function (success, error) {

            const uri = path + 'players/' + encodeURIComponent(playerid) + '/verifytoken';

            axios.post(uri, { token: encodeURIComponent(usertoken) }, config)
                .then(function (response) {
                    success(response.data);
                })
                .catch(function (err) {
                    error(handleHttpsError(err));
                })
                .then(function () {
                    // always executed
                });

        });
    },
    getPlayerInfo: function (playerid) {

        return new Promise(function (success, error) {

            const uri = path + 'players/' + encodeURIComponent(playerid);

            axios.get(uri, config)
                .then(function (response) {
                    success(response.data);
                })
                .catch(function (err) {
                    error(handleHttpsError(err));
                })
                .then(function () {
                    // always executed
                });

        });
    },
    getClanInfo: function (clanid) {

        return new Promise(function (success, error) {

            const uri = path + 'clans/' + encodeURIComponent(clanid);

            axios.get(uri, config)
                .then(function (response) {
                    success(response.data);
                })
                .catch(function (err) {
                    error(handleHttpsError(err));
                })
                .then(function () {
                    // always executed
                });

        });
    }
};

function handleHttpsError(error, enableLog = false) {
    let err = 'An error ocurred while fetching data.';

    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        err = 'Error ' + error.response.status + ': ' + error.response.data.message + '.';
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        if (enableLog) console.log(error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        if (enableLog) console.log('Error', error.message);
    }

    return err;
}