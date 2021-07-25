module.exports = (client) => {
    client.api.applications(client.user.id).commands.post({
        data: {
            name: 'ping',
            description: 'Gets the current bot response time in ms'
        }
    })
}
