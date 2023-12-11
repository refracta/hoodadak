import React, {useContext, useEffect, useRef} from "react";
import {Box} from "@mui/material";
import ChatToolbar from "./chat/ChatToolbar";
import ChatContainerWrapper from "./chat/ChatLayoutContainer";
import ChatMessageBox from "../chat/ChatMessageBox";
import ChatControl from "./chat/ChatControl";
import {GlobalContext} from "../../App";
import useEffectOnce from "../../hooks/useEffectOnce";
import {Message, MessageType, RTCMessageType, WSMessage, WSMessageType} from "../../types/hoodadak";
import useWebRTC from "../../hooks/useWebRTC";

const RTC_FILE_BUFFER_SIZE = parseInt(process.env.REACT_APP_RTC_FILE_BUFFER_SIZE);

export default function ChatPage() {
    const context = useContext(GlobalContext);
    let {
        chat,
        chats,
        chatsDB,
        connectionStatus,
        lastJsonMessage,
        wsManager,
        messages,
        messagesDB,
        mode,
        sendJsonMessage,
        setChats,
        setConnectionStatus,
        setMessages,
        setMode,
        setUsers,
        user,
    } = context;

    let receivedBuffers: ArrayBuffer[] = [];
    let raw: Blob;
    let fileBytes = 0;
    let receivedBytes = 0;
    const chatRTC = useWebRTC({
        mode: 'chat',
        chatChannelConfigurator: (chatChannel) => {
            chatChannel.onopen = (error: Event) => {
                setConnectionStatus('connected');
            };

            chatChannel.onmessage = async ({data}: MessageEvent) => {
                data = JSON.parse(data);
                console.log(data);
                if (data.msg === RTCMessageType.SEND_MSG) {
                    let message = data.message;
                    message.user = chat?.user;
                    message.data.isMe = false;
                    if (message.data.type !== 'text') {
                        message.data.raw = raw;
                    }
                    await messagesDB.add(message);
                    setMessages(prevMessages => [...prevMessages, message]);
                    chat!.lastMessageTime = new Date(message.data.time);
                    chat!.lastMessage = message.data.type === 'text' ? message.data.raw : `[${message.data.type}] ${message.data.name}`;
                    setChats(chats = [chat!, ...chats.filter(c => c.user.hash !== chat?.user.hash)]);
                    await chatsDB.update(chat);
                } else if (data.msg === RTCMessageType.FILE_START) {
                    fileBytes = data.size;
                } else if (data.msg === RTCMessageType.FILE_COMPLETE) {
                    raw = new Blob(receivedBuffers);
                    receivedBuffers = [];
                    receivedBytes = 0;
                } else if (data.msg === RTCMessageType.MODE_CHANGE) {
                    if(data.mode === 'chat') {
                        videoRTC.close();
                    }
                    setMode(data.mode);
                }
            };
            chatChannel.onerror = (error: Event) => {
                console.log("chatChannel.OnError:", error);
            };

            chatChannel.onclose = (event: Event) => {
                console.log("chatChannel.OnClose", event);
                // closeConnection();
                // startRTC(mode);
            };
            (window as any).CC = chatChannel;
        },
        fileChannelConfigurator: (fileChannel) => {
            fileChannel.onmessage = async ({data}: MessageEvent) => {
                receivedBuffers.push(data);
                receivedBytes += data.byteLength;
                updateProgress('receive', receivedBytes, fileBytes);
            };
        }
    }, context);
    const {fcManager, ccManager} = chatRTC;
    const videoRTC = useWebRTC({mode: 'video'}, context);

    useEffect(() => {
        scrollToBottom();
    }, [chat, mode]);

    useEffectOnce(() => {
        if (user) {
            wsManager.sendLoginMessage(user);
        }
    }, [user]);

    useEffect(() => {
        if (chat?.user) {
            wsManager.sendSelectUserMessage(chat?.user);
            chatRTC.close();
            videoRTC.close();
        }
    }, [chat?.user]);

    useEffect(() => {
        let message: WSMessage = lastJsonMessage;
        if (message?.msg === WSMessageType.USERS) {
            setUsers(message.users);
        } else if (message?.msg === WSMessageType.RTC_START) {
            chatRTC.start().catch(reportError);
        }
    }, [lastJsonMessage]);

    const [downloadPercent, setDownloadPercent] = React.useState<number>(0);
    const [uploadPercent, setUploadPercent] = React.useState<number>(0);
    const chatContainer = useRef<HTMLDivElement>(null);

    const isMaxScrollHeight = () => {
        return chatContainer.current ? chatContainer.current!.scrollTop + chatContainer.current!.clientHeight >= chatContainer.current!.scrollHeight : false;
    };
    const scrollToBottom = (delay: number = 0) => {
        setTimeout(_ => {
            if (chatContainer.current) {
                chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
            }
        }, delay);
    };

    function updateProgress(type: 'receive' | 'send', sentBytes: number, totalBytes: number) {
        const progress = sentBytes / totalBytes;
        const floorProgress = Math.floor(progress * 100);
        const isComplete = progress === 1;
        if (type === 'receive') {
            setDownloadPercent(floorProgress);
            if (isComplete) {
                setTimeout(_ => {
                    setDownloadPercent(0);
                }, 1000);
            }
        } else {
            setUploadPercent(floorProgress);
            if (isComplete) {
                setTimeout(_ => {
                    setUploadPercent(0);
                }, 1000);
            }
        }
        console.log(`전송 진행률 (${type}): ${progress * 100}%`);
    }

    const handleSendMessage = async (message: string, setMessage: React.Dispatch<React.SetStateAction<string>>) => {
        let msg: Message = {
            user: chat?.user,
            data: {raw: message, time: new Date(), type: 'text', isMe: true}
        } as Message;
        await messagesDB.add(msg);
        setMessages([...messages, msg]);
        chat!.lastMessageTime = new Date(msg.data.time);
        chat!.lastMessage = msg.data.raw;
        setChats(chats = [chat!, ...chats.filter(c => c.user.hash !== chat?.user.hash)]);
        await chatsDB.update(chat);

        setMessage('');
        ccManager.sendSendMsgMessage(msg);
        scrollToBottom();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        let file = event.target.files?.[0]!;
        let type: MessageType = 'file';
        let fileType = file.type;
        if (fileType.startsWith('image/')) {
            type = 'image';
        } else if (fileType.startsWith('video/')) {
            type = 'video';
        } else if (fileType.startsWith('audio/')) {
            type = 'audio';
        }

        let msg: Message = {
            user: chat?.user!,
            data: {raw: file, time: new Date(), name: file.name, type, isMe: true}
        };

        let offset = 0;
        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
            let buffer = e.target?.result as ArrayBuffer;
            fcManager.dataChannel?.send(buffer);
            offset += buffer.byteLength;
            if (offset === file.size) {
                ccManager.sendFileCompleteMessage();
                ccManager.sendSendMsgMessage(msg);
                await messagesDB.add(msg);
                setMessages([...messages, msg]);
                chat!.lastMessageTime = new Date(msg.data.time);
                chat!.lastMessage = msg.data.type === 'text' ? msg.data.raw : `[${msg.data.type}] ${msg.data.name}`;
                setChats(chats = [chat!, ...chats.filter(c => c.user.hash !== chat?.user.hash)]);
                await chatsDB.update(chat);
            }
            updateProgress('send', offset, file.size);
            if (offset < file.size) {
                readSlice(offset);
            }
        };
        const readSlice = (o: number) => {
            const slice = file.slice(offset, o + RTC_FILE_BUFFER_SIZE);
            fileReader.readAsArrayBuffer(slice);
        };

        ccManager.sendFileStartMessage(file.size);
        readSlice(0);
    };

    const onModeChangeClick = () => {
        if (mode === 'chat') {
            setMode(mode = 'video');
            videoRTC.start().catch(reportError);
        } else {
            setMode(mode = 'chat');
            videoRTC.close();
        }
        ccManager.sendChangeModeMessage(mode);
    }

    const chatMessages = messages.filter(m => m.user.hash === chat?.user.hash);
    return (
        <Box component="main" sx={{flexGrow: 1, width: '100%'}}>
            <ChatToolbar onModeChangeClick={onModeChangeClick}/>
            <ChatContainerWrapper>
                <div ref={chatContainer} style={{overflowY: 'auto'}}>
                    <div
                        style={{display: mode == 'chat' ? 'block' : 'none'}}>
                        {chatMessages.map(m =>
                            <ChatMessageBox key={new Date(m.data.time).getTime()} message={m}
                                            isMaxScrollHeight={isMaxScrollHeight}
                                            scrollToBottom={scrollToBottom}/>
                        )}
                    </div>
                    <div style={{height: '100%', display: mode == 'video' ? 'block' : 'none'}}>
                        <video style={{
                            width: '100%',
                            height: 'calc(50% - 8px)',
                            margin: 0,
                            marginTop: '8px'
                        }} ref={videoRTC.remoteVideo} autoPlay></video>
                        <video style={{
                            width: '100%',
                            height: 'calc(50% - 8px)',
                            margin: 0
                        }} ref={videoRTC.localVideo} autoPlay muted></video>
                    </div>
                </div>
                <ChatControl handleFileUpload={handleFileUpload}
                             handleSendMessage={handleSendMessage}
                             uploadPercent={uploadPercent}
                             downloadPercent={downloadPercent}
                             connectionStatus={connectionStatus}/>
            </ChatContainerWrapper>
        </Box>
    );
}