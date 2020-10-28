const users = []

const addUser = ({ id, userName, chatRoom }) => {


    // cleaning the data
    userName = userName.trim().toLowerCase();
    chatRoom = chatRoom.trim().toLowerCase();

    // validating the data
    if (!userName || !chatRoom) {
        return {
            error: 'userName and chatRoom are required'
        }
    }

    // check if user already exist in given chatRoom


    const existingUser = users.find((user) => 
    {
        return user.userName == userName && user.chatRoom == chatRoom;
    })

 
    // validate user
    if (existingUser) {

        return {
            error: 'Such user already exits in the current Chat Room'
        }
    }

    // all ok adding the new user to the given chat room

    const newUser = {
        id,
        userName,
        chatRoom
    }

    users.push(newUser);

    return { newUser };



}


const removeUser=(id) => {

    const pos = users.findIndex((user) => { return user.id == id; })
 
    if (pos != -1) {
        return users.splice(pos, 1)[0]
        // 1 => remove one item starting from pos in array
        // it returns an array of user removed thus use [0] to return first element to be returned
    }

    return {
        error: "No such User Exist"
    }

}


const getUser = (id) => {

    return users.find((user) => {
        return user.id == id;
    })



}


const getUsersInRoom = (chatRoom) => {

    return users.filter((user) => {
        return user.chatRoom ==chatRoom
    })

}



module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}


