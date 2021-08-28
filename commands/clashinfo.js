const { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder } = require('@discordjs/builders');
const coc_api_handler = require('../coc_api/coc_api_handler');

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
                        .setDescription('The CoC Player ID (including the \'#\')')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('clan')
                .setDescription('Info about a CoC clan')
                .addStringOption(option =>
                    option.setName('clanid')
                        .setDescription('The CoC Clan ID (including the \'#\')')
                        .setRequired(true))
        ),
    async execute(interaction) {

        if (interaction.options.getSubcommand() == 'player') {
            let reply = 'No info.';
            const playerid = interaction.options.get('playerid').value;

            coc_api_handler.getPlayerInfo(playerid)
                .then((data) => {
                    // TODO: Edge cases bruh

                    reply = 'Wow! Player ' + data.name + ' is already townhall level ' + data.townHallLevel + '!';
                }
                ).catch((error) => {
                    console.log(error);
                    reply = error.message;
                }).finally(() => {
                    interaction.reply(reply);
                });

        } else if (interaction.options.getSubcommand() == 'clan') {
            let reply = 'No info.';
            const clanid = interaction.options.get('clanid').value;

            coc_api_handler.getClanInfo(clanid)
                .then((data) => {
                    // TODO: Edge cases bruh

                    interaction.reply('Clan ' + data.tag + ' already won ' + data.warWins + ' clan wars!');
                }).catch((error) => {
                    console.log(error);
                    reply = error.message;
                }).finally(() => {
                    interaction.reply(reply);
                });

        } else {
            // TODO: Error unknown subcommand
        }

    },
};