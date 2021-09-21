const ejs = require("ejs");
const {v4 :  uuidv4} = require('uuid');
const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const { ExpressPeerServer } = require('peer');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const peerServer = ExpressPeerServer(server, {
    debug : true,
}); 

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/peerjs',peerServer);


//routes
app.get('/', function(req, res){
    res.redirect(`${uuidv4()}`);
}); 

app.get('/:room',function(req, res){
     res.render('room',{roomId : req.params.room});
});

//socket funcs
io.on('connection',(socket) => {
    socket.on('join-room', (roomId,user_id) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected',user_id);

        socket.on('message', message => {
            io.to(roomId).emit('createMessage',message);
        })

    })
});


server.listen(PORT,function(){
    console.log("App started running at port 3030");
});

