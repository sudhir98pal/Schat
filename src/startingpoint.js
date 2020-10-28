const express = require('express');
const http = require('http')
const chalk = require('chalk');
const app = express();
const port = process.env.PORT || 3000
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words')
const { generateMessage } = require('./utils/messages')
const { generateLocationMessage } = require('./utils/location')


const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
// destructuring object
const server = http.createServer(app);
const io = socketio(server);// simply socketio() will not work thus we need socketio(server)
// now our server supports websockets


var newBadWords = ['chutiye', 'chutiya', 'mc', 'bc', 'saale','harami','Kutta'];
// you can other badwords also 



// functions start*************************************

const capitalize = (name) => // Capitalize first letter of each word in name
{
    let newName = '';
    newName += name.charAt(0).toUpperCase();

    let i = 1;
    while (true) {
        while (i < name.length && name[i] != ' ') {
            newName += name[i];
            i++;
        }
        if (i == name.length) return newName;

        newName += name[i];
        i++// skipping space

        newName += name.charAt(i).toUpperCase();
        i++;
        while (i < name.length && name[i] != ' ') {
            newName += name[i];
            i++;
        }
        if (i == name.length) return newName;

    }

}


//function  end ******************************************



const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath));
server.listen(port, () => {
    console.log(chalk.blueBright("Hi Sudhir Pal"))
    console.log(chalk.greenBright.underline('Sever is Running on port ' + port))
})

io.on('connection', (socket) => 
{
    console.log('new websocket connection');

    const filter = new Filter(); // to remove bad words
    // broadcast.emit will send message to all client connected to this socket except one who joined recently.

    socket.on('join', ({ userName, chatRoom }, callback) => 
    {

        socket.join(chatRoom);

        const { error, newUser } = addUser({ id: socket.id, userName, chatRoom });


        if (error)
         {
            return callback(error);
        }

       const  currentUserName=capitalize(userName);
        socket.emit('message', generateMessage(currentUserName, "Welcome " + currentUserName + " !"));
        socket.broadcast.to(chatRoom).emit('message', generateMessage(currentUserName, currentUserName+ ' Has Joined !'));
        callback() // all ok no error

io.to(chatRoom).emit('listOfUsersInRoom',
{
    chatRoom:chatRoom,
    users:getUsersInRoom(newUser.chatRoom)

})

    })
    socket.on('sendMessage', (inputMessage, callback) => {
        filter.addWords(... newBadWords);
        const currentUser = getUser(socket.id);
        
     
        if(currentUser)
        {
            var tempUserName=currentUser.userName;
        const  currentUserName=capitalize(tempUserName);
            io.to(currentUser.chatRoom).emit('message', generateMessage(currentUserName, filter.clean(inputMessage)))
            callback('sudhir pal');
        }
       
    });



    socket.on('disconnect', () => 
    {
        const  newUser = removeUser(socket.id)
      
       
        if (newUser.userName) 
        {
            var tempUserName=newUser.userName;
            const  currentUserName=capitalize(tempUserName);
        
            io.to(newUser.chatRoom).emit('listOfUsersInRoom',
{
    chatRoom:newUser.chatRoom,
    users:getUsersInRoom(newUser.chatRoom)

})
            io.to(newUser.chatRoom).emit('message', generateMessage(currentUserName, currentUserName + ' Left The ' + newUser.chatRoom+ ' chatRoom'))
        }

    })


    // receiving Geoloaction
    socket.on('shareLocation', (location, callback) => 
    {
    const currentUser = getUser(socket.id);

       
        if(currentUser)
        { 
            var tempUserName=currentUser.userName;
            const  currentUserName=capitalize(tempUserName);
            const GoogleMap = 'https://www.google.com/maps?q=';
            callback('Your Location shared !')
            io.to(currentUser.chatRoom).emit('sharingLocation', generateLocationMessage(currentUserName, GoogleMap + location.latitude + ',' + location.longitude));
        }
   
    })




})