const users = [];

// addUser
const addUser = ({id,userName,roomName})=>{

    userName = userName.trim().toLowerCase();
    roomName = roomName.trim().toLowerCase();

    // validate
    if(!userName || !roomName){
        return {
            error: "Username and room required"
        };
    }

    // check for existing user
    const existingUser = users.find((user)=>{
        return user.roomName === roomName && user.userName === userName;
    });

    // validate userName
    if(existingUser){
        return{
            error: "Username taken"
        };
    }

    // store user
    const user = {id,userName,roomName};
    users.push(user);
    return { user };
};

// remove users
const removeUser = (id)=>{
    const index = users.findIndex((user)=>user.id==id);
    if(index!=-1){
        return users.splice(index,1)[0];
    }
};

// get user
const getUser = (id)=>{
    return user = users.find((user)=>user.id==id);
};

// get Users In a Room
const getUsersInRoom = (roomName)=>{
    roomName = roomName.trim().toLowerCase();
    return usersInRoom = users.filter((user)=>user.roomName===roomName);
    
};

module.exports = {
    addUser,
    getUser,
    removeUser,
    getUsersInRoom
}
