module.exports = {
    name: 'messageCreate',
    callback(message, client) {
        // For debugging only
        const { content } = message;
        console.log(content);
    }
}
