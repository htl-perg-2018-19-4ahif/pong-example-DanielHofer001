var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**************************************************************************
  Demo for controlling the paddle with cursor keys and touch

  NOTE: This code has not been optimized for size or speed. It was written
        with ease of understanding in mind.
**************************************************************************/
const socket = io();
window.addEventListener('load', this.paddle());
let currentPaddlePosition;
let paddleHeight;
function paddle() {
    return __awaiter(this, void 0, void 0, function* () { });
}
{
    // Get some information about the paddle. This information will never change.
    // So it makes sense to get it only once to make the rest of the program faster.
    const paddle = document.getElementsByClassName('leftpaddle')[0];
    const paddle2 = document.getElementsByClassName('rightpaddle')[0];
    paddleHeight = paddle.clientHeight;
    const paddleHalfHeight = paddleHeight / 2;
    currentPaddlePosition = paddle.clientTop;
    // Controls the speed of the movement (number of pixels per interval)
    const speed = 1;
    // Two helper variables that contain values during movement with cursor
    // keys. If currently not movement is happening, they are undefined.
    let interval;
    let direction;
    // Listen to keydown event
    document.addEventListener('keydown', event => {
        // We have to check whether a movement is already in progress. This is
        // necessary because keydown events arrive often when key is
        // continuously pressed.
        if (!interval) {
            switch (event.code) {
                case 'ArrowDown':
                    direction = speed;
                    startMoving();
                    break;
                case 'ArrowUp':
                    direction = speed * -1;
                    startMoving();
                    break;
            }
        }
    });
    // Listen to keyup event
    document.addEventListener('keyup', event => {
        switch (event.code) {
            case 'ArrowDown':
            case 'ArrowUp':
                stopMoving();
                break;
        }
    });
    // Setup handler for touch displays (pan operation)
    /*const hammertime = new Hammer(paddle);
    hammertime.get('pan').set({ direction: Hammer.DIRECTION_DOWN | Hammer.DIRECTION_UP });
    hammertime.on('pan', ev =>
      // Put center of paddle to the center of the user's finger
      movePaddle(ev.center.y - paddleHalfHeight));
  */
    /** Helper function that starts movement when keydown happens */
    function startMoving(paddle) {
        // Move paddle every 4ms
        interval = setInterval(() => movePaddle(currentPaddlePosition + direction, paddle), 4);
    }
    /** Helper function that stops movement when keyup happens */
    function stopMoving() {
        clearInterval(interval);
        interval = direction = undefined;
    }
    /**
     * Helper function that moves the paddle to a given position
     * @param targetPosition Target position. No movement is done if target position is invalid
     */
    function movePaddle(targetPosition, p) {
        if (targetPosition >= 0 && (targetPosition + paddleHeight) <= document.documentElement.clientHeight) {
            currentPaddlePosition = targetPosition;
            // Note the 'px' at the end of the coordinates for CSS. Don't
            // forget it. Without the 'px', it doesn't work.
            paddle.style.setProperty('top', `${currentPaddlePosition}px`);
            // Send ArrowKey message to server
            socket.emit('ArrowKey', currentPaddlePosition);
            socket.emit('move1', currentPaddlePosition);
        }
    }
    socket.on('ArrowKey', function (code) {
        paddle2.style.setProperty('top', `${code}px`);
        socket.emit('move2', code);
    });
}

//# sourceMappingURL=paddle.js.map
