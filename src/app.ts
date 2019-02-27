/**************************************************************************
  Demo for setting up a socket.io server with express

  NOTE: This code has not been optimized for size or speed. It was written
        with ease of understanding in mind.
**************************************************************************/
import express = require('express');
import http = require('http');
import path = require('path');
import sio = require('socket.io');
//import ball=require ('./client/ball');

let players: number = 0;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));
const server = http.createServer(app);
const port = 8080;
let player1=0;
let player2=0;
server.listen(port, () => console.log(`Server is listening on port ${port}...`));
// Handle the connection of new websocket clients
sio(server).on('connection', (socket) => {
  // Handle an ArrowKey event
  socket.on('ArrowKey', function (code) {
    // Broadcast the event to all connected clients except the sender
    socket.broadcast.emit('ArrowKey', code);
  });

  
  socket.on('start', () => {
    players++;
    if (players > 1 && players < 3) {
      console.log('start playing')
    } else if (players < 2) {
      console.log('waiting for player')
    } else {
      players = 1;
      player1=0;
      player2=0;
    }
    socket.broadcast.emit('play', players);
  });
  socket.on('left', code => {
    socket.broadcast.emit('left', code)
  });
  socket.on('top', code => {
    
    socket.broadcast.emit('top', code)
  });
  socket.on('move2', code => {
    socket.broadcast.emit('move1', code)
  });
  socket.on('move1', code => {
    socket.broadcast.emit('move2', code)
  });
  socket.on('player1',()=>{
    player1++;
    socket.broadcast.emit('player1', player1)

  });
  socket.on('player2',()=>{
    player2++;
    socket.broadcast.emit('player2', player2)

  });
});
