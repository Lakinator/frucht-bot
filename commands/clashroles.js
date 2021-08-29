const { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, italic, bold, userMention, roleMention } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const coc_api_handler = require('../coc_api/coc_api_handler');
const db_storage_handler = require('../db_storage/db_storage_handler');

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
        ),
    async execute(interaction) {

        if (interaction.options.getSubcommand() == 'edit') {
            let reply = 'Unknown error.';

            // only certain members should be allowed to use this command (permissions!)
            if (interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
                const townhall = interaction.options.get('townhall').value;
                const role = interaction.options.get('role').value;

                const throle = await db_storage_handler.getTownhallRole(townhall);

                if (throle) {
                    await db_storage_handler.editTownhallRole(townhall, role)
                        .then(() => {
                            reply = roleMention(role) + ' is now the new role for townhall ' + townhall + '.';
                        }).catch((error) => {
                            console.log(error);
                            reply = 'Error updating the database: ' + error.message;
                        });
                } else {
                    await db_storage_handler.addTownhallRole(townhall, role)
                        .then((entry) => {
                            reply = roleMention(entry.role_id) + ' for townhall ' + entry.townhall + ' added.';
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

                await db_storage_handler.deleteTownhallRole(townhall)
                    .then((count) => {

                        if (count == 0) {
                            reply = 'A role for townhall ' + townhall + ' doesn\'t exist yet.';
                        } else {
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

                if (user_id_option) {
                    // update single user
                    const links = await db_storage_handler.getLinksFromDiscordId(user_id_option.value);
                    await updateCachedCoCData(links);
                    // TODO: give roles
                    reply = italic('Under construction.');
                } else {
                    // TODO: update all users
                    reply = italic('Under construction.');
                }

            } else {
                reply = 'Insufficient permissions.';
            }

            await interaction.reply(reply);

        } else {
            // TODO: Error unknown subcommand
        }

    },
};

async function updateCachedCoCData(links) {
    for (let link of links) {
        await coc_api_handler.getPlayerInfo(link.coc_id)
            .then(async (data) => {
                await db_storage_handler.editLink(link.discord_id, link.coc_id, data.name, data.townHallLevel)
                    .catch((error) => {
                        console.log(error);
                    });
            }).catch((error) => {
                console.log(error);
            });
    }
}