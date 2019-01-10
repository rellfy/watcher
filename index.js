// Make sure to run "npm run build" first
const Watcher = require('./out/Watcher.js').Watcher;
const path = require('path');

const config = {
    endpoint: '127.0.0.1/api/something',
    interval: 1 * 60 * 1000, // one minute
    dbPath: path.join(__dirname , 'data.json') // optional, if not set Database module won't be included; relative to ./out
};

async function initialiseWatcher() {
    const watcher = new Watcher(config);
    
    await watcher.watch();

        // add new KeyValuePair for array to database
    watcher.Database.DataKey = {
        key: 'arrayField',
        value: []
    }

    // set request options for first request (from 'request' NPM module), endpoint already set (can be reset)
    watcher.Options = {
        body: {
            foo: 'bar'
        }
    };

    watcher.on('pre', () => {
        // will send request in next tick
        console.log('sending request...');
    });

    watcher.on('post', (error, request, body) => {
        if (error)
            throw error;

        try {
            body = JSON.parse(body);
        } catch(exception) {
            return exception;
        }

        // request was sent
        // can set request options for next request
        watcher.Options = {
            body: {
                foo: ''
            }
        };

        // push response body to previously defined array in database
        watcher.Database.pushDataArray({
            key: 'arrayField',
            body
        });

        // add custom object to Database from request
        watcher.Database.DataKey = {
            key: `customField-${body.some.id}`,
            value: body.some.value
        }

        // get whole database
        const database = watcher.Database.Data;
    });
}

initialiseWatcher();