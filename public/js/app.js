$(function () {
    let cacheUsers = new Map();

    let self;
    let selfTyping;

    let typingUsers = [];

    const w = $(window);
    const offlineSpinner = $("#offlineSpinner");
    const errorSpinner = $("#errorSpinner");

    const messagesContainer = $("#messagesContainer");

    const messageInput = $("#messageInput");
    const clearMessageInputButton = $("#clearMessageInputButton");

    const typingUsersContainer = $("#typingUsersContainer");

    const addRoomButton = $("#addRoomButton");

    const offlineModal = $("#offlineModal");
    const reloadPageButton = $("#reloadPageButton");

    offlineSpinner.show();

    const socket = io({
        path: "/app",
        reconnectionDelayMax: 10000,
        reconnectionAttempts: 2
    });

    messageInput.on("keyup", (e) => {
        if (!selfTyping) {
            socket.emit("TYPING_START");
            selfTyping = new Timer({
                cb: () => {
                    socket.emit("TYPING_END")
                    selfTyping = null;
                }, ms: 3000
            });
        } else {
            selfTyping.restartTimeout();
        }
        if (e.keyCode === 13) { // Enter key
            const content = messageInput.val();
            if (!content) {
                return
            }
            socket.emit("MESSAGE_CREATE", {content}, (data) => console.log(data));
            messageInput.val("");
            selfTyping.fireNow();
        }
    })

    socket.on("connect", () => {
        offlineSpinner.hide();

        // identify self
        socket.emit("IDENTIFY", (data) => {self = data;});
        // join the currently viewed room on the websocket
        socket.emit("SELECT_ROOM", {roomId: "0"}, (data) => {
            console.log(data)
        });
        socket.emit("REQUEST_MESSAGE_HISTORY_CHUNK", {}, (data) => {

        });
    });

    socket.on("MESSAGE_CREATE", async (data) => {
        console.log(data)
        if (!cacheUsers.has(data.userId)) {
            await cacheUser(data.userId)
        }
        if (messagesContainer.children().last().find(".author").attr("id")) {
            messagesContainer.append(messagesContainer.children().last().find(".author").attr("id").split("-")[1] === data.userId ? genDomMessageNoAuthor({
                ...data,
                user: cacheUsers.get(data.userId)
            }) : genDomMessage({...data, user: cacheUsers.get(data.userId)}));
        } else {
            messagesContainer.append(genDomMessage({...data, user: cacheUsers.get(data.userId)}));
        }
        autoScrollMessages();
    });

    socket.on("TYPING_START", (data) => {
        typingUsers.push(data.id);
        updateTypingUsers()
    });

    socket.on("TYPING_END", (data) => {
        let idx = typingUsers.indexOf(data.id);
        if (idx === -1) {
            return
        }
        typingUsers.splice(idx, 1);
        updateTypingUsers()
    });


    socket.on("disconnect", (data) => {
        offlineSpinner.show();
    });
    socket.on("connect_timeout", (data) => {
        console.log("connect_timeout", data)
    });
    socket.on("reconnect_attempt", (data) => {
        console.log("reconnect_attempt", data)
    });
    socket.on("reconnect", (data) => {
        console.log("reconnect", data)
    });
    socket.on("reconnecting", (data) => {
        console.log("reconnecting", data)
    });
    socket.on("reconnect_error", (data) => {
        console.log("reconnect_error", data)
    });
    socket.on("reconnect_failed", (data) => {
        console.log("reconnect_failed", data);
        offlineModal.modal("show");
        errorSpinner.show();
    });

    const cacheUser = (userId) => {
        return new Promise(((resolve, reject) => {
            socket.emit("REQUEST_USER_DATA", {id: userId}, (cbdata) => {
                if (cbdata.status === 200) {
                    cacheUsers.set(cbdata.id, cbdata);
                    resolve();
                }
                reject(cbdata);
            });
        }))
    }

    const updateTypingUsers = async () => {
        if (!typingUsers.length) {
            return typingUsersContainer.hide();
        }
        let text = await typingUsers.reduce(async (acc, curr) => {
            if (!cacheUsers.has(curr)) {
                await cacheUser(curr);
            }
            return acc += cacheUsers.get(curr).name
        }, `<i class="fas fa-ellipsis-h animated"></i>`);
        typingUsersContainer.html(text);
        typingUsersContainer.show();
    }

    addRoomButton.click(() => {
       socket.emit("MESSAGE_CREATE", {content: "I tried to add a room but haven't implemented it yet"});
    });

    clearMessageInputButton.click(() => {
       messageInput.val("");
    });

    reloadPageButton.click(() => {
        window.location.reload();
    });

    document.addEventListener('contextmenu', function (e) {
        console.log(e.path); // loop through and find any with desired class (e.g. message, user, member, room, house, etc etc). then apply the relevent context menu options

        const menu = $("#context-menu");

        let top = e.pageY;
        let left = e.pageX;

        const maxHeight = w.height();
        if (top > maxHeight / 2) {
            top -= (menu.height() + 20);
        }
        const maxWidth = w.width();
        if (left > maxWidth / 2) {
            left -= menu.width();
        }

        menu.css({
            display: "block",
            top: top,
            left: left
        }).addClass("show");
        e.preventDefault();
        return false;
    })
    document.addEventListener("click", function () {
        $("#context-menu").removeClass("show").hide();
    });

    $("#context-menu button").on("click", function () {
        $(this).parent().removeClass("show").hide();
    });

    function autoScrollMessages() {
        const messagesContainerElt = messagesContainer.get(0);
        const newMessage = messagesContainerElt.lastElementChild;

        const newMessageStyles = getComputedStyle(newMessage);
        const newMessageMargin = parseInt(newMessageStyles.marginBottom);
        const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

        const visibleHeight = messagesContainerElt.offsetHeight;
        const containerHeight = messagesContainerElt.scrollHeight;
        const scrollOffset = messagesContainerElt.scrollTop + visibleHeight;

        if (containerHeight - newMessageHeight <= scrollOffset) {
            // messagesContainer.animate({scrollTop: messagesContainerElt.scrollHeight}, 800);
            messagesContainerElt.scrollTop = messagesContainerElt.scrollHeight;
        }
    }

});