import { EventEmitter } from "events";
import * as http from 'http';
import { CosmicAPI } from "./CosmicAPI";
import { CosmicData } from "../CosmicData";

export class CosmicAPIWebSocketClient extends EventEmitter {
    public connected = false;
    public ip: string;

    constructor(
        public ws: WebSocket,
        req: http.ClientRequest
    ) {
        super();
        this.connected = true;
        this.bindEventListeners();
    }

    public send(data: Record<string, any>): void {
        if (!this.connected) return;

        this.ws.send(JSON.stringify(data));
    }

    public destroy(): boolean {
        try {
            if (!this.connected) return;
            this.ws.close();
            delete this.ws;
            this.connected = false;

            CosmicAPI.removeClient(this);

            return true;
        } catch (err) {
            return false;
        }
    }

    protected bindEventListeners() {
        this.ws.addEventListener('message', async (data: any) => {
            if (!this.connected) return;
                let msg;
                try {
                    msg = JSON.parse(data.data);
                } catch (err) {
                    return;
                }

                switch (msg.m) {
                    case 'hi':
                        this.send({ m: 'hi' });
                        break;
                    case 'bye':
                        this.destroy();
                        break;
                    case 'inventory':
                        if (!msg.id) return;

                        let inventory = await CosmicData.getInventory(msg.id);
                        if (!inventory) {
                            return this.send({ m: 'error', error: 'inventory not found' });
                        }

                        this.send({ m: 'inventory', inventory });
                        break;
                }
        });
    }

    // TODO API key verification
    public async verifyAPIKey(key: Uint8Array) {
        let keys = await CosmicData.getAPIKeys(this.ip);
        let hasKey = false;

        // for (let k of keys) {
        //     if (key == k) {
        //         hasKey = true;
        //         break;
        //     }
        // }

        return hasKey;
    }
}
