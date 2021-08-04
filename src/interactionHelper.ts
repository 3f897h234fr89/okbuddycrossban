import * as interactionsClient from 'discord-slash-commands-client'; // Only used to register commands
let interactionClient: interactionsClient.Client;

import * as dotenv from 'dotenv';
dotenv.config();

export async function setup(clientId: string) {
    interactionClient = new interactionsClient.Client(process.env.token, clientId);
    await registerCommands();
}

async function registerCommands() {
    interactionClient.createCommand({
        name: 'ping',
        description: 'Gets the current bot delay.'
    });

    interactionClient.createCommand({
        name: 'github',
        description: 'Get the link to the Github repository.'
    });

    interactionClient.createCommand({
        name: 'register',
        description: 'Request to register with the network.',
        options: [
            {
                name: 'channel',
                description: 'The current staff/mod channel of your server',
                type: 7,
                required: true
            },
        ],
    });
}

export async function printCommands(clientId: string) {
    interactionClient = new interactionsClient.Client(process.env.token, clientId);
    const commands = await interactionClient.getCommands({});
    console.log(commands);
}
