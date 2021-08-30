const coc_api_handler = require('../coc_api/coc_api_handler');
const db_storage_handler = require('../db_storage/db_storage_handler');

module.exports = {
    updateCachedCoCData: async (links) => {
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
    },
    giveRoles: async (links, guild) => {
        for (let link of links) {
            const th_role_entry = await db_storage_handler.getTownhallRole(link.coc_townhall_level);
            const th_role_id = th_role_entry.role_id;
            const th_role = guild.roles.cache.get(th_role_id);

            const member = guild.members.cache.get(link.discord_id);

            await member.roles.add(th_role)
                .catch((error) => {
                    console.log(error);
                });
        }
    },
    addRole: async (new_role_id, discord_member_ids, guild) => {
        const new_role = guild.roles.cache.get(new_role_id);

        for (let member_id of discord_member_ids) {
            const member = guild.members.cache.get(member_id);
            await member.roles.add(new_role)
                .catch((error) => {
                    console.log(error);
                });
        }
    },
    removeRole: async (old_role_id, discord_member_ids, guild) => {
        const old_role = guild.roles.cache.get(old_role_id);

        for (let member_id of discord_member_ids) {
            const member = guild.members.cache.get(member_id);
            await member.roles.remove(old_role)
                .catch((error) => {
                    console.log(error);
                });
        }
    },
    removeIncorrectRoles: async (discord_id, guild) => {
        const townhallRoleEntries = await db_storage_handler.getAllTownhallRoles();

        for (let entry of townhallRoleEntries) {
            const linkEntries = await db_storage_handler.getLinksFromDiscordIdTownhall(discord_id, entry.townhall);
            if (linkEntries.length == 0) {
                // the user does not have this townhall level linked
                const member = guild.members.cache.get(discord_id);
                if (member.roles.cache.has(entry.role_id)) {
                    await member.roles.remove(entry.role_id)
                        .catch((error) => {
                            console.log(error);
                        });
                }
            }
        }
    }
};