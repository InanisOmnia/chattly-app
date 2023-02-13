/**
 * @typedef {Object} MessageTransferable
 * @property {Snowflake} id
 * @property {String} content
 * @property {String} user.name
 * @property {String} user.id
 */

/**
 *
 * @param {MessageTransferable} message
 * @returns {string}
 */
function genDomMessage(message) {
    return `
<div class="message row w-100" id="msg-${message.id}">
    <div class="col-auto p-0 m-0">
        <img src="/cdn/users/${message.user.id}.png" alt="">
    </div>
    <div class="col w-100 p-0 m-0">
        <div class="author" id="author-${message.user.id}">${message.user.username}</div>
        <div class="content">${message.content}</div>
    </div>
</div>
`
}

/**
 *
 * @param {MessageTransferable} message
 * @returns {string}
 */
function genDomMessageNoAuthor(message) {
    return `
<div class="message authorHidden row" id="msg-${message.id}">
    <div class="col-auto p-0 m-0">
        <img src="/cdn/users/${message.user.id}.png" alt="">
    </div>
    <div class="col p-0 m-0">
        <div class="author" id="author-${message.user.id}">${message.user.username}</div>
        <div class="content">${message.content}</div>
    </div>
</div>
`
}