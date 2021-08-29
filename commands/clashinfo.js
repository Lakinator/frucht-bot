const { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, bold, userMention, roleMention } = require('@discordjs/builders');
const coc_api_handler = require('../coc_api/coc_api_handler');
const db_storage_handler = require('../db_storage/db_storage_handler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clashinfo')
        .setDescription('Clashinfo command')
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
                .setName('user')
                .setDescription('Info about a Discord user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user')
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

            const link = await db_storage_handler.getLinkFromCoCId(playerid);

            if (link) {
                reply = 'The CoC Account ' + bold(link.coc_name + link.coc_id) + ' (TH: ' + link.coc_townhall_level + ') is linked to ' + userMention(link.discord_id) + '!';
            } else {
                reply = 'The CoC Account ' + bold(playerid) + ' is not yet linked.';
            }

            await interaction.reply(reply);

        } else if (interaction.options.getSubcommand() == 'user') {
            let reply = 'No info.';
            const user_id = interaction.options.get('user').value;

            const links = await db_storage_handler.getLinksFromDiscordId(user_id);

            if (links.length > 0) {
                const linkString = links.map(link => bold(link.coc_name + link.coc_id) + ' (TH: ' + link.coc_townhall_level + ')').join(', ') || 'No links.';
                reply = userMention(user_id) + ' is linked to ' + linkString;
            } else {
                reply = 'The user ' + userMention(user_id) + ' doesn\'t have any links yet.'
            }

            await interaction.reply(reply);

        } else if (interaction.options.getSubcommand() == 'clan') {
            let reply = 'No info.';
            const clanid = interaction.options.get('clanid').value;

            await coc_api_handler.getClanInfo(clanid)
                .then((data) => {
                    reply = 'Clan ' + data.tag + ' already won ' + data.warWins + ' clan wars!';
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