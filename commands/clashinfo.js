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
        .setName('clashinfo')
        .setDescription('CoC Info about a player or clan.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('player')
                .setDescription('Info about a CoC player')
                .addStringOption(option =>
                    option.setName('playerid')
                        .setDescription('The CoC Player ID')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('clan')
                .setDescription('Info about a CoC clan')
                .addStringOption(option =>
                    option.setName('clanid')
                        .setDescription('The CoC Clan ID')
                        .setRequired(true))
        ),
    async execute(interaction) {

        if (interaction.options.getSubcommand() == 'player') {

            const uri = path + 'players/' + encodeURIComponent(interaction.options.get('playerid').value);

            axios.get(uri, config)
                .then(function (response) {
                    // TODO: Edge cases bruh

                    interaction.reply('Wow! Player ' + response.data.name + ' is already townhall level ' + response.data.townHallLevel + '!');
                })
                .catch(function (error) {
                    // TODO: put error handling in own function
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

        } else if (interaction.options.getSubcommand() == 'clan') {

            const uri = path + 'clans/' + encodeURIComponent(interaction.options.get('clanid').value);

            axios.get(uri, config)
                .then(function (response) {
                    // TODO: Edge cases bruh

                    interaction.reply('Clan ' + response.data.tag + ' already won ' + response.data.warWins + ' clan wars!');
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

        } else {
            // TODO: Error unknown command
        }

    },
};