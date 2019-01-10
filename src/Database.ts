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
        Database.CheckKeyValuePair(this.data, pair);
        this.data[pair.key] = pair.value;
        this.save();
    }

    constructor(dbPath: string) {
        this.dbPath = dbPath;
    }
    
    public static CheckKeyValuePair(data: object, pair: KeyValuePair, constructor?: any): void {
        if (constructor != null && typeof data[pair.key].constructor != constructor)
        throw new Error(`Invalid data key ${pair.key}`);
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
        Database.CheckKeyValuePair(this.data, pair, Array);
        this.data[pair.key].push(pair.value);
        this.save();
    }
}

interface KeyValuePair {
    key: string;
    value: any;
}

export { Database, KeyValuePair };