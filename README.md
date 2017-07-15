# another-tail

Yet another Node.js module that tails a file.  Handles file trunction.

## Usage

```js
const tail = require('another-tail');

let follow = tail.follow('./foo.txt');

follow.on('data', function(chunk) {
    console.log(chunk);
});

follow.on('line', function(line) {
    console.log(line);
})
```

## Events

### data
New data in the file as a string.

### line
A full new line as a string.

## License
MIT
