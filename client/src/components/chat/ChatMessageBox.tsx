import React from "react";
import {Message, User} from "../../types/hoodadak";
import {IMessage, MessageBox, MessageType} from "react-chat-elements";

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

export default function ChatMessageBox({message}: {
    message: Message
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

    if (message.data.type === 'text') {
        let props = {title: ''};
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
                    status: {click: false, loading: 0}
                }}
                onClick={() => downloadBlob(message.data.raw, message.data.name!)}
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
            />
        )
            ;
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