<!--  [![progress-banner](https://backend.codecrafters.io/progress/redis/86e1abe1-6abc-4229-9e58-46c9b11a30dd)](https://app.codecrafters.io/users/codecrafters-bot?r=2qF) -->

# Redis From Scratch

Implementing redis from scratch to complete the challenge on codecrafters.io.

More features on the way.

## Running

```bash
./your_program.sh
```

## Usage

```bash
# Start the server
$ ./your_program.sh

# Using another terminal, query the server.
# You can use netcat, but you will have to encode the inputs using the redis protocol.
# Recommend using the official redis-cli client.
$ redis-cli set foo bar
# -> OK
$ redis-cli get foo
# -> "bar"
#
# Expiry time using PX
$ redis-cli set hello world PX 5000
$ redis-cli get hello
# -> "world"
# After 5 seconds (5000 milliseconds) this key is expired
$ redis-cli get hello
# -> (nil)
```
