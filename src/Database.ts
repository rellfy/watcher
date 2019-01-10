import fs from 'fs';
import path from 'path';

class Database {

    private dbPath: string;
    private data!: object;
    
    public get Data(): object {
        return this.data;
    }

    /**
     * Set data object for key
     */
    public set DataKey(pair: KeyValuePair) {
        if (this.data[pair.key] != null && Array.isArray(this.data[pair.key]) && pair.value != null) {
            console.log('ALERT: Use Watcher.clearDataArray() instead');
            return;
        }

        this.data[pair.key] = pair.value;
        this.save();
    }

    constructor(dbPath: string) {
        this.dbPath = dbPath;
    }
    
    public async initialise() {
        await this.checkDatabase();
    }

    private async checkDatabase(): Promise<void> {
        if (!fs.existsSync(this.dbPath)) {
            fs.writeFileSync(this.dbPath, '{}');
            this.data = {};
            return;
        }

        await this.load();
    }

    public async load(): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.readFile(this.dbPath, this.data, (error, data: string | Buffer) => {
                if (error) {
                    reject(error);
                    return;
                }

                try {
                    this.data = JSON.parse(data.toString());
                } catch(exception) {
                    reject(exception);
                    return;
                }

                resolve();
            });
        });
    }

    public save(): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.dbPath, JSON.stringify(this.data), (error) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            });
        });
    }
    
    public pushDataArray(pair: KeyValuePair): void {
        if (this.data[pair.key] == null)
            return;

        this.data[pair.key].push(pair.value);
        this.save();
    }

    public clearDataArray(key: string): void {
        if (this.data[key] == null || !Array.isArray(this.data[key]))
            throw new Error('Mentioned key is not an aray in the dataset');

        this.data[key] = [];
        this.save();
    }
}

interface KeyValuePair {
    key: string;
    value: any;
}

export { Database, KeyValuePair };