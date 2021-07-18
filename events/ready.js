module.exports = {
    name: 'ready',
    callback(client) {
        console.log(`${client.user.tag} is now online!`);
        client.user.setPresence({
            activity: {
                name: 'gay porn',
                type: 'WATCHING'
            }
        });
    }
}
