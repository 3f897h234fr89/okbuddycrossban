# okbuddycrossban

Usage: 
`/register` to request to register with the network  
`/ping` to get the current bot delay and check if it's still alive  
`/github` to get the link to this repository

Setup: 
```bash
git clone https://github.com/3f897h234fr89/okbuddycrossban.git
cd okbuddycrossban
npm i
```
.env Setup:
```py
token = YOUR_BOT_TOKEN
host_id = YOUR_DISCORD_ACCOUNT_ID
redis_path = YOUR_REDIS_PATH
```
Note: you will also need a running instance of an redis server. [How to set up a redis server](https://redis.io/topics/quickstart)  

Running the bot:
```bash
npm start
```
OR
```bash
ts-node-dev --respawn --transpile-only --poll ./src/index.ts
```
