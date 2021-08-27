const { SlashCommandBuilder, SlashCommandSubcommandGroupBuilder } = require('@discordjs/builders');
const clash = require('./clashconfig/clash');

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

        clash.verify(interaction.options.get('playerid').value, interaction.options.get('usertoken').value)
            .then(
                function (data) {
                    let reply = 'empty';

                    console.log(data);

                    if (data.status == 'ok') {
                        reply = 'User ' + data.tag + ' successfully registered!';

                        // TODO: Add role "verified"

                    } else {
                        reply = 'Error: Token status => ' + data.status;
                    }

                    interaction.reply(reply);
                },
                function (err) { 
                    console.log(err);
                    interaction.reply(err); 
                }
            );

    },
};