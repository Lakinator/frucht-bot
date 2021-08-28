const { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder } = require('@discordjs/builders');
const coc_api_handler = require('./coc_api/coc_api_handler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
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

        coc_api_handler.verify(playerid, usertoken)
            .then((data) => {
                console.log(data);

                if (data.status == 'ok') {
                    reply = 'User ' + data.tag + ' successfully registered!';

                    // TODO: Add role "verified"

                } else {
                    reply = 'Error: Token status => ' + data.status;
                }

            }).catch((error) => {
                console.log(error);
                reply = error.message;
            }).finally(() => {
                interaction.reply(reply);
            });

    },
};