import React from "react";
import {IMessage, MessageBox} from "react-chat-elements";
import {Message} from "../../types/hoodadak";

const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

const toMultilineText = (text: string) => {
    let textSplit = text.split('\n');
    return textSplit.map((line: string, index: number) => (
        <React.Fragment key={index}>
            {line}
            {textSplit.length - 1 !== index && <br/>}
        </React.Fragment>
    )) as any;
}

export default function ChatMessageBox({message, isMaxScrollHeight, scrollToBottom}: {
    message: Message
    isMaxScrollHeight?: () => boolean,
    scrollToBottom?: () => void,
}) {
    let uniqueNumber = new Date(message.data.time).getTime();
    const defaultOptions: IMessage = {
        text: '',
        title: '',
        type: '',
        className: message.data.isMe ? 'rce-mbox-custom-right' : 'rce-mbox-custom-left',
        position: message.data.isMe ? 'right' : 'left',
        date: message.data.time,
        id: uniqueNumber,
        focus: false,
        forwarded: false,
        replyButton: false,
        removeButton: false,
        notch: true,
        retracted: false,
        titleColor: 'black',
        status: 'sent'
    };

    let isNeedScroll = false;
    if (isMaxScrollHeight) {
        isNeedScroll = isMaxScrollHeight();
    }
    if (message.data.type === 'text') {
        return (<MessageBox {...defaultOptions} type='text' text={toMultilineText(message.data.raw)}/>);
    } else if (message.data.type === 'image') {
        return (
            <MessageBox
                {...defaultOptions}
                type='photo'
                title={message.data.name!}
                data={{
                    uri: URL.createObjectURL(message.data.raw),
                    name: message.data.name,
                    status: undefined as any
                }}
                onClick={(e) => {
                    if ((e.target as any).tagName === 'IMG') {
                        downloadBlob(message.data.raw, message.data.name!);
                    }
                }}
                onLoad={() => {
                    if (isNeedScroll && scrollToBottom) {
                        scrollToBottom();
                    }
                }}
            />
        );
    } else if (message.data.type === 'video') {
        return (
            <MessageBox
                {...defaultOptions}
                type='video'
                controlsList={''}
                data={{
                    videoURL: URL.createObjectURL(message.data.raw),
                    name: message.data.name,
                    status: {
                        click: false, loading: 0.5,
                        download: true
                    }
                }}
                title={message.data.name!}
                date={message.data.time}
                onLoad={() => {
                    if (isNeedScroll && scrollToBottom) {
                        scrollToBottom();
                    }
                }}
            />
        );
    } else if (message.data.type === 'audio') {
        return (
            <MessageBox
                {...defaultOptions}
                type='audio'
                text={''}
                data={{
                    audioURL: URL.createObjectURL(message.data.raw),
                    name: message.data.name
                }}
                title={message.data.name!}
                date={message.data.time}
                onLoad={() => {
                    if (isNeedScroll && scrollToBottom) {
                        scrollToBottom();
                    }
                }}
            />
        );
    } else if (message.data.type === 'file') {
        return (
            <MessageBox
                {...defaultOptions}
                type='file'
                text={message.data.name!}
                data={{
                    uri: URL.createObjectURL(message.data.raw),
                    name: message.data.name,
                    status: {
                        click: false,
                        loading: 0,
                    }
                }}
                onClick={() => {
                    downloadBlob(message.data.raw, message.data.name!)
                }}
                date={message.data.time}
            />
        );
    }
    return <></>;
};