const axios = require('axios');
const { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder } = require('@discordjs/builders');
const { coctoken } = require('../config.json');

const path = 'https://api.clashofclans.com/v1/';
const config = {
    headers: {
        'authorization': 'Bearer ' + coctoken
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Links your Discord Account to your CoC Account!')
        .addStringOption(option =>
            option.setName('playerid')
                .setDescription('Your CoC Player ID')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('usertoken')
                .setDescription('Your CoC User Token')
                .setRequired(true)),
    async execute(interaction) {

        const uri = path + 'players/' + encodeURIComponent(interaction.options.get('playerid').value) + '/verifytoken';
        const usertoken = encodeURIComponent(interaction.options.get('usertoken').value);

        //console.log(uri);

        axios.post(uri, { token: usertoken }, config)
            .then(function (response) {
                let reply = '';

                console.log(response.data);

                if (response.data.status == 'ok') {
                    reply = 'User ' + response.data.tag + ' successfully registered!';

                    // TODO: Add role "verified"

                } else {
                    reply = 'Error: Token status => ' + response.data.status;
                }

                interaction.reply(reply);
            })
            .catch(function (error) {
                let err = 'An error ocurred while fetching data.';

                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);

                    err = 'Error: ' + error.response.data.message;
                } else if (error.request) {
                    // The request was made but no response was received
                    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                    // http.ClientRequest in node.js
                    console.log(error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error', error.message);
                }
                console.log(error.config);

                interaction.reply(err);
            })
            .then(function () {
                // always executed
            });

    },
};