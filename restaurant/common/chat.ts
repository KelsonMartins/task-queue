import { ICallBack } from "./interfaces/Icallback";
import { IChatSDK } from "./interfaces/Ichat";
import { MessageReceipt } from "./models/receipt";
import { SDKTopics } from "./models/topics";
import { SharedChatWorker } from "./worker";

export class GrabChatSDK implements IChatSDK {
    channel: BroadcastChannel;
    worker: SharedWorker;

    constructor(config) {
        this.channel = new BroadcastChannel('incoming_events');
        this.channel.onmessage = ({ data }) => {
            switch (data.type) {
                // Handle events from other tabs
                // .....
            }
        }
        this.worker = new SharedChatWorker('./worker', {
            type: 'module',
            name: `${config.appID}-${config.appEnv}`,
            credentials: 'include',
        });
        this.worker.port.start();
        // Publish a connected event, so the worker manager can register this connection
        this.worker.port.postMessage({
            topic: SDKTopics.CONNECT,
            payload: 'We are connected!'
        });
        // Incoming event from the shared worker
        this.worker.port.onmessage = this._handleIncomingMessage;
        // Disconnect this port before tab closes
        addEventListener('beforeunload', this.close);
    }

    sendReadReceipt: (receipt: MessageReceipt) => void;
    on: (callback: ICallBack) => void;
    off: (topic?: SDKTopics) => void;

    sendMessage(message): string {
        // Attempt a delivery of the message
        this.worker.port.postMessage({
            topic: SDKTopics.NEW_MESSAGE,
            getPayload(message: string)
        });
        // Send the message to all tabs to keep things in sync
        this.channel.postMessage(getPayload(message));
    }

    // Hit if this connection is the leader of the SharedWorker connection
    _handleIncomingMessage(event) {
        // Send an MESSAGE ACK to our servers confirming receipt of the message
        this.worker.port.postMessage({
            topic: SDKTopics.MESSAGE_ACK,
            payload: '',
        });

        if (shouldBroadcast(event.type)) {
            this.channel.postMessage(event);
        }

        this.worker.callback(event);
    }

    close(): void {
        this.worker.port.postMessage({
            topic: SDKTopics.CLOSE,
            payload: 'We are closed!'
        });
        removeEventListener('beforeunload', this.close);
    }
}