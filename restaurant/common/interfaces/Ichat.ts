import { ChatMessage } from "../models/message";
import { MessageReceipt } from "../models/receipt";
import { SDKTopics } from "../models/topics";
import { ICallBack } from "./Icallback";

export interface IChatSDK {
    sendMessage: (message: ChatMessage) => string;
    sendReadReceipt: (receipt: MessageReceipt) => void;
    on: (callback: ICallBack) => void;
    off: (topic?: SDKTopics) => void;
    close: () => void;
}
