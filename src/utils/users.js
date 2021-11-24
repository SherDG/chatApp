const users = [];

const addUser = ({ id, username, room }) => {
    // TRIM-TO_LOWER_CASE INPUT DATA
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //VALIDATE DATA
    if (!username || !room) {
        return {
            error: "Provide usermane and room."
        }
    };

    //CHECK FOR EXISTING USERS
    const existingUsers = users.find((user) => {
        return user.room === room && user.username === username;
    });

    if (existingUsers) {
        return {
            error: "User with this name is already exist."
        }
    };

    // STORE USER
    const user = { id, username, room };
    users.push(user);
    return { user };
};

const removeUser = (id) => {
    const index = users.findIndex((user) => { return user.id === id });
    if (index > -1) {
        //[0] - подразумевает что будет удалён 1 элемент под номером index splice и потом
        // будет возращён удалённый объект - [0]
        return users.splice(index, 1)[0];
    }    
};


const getUser = (id) => {
    const index = users.findIndex((user) => { return user.id === id });
    // console.log(index)
    if (index > -1) {
        return users[index];
    }  
};

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => { return user.room === room });
};

addUser({
    id: 1,
    username: "Test",
    room: "test_room"
});

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

// addUser({
//     id: 2,
//     username: "Test2",
//     room: "test_room"
// });

// addUser({
//     id: 3,
//     username: "Test3",
//     room: "test_room3"
// });
// console.log(users);
// console.log(getUser(33));
// console.log(getUsersInRoom("test_room1"))
// const removedUser = removeUser(1);
// console.log(removedUser);
// console.log(users);