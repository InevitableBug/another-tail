const {EventEmitter} = require('events');
const fs = require('fs');
const {EOL} = require('os');
const extend = require('extend');

const defaults = {
    'encoding': 'utf8',
    'lineTerminator': EOL
}

class Tail extends EventEmitter {

    constructor(filename, options) {
        super();

        this.options = defaults;
        extend(this.options, options);

        this.filename = filename;
        this.position = {start: 0, end: 0};
        this.lastEnd = 0;
        this.lineBuffer = '';

        this.fd = fs.openSync(filename, 'r');

        const watcher = fs.watch(filename);

        watcher.on('change', (eventType, filename) => {
            if (eventType !== 'change') {
                return;
            }

            fs.stat(filename, (err, stats) => {
                const start = this.position.start;
                const end = Math.max(stats.size - 1, 0);

                if (end > 0) {
                    // normal operation
                    if (start <= end) {
                        setImmediate(() => {
                            this.read(start, end);
                        });
                    }

                    this.position = {start: end + 1, end};
                }
                else if (this.lastEnd == 0) {
                    // reset
                    // only resets the position if we get two zeros in a row, to account for windows wierdness
                    this.position = {start: 0, end: 0};
                }

                this.lastEnd = end;
            });
        });
    }


    read(start, end) {
        const reader = fs.createReadStream('', {
            fd: this.fd,
            start: start,
            end: end,
            autoClose: false
        });

        reader.on('data', (data) => {
            const chunk = data.toString();

            this.emit('data', chunk);

            this.lineBuffer += chunk;

            const lines = this.lineBuffer.split(this.options.lineTerminator);

            // if the last line in the linebuffer is not terminated, save it for later
            if (this.lineBuffer.endsWith(this.options.lineTerminator)) {
                this.lineBuffer = '';
                lines.pop();
            }
            else {
                this.lineBuffer = lines.pop();
            }

            for (let line of lines) {
                this.emit('line', line);
            }

        });
    }
}


module.exports.follow = (filename, options) => {
    return new Tail(filename, options);
}
