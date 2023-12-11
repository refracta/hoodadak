import {
    Message,
    RTCConnectionMode,
    RTCFileCompleteMessage,
    RTCFileStartMessage,
    RTCMessageType,
    RTCModeChangeMessage,
    RTCSendMsgMessage
} from "../types/hoodadak";

export default class DCManager {
    public readonly dataChannel: RTCDataChannel;

    constructor(dataChannel: RTCDataChannel) {
        this.dataChannel = dataChannel;
    }

    json(data: any) {
        this.dataChannel.send(JSON.stringify(data));
    }

    sendChangeModeMessage(mode: RTCConnectionMode) {
        this.json({
            msg: RTCMessageType.MODE_CHANGE,
            mode
        } as RTCModeChangeMessage);
    }

    sendSendMsgMessage(message: Message) {
        this.json({
            msg: RTCMessageType.SEND_MSG,
            message
        } as RTCSendMsgMessage);
    }

    sendFileStartMessage(size: number) {
        this.json({
            msg: RTCMessageType.FILE_START,
            size
        } as RTCFileStartMessage);
    }

    sendFileCompleteMessage() {
        this.json({
            msg: RTCMessageType.FILE_COMPLETE
        } as RTCFileCompleteMessage);
    }
}