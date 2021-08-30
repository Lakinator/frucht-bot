const { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, bold, userMention } = require('@discordjs/builders');
const db_storage_handler = require('../db_storage/db_storage_handler');
const role_handler = require('../utils/role_handler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clashunlink')
        .setDescription('Unlinks your Discord Account from your CoC Account.')
        .addStringOption(option =>
            option.setName('playerid')
                .setDescription('Your CoC Player ID (including the \'#\')')
                .setRequired(true)),
    async execute(interaction) {
        let reply = 'Unknown error.';
        const playerid = interaction.options.get('playerid').value;

        const link = await db_storage_handler.getLinkFromCoCId(playerid);

        if (link) {
            await db_storage_handler.deleteLink(interaction.user.id, playerid)
                .then(async (count) => {
                    if (count == 0) {
                        reply = 'No linkage between CoC Account ' + bold(playerid) + ' and user ' + userMention(interaction.user.id) + ' was found.';
                    } else {
                        const role_id_entry = await db_storage_handler.getTownhallRole(link.coc_townhall_level);

                        await role_handler.removeRole(role_id_entry.role_id, [interaction.user.id], interaction.guild);

                        reply = 'CoC Account ' + bold(playerid) + ' was successfully unlinked from ' + userMention(interaction.user.id) + '.';
                    }
                }).catch((error) => {
                    console.log(error);
                    reply = 'Error deleting stuff from the database: ' + error.message;
                });
        } else {
            reply = 'No linkage between CoC Account ' + bold(playerid) + ' and user ' + userMention(interaction.user.id) + ' was found.';
        }

        await interaction.reply(reply);
    }
};