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

- Options marked with `<>` are optional, others are needed

/ | options | description | auto role update
--- | --- | --- | --- |
clashlink | `playerid` `usertoken` | Links your Discord account to the given CoC account | &check;
clashunlink | `playerid` | Unlinks your Discord account from the given CoC account | &check;
clashroles *edit* | `townhall` `role` | Edit/Add a townhall role entry | &check;
clashroles *delete* | `townhall` | Delete a townhall role entry | &check;
clashroles *showall* | | Shows the current townhall roles | &cross;
clashroles *update* | `<user>` `<update_coc_cache>` | Updates (adds/removes) the roles from a specific user or from all users | &check;
clashinfo *player* | `playerid` | Shows you whether this CoC account is linked to someone | &cross;
clashinfo *user* | `user` | Shows you all CoC accounts that are linked to the given user | &cross;
clashinfo *clan* | `clanid` | *Work in progress* | &cross;