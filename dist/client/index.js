var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**************************************************************************
  Demo for a socket.io client

  NOTE: This code has not been optimized for size or speed. It was written
        with ease of understanding in mind.
**************************************************************************/
let reverted = false;
window.addEventListener('load', () => __awaiter(this, void 0, void 0, function* () {
    const keys = document.getElementById('keys');
    // Establish connection with socket.io server. Note that this just works
    // because `<script src="/socket.io/socket.io.js"></script>` is in index.html
    const socket = io();
    // Handle browser's keydown event
    /*document.addEventListener('keydown', event => {
      if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
        // Send ArrowKey message to server
        socket.emit(event.code, event.code);
      }
    });*/
    document.getElementById('button').addEventListener('click', () => {
        // Send start message to server
        socket.emit('start');
        const newLi = document.createElement('li');
        newLi.innerText = 'Starting game ...';
        keys.appendChild(newLi);
        let l = document.getElementById('button');
        l.disabled = true;
    });
    // Handle ArrowKey message received from server (i.e. user pressed
    // an arrow key in a different browser window).
    socket.on('play', code => {
        const newLi = document.createElement('li');
        if (code === 2) {
            // Add code of the to HTML list
            newLi.innerText = `Players (${code}) connected, starting game...`;
            let l = document.getElementById('button');
            l.disabled = true;
            keys.appendChild(newLi);
            runBall();
            reverted = true;
        }
        else if (code < 2) {
            newLi.innerText = `${code} Player ready !`;
            keys.appendChild(newLi);
        }
    });
    socket.on('player1', code => {
        let element = document.getElementById(`player1`);
        console.log('GOAL!!!');
        if (reverted)
            element = document.getElementById(`player2`);
        element.innerHTML = code;
    });
    socket.on('player2', code => {
        let element = document.getElementById(`player2`);
        if (reverted)
            element = document.getElementById(`player1`);
        console.log('GOAL!!!');
        element.innerHTML = code;
    });
}));

//# sourceMappingURL=index.js.map
