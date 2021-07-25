# OkBuddyCrossBan v2 (experimental)
 
Usage:

`/register [channel]` to request to register with the network  
`/ping` to get the current bot delay in ms  
`/github` to view this repository  

Setup: 
```sh
git clone https://github.com/3f897h234fr89/okbuddycrossban.git
cd okbuddycrossban
npm i
```
note: You will need Nodejs version 14 or higher.
.env setup:
```
DISCORD_TOKEN = [YOUR_DISCORD_BOT_TOKEN]
REDIS_PATH = [YOUR_REDIS_PATH]
HOST_ID = [YOUR_HOST_DISCORD_ID]
```
You will also need a running redis server. [Redis quick start guide](https://redis.io/topics/quickstart).  

Running the bot once the setup is completed:
```sh
node index.js
```
