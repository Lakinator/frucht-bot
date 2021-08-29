const { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder, bold, userMention } = require('@discordjs/builders');
const coc_api_handler = require('../coc_api/coc_api_handler');
const db_storage_handler = require('../db_storage/db_storage_handler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clashlink')
        .setDescription('Links your Discord Account to your CoC Account!')
        .addStringOption(option =>
            option.setName('playerid')
                .setDescription('Your CoC Player ID (including the \'#\')')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('usertoken')
                .setDescription('Your CoC User Token')
                .setRequired(true)),
    async execute(interaction) {
        let reply = 'Unknown error.';
        const playerid = interaction.options.get('playerid').value;
        const usertoken = interaction.options.get('usertoken').value;

        const link = await db_storage_handler.getLinkFromCoCId(playerid);

        if (link) {

            reply = 'Error: CoC Account ' + bold(link.coc_name + link.coc_id) + ' already belongs to ' + userMention(link.discord_id) + '!';

        } else {
            await coc_api_handler.verify(playerid, usertoken)
                .then(async (data) => {

                    if (data.status == 'ok') {

                        // Fetch coc data
                        await coc_api_handler.getPlayerInfo(playerid)
                            .then(async (data) => {

                                // Add account link to database
                                await db_storage_handler.addLink(interaction.user.id, playerid, data.name, data.townHallLevel)
                                    .then((entry) => {
                                        reply = 'CoC Account ' + bold(entry.coc_name + entry.coc_id) + ' is now linked to ' + userMention(entry.discord_id) + '!';
                                        // TODO: give townhall role
                                    }).catch((error) => {
                                        console.log(error);
                                        reply = 'Error inserting into database: ' + error.message;
                                    });

                            }).catch((error) => {
                                console.log(error);
                                reply = error.message;
                            });

                    } else {
                        reply = 'Error: Token status => ' + data.status;
                    }

                }).catch((error) => {
                    console.log(error);
                    reply = error.message;
                });
        }

        await interaction.reply(reply);
    },
};