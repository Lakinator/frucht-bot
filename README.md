# frucht-bot

## About
- Link CoC accounts to your discord account by using the ingame api token under 'more settings'
- Manage roles which will be given to verified members depending on the townhall level their CoC accounts have
- Relevant data is saved into a sqlite database

## Setup

#### config.json (root directory)
```javascript
{
	"clientId": "<client id of the bot>",
	"guildId": "<guild id of your discord guild>",
	"token": "<bot token>",
	"coctoken": "<CoC developer api token>",
	"database": "<database name>",
	"dbuser": "<database user>",
	"dbpw": "<database password>"
}
```

## Commands

> `<>` options are optional, others are needed

/ | option 1 | option 2
--- | --- | ---
clashlink | `playerid` | `usertoken`
clashunlink | `playerid` |
clashroles *edit* | `townhall` | `role`
clashroles *delete* | `townhall` |
clashroles *showall* |   |
clashroles *update* | `<user>` | `<update_coc_cache>`
clashinfo *player* | `playerid` |
clashinfo *user* | `user` |
clashinfo *clan* | `clanid` |