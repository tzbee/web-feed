const os = require('os');
const EventEmitter = require('events');
const log = require('./log');

class StdioDispatcher extends EventEmitter {
    constructor() {
        super();
        this.on('message', message => {
            log(`[Dispatcher] Command received: ${message.command}`);
            this.emit(message.command, message);
        });
    }
}

function readMessage() {
    const lengthBuffer = process.stdin.read(4);

    if (lengthBuffer !== null) {
        const length = lengthBuffer.readInt32LE(0); // todo check endianness
        const contentBuffer = process.stdin.read(length);
        const content = contentBuffer.toString('utf8', 0);
        return content;
    } else return null;
}

function readLoop() {
    setTimeout(() => {
        const message = readMessage();

        if (message !== null) {
            this.emit('message', JSON.parse(message));
        }

        readLoop.call(this);
    }, 0);
}

StdioDispatcher.prototype.listen = function() {
    readLoop.call(this);
};

StdioDispatcher.prototype.sendMessage = function(message) {
    message = JSON.stringify(message);

    const byteLength = Buffer.byteLength(message);
    const buffer = Buffer.alloc(4, 0);

    const endianness = os.endianness();

    if (endianness === 'LE') {
        buffer.writeInt32LE(byteLength, 0);
    } else if (endianness === 'BE') {
        buffer.writeInt32BE(byteLength, 0);
    }

    process.stdout.write(buffer);
    return new Promise(resolve => process.stdout.write(message, 'utf-8', resolve));
};

module.exports = StdioDispatcher;