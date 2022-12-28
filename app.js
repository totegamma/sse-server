import express, { json } from 'express';
import serverSentEvents from 'server-sent-events';

const app = express();
app.use(json())

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', '*')
    res.header('Access-Control-Allow-Headers', '*')

    if ('OPTIONS' === req.method) res.send(200);
    else next();
});

var clients = [];

app.get('/connect', serverSentEvents, function (req, res) {
    req.on("close", function() {
        clients = clients.filter(e => e !== res);
        console.log('connection closed!');
    });

    req.on("end", function() {
        clients = clients.filter(e => e !== res);
        console.log('connection end!');
    });

    console.log(`client connected! (${clients.length})`);
    clients.push(res);
    res.sse('data: {"type": "hello"}' + '\n\n');
});

app.post('/event', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    clients.forEach(e => e?.sse('data: ' + JSON.stringify({"type": "event", "body": req.body}) + '\n\n'));
    res.send('OK\n\n');
})

app.get('/health', function (_, res) {
    res.send(`OK (${clients.length})\n\n`);
});

var server = app.listen(3000);

server.on('error', function (err) {
    console.error(err);
    process.exit(1);
});

