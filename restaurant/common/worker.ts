import { SDKTopics } from "./models/topics";

export class SharedChatWorker extends SharedWorker {

    socket: SocketManager;
    instances = 0;
    connections = [];

    URI: string;

    // Called when a  new worker is connected.
    // Worker is created at
    onconnect = (e: { ports: any[]; }): void => {
        const port = e.ports[0];

        port.start();
        port.onmessage = this._handleEventFromMainThread.bind(port);
        this.connections.push(port);
        this.instances++;
    };

    // Publish ONLY to the first connection.
    // Let the caller decide on how to sync this with other tabs
    callback = (topic: SDKTopics, payload: string) => {
        this.connections[0].postMessage({
            topic,
            payload,
        });
    }

    _handleEventFromMainThread = e => {
        switch (e.data.topic) {
            case SDKTopics.CONNECT: {
                const config = e.data.payload;
                if (!this.socket) {
                    // Establishes a WebSocket connection with the server
                    this.socket = new SocketManager({ ...})
                } else {
                    this.callback(SDKTopics.CONNECTED, '');
                }
                break;
            }
            case SDKTopics.CLOSE: {
                const index = this.connections.indexOf(this);
                if (index != -1 && this.instances > 0) {
                    this.connections.splice(index, 1);
                    this.instances--;
                }
                break;
            }
            // Forward everything else to the server
            default: {
                const payload = e.data;
                this.socket.sendMessage(payload);
                break;
            }
        }
    }
}
