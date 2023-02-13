module.exports = (structure) => {
    let dt = new Date().getTime();
    let uuid = structure.replace(/\*x/g, function(char) {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return r.toString(16);
    });
    return uuid;
}