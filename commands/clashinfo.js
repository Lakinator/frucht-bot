const clash = require('./clashconfig/clash');
const { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder } = require('@discordjs/builders');

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

            clash.getPlayerInfo(interaction.options.get('playerid').value)
                .then(
                    function (data) {
                        // TODO: Edge cases bruh

                        interaction.reply('Wow! Player ' + data.name + ' is already townhall level ' + data.townHallLevel + '!');
                    },
                    function (err) {
                        console.log(err);
                        interaction.reply(err);
                    }
                );

        } else if (interaction.options.getSubcommand() == 'clan') {

            clash.getClanInfo(interaction.options.get('clanid').value)
                .then(
                    function (data) {
                        // TODO: Edge cases bruh

                        interaction.reply('Clan ' + data.tag + ' already won ' + data.warWins + ' clan wars!');
                    },
                    function (err) {
                        console.log(err);
                        interaction.reply(err);
                    }
                );

        } else {
            // TODO: Error unknown subcommand
        }

    },
};