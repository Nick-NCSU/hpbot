# SRC-BOT
A Discord Bot to connect the Speedrun.com and Hypixel APIs.

Uses MongoDB for a database to store the banlist and known runners.

## Slash Commands
Command|Description
:-----:|:-----:
/help|Shows a help message.
/hypixel|Provides helpful links for Hypixel Speedruns.
/link \<game>|Sends a link to the provided game.
/categories \<game>|Shows the categories/variables for the provided game.
/search \<keyword> (page)|Searches for games containing the keyword(s).
/leaderboard \<game>|Provides a leaderboard for the given game.
/verified \<user>|Provides the number of runs verified by the given user.
/queuelength \<game>|Provides the number of unverified runs for the given game. 
/dream (simulations)|Simulates Dream\'s pearl and blaze rod odds.
/ping|Provides bot response time.

## Message Commands
### src!banlist
Command|Description
:-----:|:-----:
src!banlist list|Lists all accounts in the banlist.
src!banlist add \<player>|Adds an account to the banlist.
src!banlist remove \<player>|Removes an account from the banlist.
src!banlist search \<player>|Searches for banned player and returns information regarding ban

### src!runners
Command|Description
:-----:|:-----:
src!runners list|Lists all accounts in the known runners.
src!runners add \<player> \<src account>|Adds an account to the known runners.
src!runners remove \<player>|Removes an account from the known runners.
src!runners search \<player>|Searches for known and returns information account information.
src!runners searchsrc \<src account>| Searches by src account and returns all associated accounts.

### src!dream
Command|Description
:-----:|:-----:
src!dream (simulations)|Same as slash command version.

### src!check
Command|Description
:-----:|:-----:
src!check (...account)|Checks a list of accounts for Hypixel friends/guild lists, banlist, and known runners list.

## Scheduled Actions
### Daily Leaderboard
Runs a modified version of /leaderboard which runs for multiple games and combines their world record count to a single embed.

### Combined Leaderboard
Finds runners with verified runs of certain categories and automatically submits a run containing the combined time of these categories.

### Invalid Check
Ensures runs submitted to categories managed by a bot are rejected.

### Old Run Check
Checks a list of games for unverified runs older than 2 weeks. Sends a list of "old runs" to logging channel.

## Credits
* [Nick-NCSU](https://github.com/Nick-NCSU) Developer
