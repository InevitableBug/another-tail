# node-tail

A Node.js module that tails a file.

## Usage

```js
const tail = require('./tail.js');

let follow = tail.follow('./foo.txt');

follow.on('data', function(chunk) {
    console.log(chunk);
});
```


## License
MIT
