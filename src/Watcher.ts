import request from 'request';
import { Database } from "./Database";
import { EventEmitter } from 'events';
import { RequestOptions } from 'https';

class Watcher extends EventEmitter {

    private endpoint: string;
    private options: request.CoreOptions | {};
    private database?: Database | undefined;
    private interval: number;

    public set Options(value: request.CoreOptions) {
        this.options = value;
    }

    public get Database(): Database | undefined {
        return this.database;
    }

    constructor(config: WatcherConfig) {
        super();

        this.database = config.dbPath != null ? new Database(config.dbPath) : undefined;
        this.endpoint = config.endpoint;
        this.interval = config.interval;
        this.options = {};

    }
    
    public async watch() {
        if (this.database != null) {
            await this.database.initialise();
        }

        setInterval(this.fetchEndpoint.bind(this), this.interval);
    }

    async fetchEndpoint() {
        this.emit('pre');

        await request(this.endpoint, this.options, (error, response, body) => {
            this.emit('post', error, request, body);
        });
    }
}

interface WatcherConfig {
    endpoint: string;
    interval: number;
    dbPath?: string;
}

export { Watcher, WatcherConfig};