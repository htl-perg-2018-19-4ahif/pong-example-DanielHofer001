var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let paddle1Pos = 0;
let paddle2Pos = 0;
function runBall() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting Ball !!!!!');
        ;
        /** Represents the size of a 2d object */
        /** Represents directions  */
        let Direction;
        (function (Direction) {
            Direction[Direction["top"] = 0] = "top";
            Direction[Direction["right"] = 1] = "right";
            Direction[Direction["bottom"] = 2] = "bottom";
            Direction[Direction["left"] = 3] = "left";
            Direction[Direction["leftPaddle"] = 4] = "leftPaddle";
            Direction[Direction["rightPaddle"] = 5] = "rightPaddle";
        })(Direction || (Direction = {}));
        ;
        // Get some information about the browser window and the ball. This information will
        // never change. So it makes sense to get it only once to make the rest of the program faster.
        const ball = document.getElementById('ball');
        const ballSize = { width: ball.clientWidth, height: ball.clientHeight };
        const ballHalfSize = splitSize(ballSize, 2);
        const clientSize = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
        const clientHalfSize = splitSize(clientSize, 2);
        let out = false;
        game();
        function game() {
            return __awaiter(this, void 0, void 0, function* () {
                // Move ball to center of the screen
                let ballCurrentPosition = { x: clientHalfSize.width, y: clientHalfSize.height };
                moveBall(ballCurrentPosition);
                // Calculate the random angle that the ball should initially travel.
                // Should be an angle between 27.5 and 45 DEG (=PI/8 and PI/4 RAD)
                const angle = Math.PI / 8 + Math.random() * Math.PI / 8;
                // Calculate the random quadrant into which the ball should initially travel.
                // 0 = upper right, 1 = lower right, 2 = lower left, 3 = upper left
                let quadrant = Math.floor(Math.random() * 4);
                out = false;
                let paddle = document.getElementsByClassName('leftpaddle')[0];
                const keys = document.getElementById('keys');
                do {
                    // Calculate target.
                    // X-coordinate iw either right or left border of browser window (depending on
                    //              target quadrant)
                    // y-coordinate is calculated using tangens angle function of angle
                    //              (note: tan(angle) = delta-y / delta-x). The sign depends on
                    //              the target quadrant)
                    const targetX = (quadrant === 0 || quadrant === 1) ? clientSize.width - ballSize.width : 0;
                    const targetBallPosition = {
                        x: targetX,
                        y: ballCurrentPosition.y + Math.tan(angle) * Math.abs(targetX - ballCurrentPosition.x) * ((quadrant === 0 || quadrant === 3) ? -1 : 1)
                    };
                    // Animate ball to calculated target position
                    const borderTouch = yield animateBall(ballCurrentPosition, targetBallPosition);
                    // Based on where the ball touched the browser window, we change the new target quadrant.
                    // Note that in this solution the angle stays the same.
                    const newLi = document.createElement('li');
                    switch (borderTouch.touchDirection) {
                        case Direction.left:
                            quadrant = (quadrant === 2) ? 1 : 0;
                            newLi.innerText = `(left) Paddle ${paddle1Pos} | ball: ${targetBallPosition.y}`;
                            keys.appendChild(newLi);
                            if (paddle1Pos <= targetBallPosition.y && paddle1Pos + paddle.clientHeight >= targetBallPosition.y) {
                            }
                            else {
                                socket.emit('player1');
                                out = true;
                            }
                            break;
                        case Direction.right:
                            quadrant = (quadrant === 0) ? 3 : 2;
                            newLi.innerText = `(right) Paddle ${paddle2Pos} | ball: ${targetBallPosition.y}`;
                            keys.appendChild(newLi);
                            if (paddle2Pos <= targetBallPosition.y && paddle2Pos + paddle.clientHeight >= targetBallPosition.y) {
                            }
                            else {
                                socket.emit('player2');
                                out = true;
                            }
                            break;
                        case Direction.top:
                            quadrant = (quadrant === 0) ? 1 : 2;
                            break;
                        case Direction.bottom:
                            quadrant = (quadrant === 2) ? 3 : 0;
                            break;
                        default:
                            throw new Error('Invalid direction, should never happen');
                    }
                    // The touch position is the new current position of the ball.
                    // Note that we fix the position here slightly in case a small piece of the ball has reached an area
                    // outside of the visible browser window.
                    ballCurrentPosition.x = Math.min(Math.max(borderTouch.touchPosition.x - ballHalfSize.width, 0) + ballHalfSize.width, clientSize.width);
                    ballCurrentPosition.y = Math.min(Math.max(borderTouch.touchPosition.y - ballHalfSize.height, 0) + ballHalfSize.height, clientSize.height);
                } while (!out); // until out
                if (socket.connected) {
                    game();
                }
                else {
                    process.exit(-1);
                }
            });
        }
        /**
         * Animate the ball from the current position to the target position. Stops
         * animation if border of browser window is reached.
         * @returns Position and direction where ball touched the border of the browser window
         *          at the end of the animation
         */
        function animateBall(currentBallPosition, targetBallPosition) {
            // Calculate x and y distances from current to target position
            const distanceToTarget = subtractPoints(targetBallPosition, currentBallPosition);
            // Use Pythagoras to calculate distance from current to target position
            const distance = Math.sqrt(distanceToTarget.width * distanceToTarget.width + distanceToTarget.height * distanceToTarget.height);
            // Variable defining the speed of the animation (pixels that the ball travels per interval)
            const pixelsPerInterval = 1;
            // Calculate distance per interval
            const distancePerInterval = splitSize(distanceToTarget, distance * pixelsPerInterval);
            // Return a promise that will resolve when animation is done
            return new Promise(res => {
                // Start at current ball position
                let animatedPosition = currentBallPosition;
                // Move point every 4ms
                const interval = setInterval(() => {
                    // Move animated position by the distance it has to travel per interval
                    animatedPosition = movePoint(animatedPosition, distancePerInterval);
                    // Move the ball to the new position
                    moveBall(animatedPosition);
                    // Check if the ball touches the browser window's border
                    let touchDirection;
                    /* if(overlaps(leftpaddle, animateBall)){
                       touchDirection=Direction.leftPaddle;
                     }
                     if(overlaps(rightpaddle, animateBall)){
                       touchDirection=Direction.leftPaddle;
                     }*/
                    if ((animatedPosition.x - ballHalfSize.width) < 0) {
                        touchDirection = Direction.left;
                    }
                    if ((animatedPosition.y - ballHalfSize.height) < 0) {
                        touchDirection = Direction.top;
                    }
                    if ((animatedPosition.x + ballHalfSize.width) > clientSize.width) {
                        touchDirection = Direction.right;
                    }
                    if ((animatedPosition.y + ballHalfSize.height) > clientSize.height) {
                        touchDirection = Direction.bottom;
                    }
                    if (touchDirection !== undefined) {
                        // Ball touches border -> stop animation
                        clearInterval(interval);
                        res({ touchPosition: animatedPosition, touchDirection: touchDirection });
                    }
                }, 4);
            });
        }
        /** Move the center of the ball to given position **/
        function moveBall(targetPosition) {
            // Note the 'px' at the end of the coordinates for CSS. Don't
            // forget it. Without the 'px', it doesn't work.
            const leftPos = `${targetPosition.x - ballHalfSize.width}px`;
            const topPos = `${targetPosition.y - ballHalfSize.height}px`;
            if (ball.style.left !== leftPos) {
                ball.style.setProperty('left', leftPos);
                socket.emit('left', leftPos);
            }
            if (ball.style.top !== topPos) {
                ball.style.setProperty('top', topPos);
                socket.emit('top', topPos);
            }
        }
        /** Subtracts two points and returns the size between them */
        function subtractPoints(a, b) {
            return {
                width: a.x - b.x,
                height: a.y - b.y
            };
        }
        /** Moves a point by the given size */
        function movePoint(p, s) {
            return {
                x: p.x + s.width,
                y: p.y + s.height
            };
        }
        /** Divides the width and height of the given size by the given divider */
        function splitSize(s, divider) {
            return {
                width: s.width / divider,
                height: s.height / divider
            };
        }
    });
}
window.addEventListener('load', () => __awaiter(this, void 0, void 0, function* () {
    const clientSize = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
    const ball = document.getElementById('ball');
    socket.on('left', code => {
        //socket.emit('left', code)
        ball.style.setProperty('left', `${(clientSize.width - parseFloat(code)).toString()}px`);
    });
    socket.on('top', code => {
        // socket.emit('top', code)
        ball.style.setProperty('top', `${parseFloat(code).toString()}px`);
    });
    socket.on('move2', code => {
        // socket.emit('top', code)
        paddle2Pos = parseInt(code);
    });
    socket.on('move1', code => {
        // socket.emit('top', code)
        paddle1Pos = parseInt(code);
    });
}));

//# sourceMappingURL=ball.js.map
