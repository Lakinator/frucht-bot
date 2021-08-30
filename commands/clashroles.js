const { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, italic, bold, userMention, roleMention } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const coc_api_handler = require('../coc_api/coc_api_handler');
const db_storage_handler = require('../db_storage/db_storage_handler');
const role_handler = require('../utils/role_handler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clashroles')
        .setDescription('Clashroles command')
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Edit a townhall role entry')
                .addIntegerOption(option =>
                    option.setName('townhall')
                        .setDescription('Townhall number')
                        .setRequired(true))
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role corresponding to the townhall')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('Delete a townhall role entry')
                .addIntegerOption(option =>
                    option.setName('townhall')
                        .setDescription('Townhall number')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('showall')
                .setDescription('Shows all role entries')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('update')
                .setDescription('Updates the roles of all or one member')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('update_coc_cache')
                        .setDescription('Whether the cached CoC data should be updated')
                        .setRequired(false))
        ),
    async execute(interaction) {

        if (interaction.options.getSubcommand() == 'edit') {
            let reply = 'Unknown error.';

            // only certain members should be allowed to use this command (permissions!)
            if (interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
                const townhall = interaction.options.get('townhall').value;
                const new_role_id = interaction.options.get('role').value;

                const throle = await db_storage_handler.getTownhallRole(townhall);

                if (throle) {
                    await db_storage_handler.editTownhallRole(townhall, new_role_id)
                        .then(async () => {
                            // remove old role and add new one
                            const old_role_id = throle.role_id;
                            const discord_id_entries = await db_storage_handler.getDiscordIdsLinkedToTownhall(townhall);
                            const discord_ids = discord_id_entries.map((entry) => entry.discord_id);

                            await role_handler.addRole(new_role_id, discord_ids, interaction.guild);
                            await role_handler.removeRole(old_role_id, discord_ids, interaction.guild);

                            reply = roleMention(new_role_id) + ' is now the new role for townhall ' + townhall + '.';
                        }).catch((error) => {
                            console.log(error);
                            reply = 'Error updating the database: ' + error.message;
                        });
                } else {
                    await db_storage_handler.addTownhallRole(townhall, new_role_id)
                        .then(async (new_entry) => {
                            // add members to new role
                            const discord_id_entries = await db_storage_handler.getDiscordIdsLinkedToTownhall(new_entry.townhall);
                            const discord_ids = discord_id_entries.map((entry) => entry.discord_id);

                            await role_handler.addRole(new_entry.role_id, discord_ids, interaction.guild);

                            reply = roleMention(new_entry.role_id) + ' for townhall ' + new_entry.townhall + ' added.';
                        }).catch((error) => {
                            console.log(error);
                            reply = 'Error inserting into database: ' + error.message;
                        });
                }
            } else {
                reply = 'Insufficient permissions.';
            }

            await interaction.reply(reply);

        } else if (interaction.options.getSubcommand() == 'delete') {
            let reply = 'Unknown error.';

            // only certain members should be allowed to use this command (permissions!)
            if (interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
                const townhall = interaction.options.get('townhall').value;
                const old_role_id = (await db_storage_handler.getTownhallRole(townhall)).role_id;

                await db_storage_handler.deleteTownhallRole(townhall)
                    .then(async (count) => {

                        if (count == 0) {
                            reply = 'A role for townhall ' + townhall + ' doesn\'t exist yet.';
                        } else {
                            // remove old role
                            const discord_id_entries = await db_storage_handler.getDiscordIdsLinkedToTownhall(townhall);
                            const discord_ids = discord_id_entries.map((entry) => entry.discord_id);

                            await role_handler.removeRole(old_role_id, discord_ids, interaction.guild);

                            reply = 'Successfully deleted role entry for townhall ' + townhall + '.';
                        }

                    }).catch((error) => {
                        console.log(error);
                        reply = 'Error deleting stuff from the database: ' + error.message;
                    });

            } else {
                reply = 'Insufficient permissions.';
            }

            await interaction.reply(reply);

        } else if (interaction.options.getSubcommand() == 'showall') {
            let reply = 'Unknown error.';

            const townhallRoles = await db_storage_handler.getAllTownhallRoles();

            if (townhallRoles.length > 0) {
                const roleString = townhallRoles.map(trole => trole.townhall + ': ' + roleMention(trole.role_id)).join('\n') || 'No roles.';
                reply = `- ${italic('Current townhall roles')} -\n` + roleString;
            } else {
                reply = 'There are no townhall roles yet.';
            }

            await interaction.reply(reply);

        } else if (interaction.options.getSubcommand() == 'update') {
            let reply = 'Unknown error.';

            // only certain members should be allowed to use this command (permissions!)
            if (interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
                const user_id_option = interaction.options.get('user');
                const update_coc_cache_option = interaction.options.get('update_coc_cache');

                if (user_id_option) {
                    // update single user
                    const links = await db_storage_handler.getLinksFromDiscordId(user_id_option.value);

                    if (update_coc_cache_option) if (update_coc_cache_option.value) await role_handler.updateCachedCoCData(links);

                    await role_handler.giveRoles(links, interaction.guild);

                    // TODO: remove roles where the user doesn't have the townhall for

                    reply = 'Update of ' + userMention(user_id_option.value) + ' successful!';
                } else {
                    // update all users
                    const links = await db_storage_handler.getAllLinks();

                    if (update_coc_cache_option) if (update_coc_cache_option.value) await role_handler.updateCachedCoCData(links);

                    await role_handler.giveRoles(links, interaction.guild);

                    // TODO: remove roles where the users don't have the townhall for

                    reply = 'Update successful!';
                }

            } else {
                reply = 'Insufficient permissions.';
            }

            await interaction.reply(reply);

        } else {
            // TODO: Error unknown subcommand
        }

    }
};