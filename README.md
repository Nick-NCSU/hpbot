# SRC-BOT
A Discord Bot to connect the Speedrun.com and Hypixel APIs.

## Slash Commands
Command|Description
:-----:|:-----:
/help|Shows a help message.
/link \<game>|Sends a link to the provided game.
/categories \<game>|Shows the categories/variables for the provided game.
/search \<keyword> (page)|Searches for games containing the keyword(s).
/leaderboard \<game>|Provides a leaderboard for the given game.
/verified \<user>|Provides the number of runs verified by the given user.
/queuelength \<game>|Provides the number of unverified runs for the given game. 
/dream (simulations)|Simulates Dream\'s pearl and blaze rod odds.
/ping|Provides bot response time.

## Message Commands
### src!dream
Command|Description
:-----:|:-----:
src!dream (simulations)|Same as slash command version.

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
