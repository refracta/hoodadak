import React, {useContext, useEffect, useRef} from "react";
import {Box} from "@mui/material";
import ChatToolbar from "./chat/ChatToolbar";
import ChatContainerWrapper from "./chat/ChatLayoutContainer";
import ChatMessageBox from "../chat/ChatMessageBox";
import ChatControl from "./chat/ChatControl";
import {GlobalContext} from "../../App";
import useEffectOnce from "../../hooks/useEffectOnce";
import {Chat, Message, MessageType, RTCMessageType, User, WSMessage, WSMessageType} from "../../types/hoodadak";
import useWebRTC from "../../hooks/useWebRTC";
import DCManager from "../../network/DCManager";


const RTC_FILE_BUFFER_SIZE = parseInt(process.env.REACT_APP_RTC_FILE_BUFFER_SIZE);

export default function ChatPage() {
    const context = useContext(GlobalContext);
    let {
        chat,
        setChat,
        chats,
        chatsDB,
        connectionStatus,
        lastJsonMessage,
        lastMessage,
        wsManager,
        messages,
        messagesDB,
        mode,
        setChats,
        setConnectionStatus,
        setMessages,
        setMode,
        setUsers,
        setting,
        settingData,
        user,
        users
    } = context;

    useEffect(() => {
        if (setting?.useWaitingNotification) {
            if (Notification.permission !== "denied") {
                Notification.requestPermission().then((permission) => {
                    console.log(`Notification.requestPermission(): ${permission}`);
                });
            }
        }
    }, [settingData]);

    let receivedBuffers: ArrayBuffer[] = [];
    let raw: Blob;
    let fileBytes = 0;
    let receivedBytes = 0;

    let chatRTC = useWebRTC({
        mode: 'chat',
        chatChannelConfigurator: (receiveChannel, sendChannel) => {
            receiveChannel.onopen = (error: Event) => {
                setConnectionStatus('connected');
            };
            const ccManager = new DCManager(sendChannel);
            receiveChannel.onmessage = async ({data}: MessageEvent) => {
                data = JSON.parse(data);
                if (data.msg === RTCMessageType.SEND_MSG) {
                    let message = data.message;
                    delete message.id;
                    message.user = chat?.user;
                    message.data.time = new Date(message.data.time);
                    message.data.isMe = false;
                    message.data.status = undefined;
                    if (message.data.type !== 'text') {
                        message.data.raw = raw;
                    }
                    message.id = await messagesDB.add(message);
                    setMessages(prevMessages => [...prevMessages, message]);
                    chat = chats.find(c => c.user.hash === chat?.user.hash);
                    chat!.lastMessageTime = new Date(message.data.time);
                    chat!.lastMessage = message.data.type === 'text' ? message.data.raw : `[${message.data.type}] ${message.data.name}`;
                    setChats(prevChats => [...prevChats]);
                    await chatsDB.update(chat);
                    ccManager.sendReceiveMsgMessage(message.data.time);
                } else if (data.msg === RTCMessageType.RECEIVE_MSG) {
                    let time = new Date(data.time).getTime();
                    setMessages(messages => {
                        for (let i = messages.length - 1; i >= 0; i--) {
                            let currentMessage = messages[i];
                            let messageTime = new Date(currentMessage.data.time).getTime();
                            if (messageTime === time) {
                                currentMessage.data.status = 'sent';
                                messagesDB.update(currentMessage);
                                break;
                            }
                        }
                        return [...messages];
                    });
                } else if (data.msg === RTCMessageType.FILE_START) {
                    fileBytes = data.size;
                } else if (data.msg === RTCMessageType.FILE_COMPLETE) {
                    raw = new Blob(receivedBuffers);
                    receivedBuffers = [];
                    receivedBytes = 0;
                } else if (data.msg === RTCMessageType.MODE_CHANGE) {
                    if (data.mode === 'chat') {
                        videoRTC.close();
                    }
                    setMode(data.mode);
                } else {
                    console.log(data);

                }
            }

            receiveChannel.onerror = (error: Event) => {
                console.log("receiveChannel.OnError:", error);
                setConnectionStatus('disconnected');
                chatRTC.close();
            };

            receiveChannel.onclose = (event: Event) => {
                console.log("receiveChannel.OnClose", event);
                setConnectionStatus('disconnected');
                chatRTC.close();
            };
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
        setUploadPercent(0);
        setDownloadPercent(0);
    }, [chat, mode]);

    useEffect(() => {
        setUploadPercent(0);
        setDownloadPercent(0);
    }, [connectionStatus]);

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
            if (setting?.useWaitingNotification) {
                const oldUsers = users.filter((u: User) => u?.selectedUser?.hash === user?.hash);
                const newUsers = message.users.filter((u: User) => u?.selectedUser?.hash === user?.hash) as User[];
                const targetUsers = newUsers.filter(n => !oldUsers.find(o => o.hash === n.hash)).filter(u => u.hash !== chat?.user.hash);

                for (let user of targetUsers) {
                    sendWaitingNotification(user);
                }
            }
            setUsers(message.users);
        } else if (message?.msg === WSMessageType.RTC_START) {
            chatRTC.start().catch(reportError);
        }
    }, [lastMessage?.timeStamp]);

    const [downloadPercent, setDownloadPercent] = React.useState<number>(0);
    const [uploadPercent, setUploadPercent] = React.useState<number>(0);
    const chatContainer = useRef<HTMLDivElement>(null);

    const isMaxScrollHeight = () => {
        return chatContainer.current ? chatContainer.current!.scrollTop + chatContainer.current!.clientHeight >= chatContainer.current!.scrollHeight - 50 : false;
    };
    const scrollToBottom = (delay: number = 0) => {
        setTimeout(_ => {
            if (chatContainer.current) {
                chatContainer.current.scrollTop = chatContainer.current.scrollHeight;
            }
        }, delay);
    };
    const sendWaitingNotification = (user: User) => {
        if (Notification.permission === "granted") {
            try {
                const notification = new Notification("Hoodadak", {
                    icon: 'logo.svg',
                    body: `${user.name} is waiting for your connection.`
                });

                notification.onclick = async () => {
                    let chat = chats.find(c => user.hash === c.user.hash);
                    let nameBasedChat = chats.find(c => user.name === c.user.name && !c.user.hash);
                    if (nameBasedChat) {
                        chat = nameBasedChat;
                    }
                    if (!chat) {
                        chat = {user, lastMessage: ''};
                        let id = await chatsDB.add(chat);
                        chat = {...chat, id};
                        setChats(await chatsDB.getAll() as Chat[]);
                    }
                    setChat(chat);
                };
            } catch (e) {

            }
        }
    }

    useEffectOnce(() => {
        let isNeedScroll = isMaxScrollHeight();
        let lastLength = document.querySelectorAll('.rce-container-mbox').length;
        setInterval(_ => {
            let messages = document.querySelectorAll('.rce-container-mbox');
            let video = messages[messages.length - 1]?.querySelector('video');
            if (video && !video.oncanplay) {
                const currentIsNeedScroll = isNeedScroll;
                video.oncanplay = function () {
                    if (currentIsNeedScroll) {
                        scrollToBottom();
                    }
                }
            }
            if (isNeedScroll && lastLength !== messages.length) {
                scrollToBottom();
            }
            isNeedScroll = isMaxScrollHeight();
            lastLength = messages.length;
        }, 100);
    }, []);

    function updateProgress(type: 'receive' | 'send', sentBytes: number, totalBytes: number) {
        const progress = sentBytes / totalBytes;
        const floorProgress = Math.floor(progress * 100);
        const isComplete = progress === 1;
        if (type === 'receive') {
            setDownloadPercent(floorProgress);
            if (isComplete) {
                setDownloadPercent(0);
            }
        } else {
            setUploadPercent(floorProgress);
            if (isComplete) {
                setUploadPercent(0);
            }
        }
        console.log(`전송 진행률 (${type}): ${progress * 100}%`);
    }

    const handleSendMessage = async (message: string, setMessage: React.Dispatch<React.SetStateAction<string>>) => {
        let msg: Message = {
            user: chat?.user,
            data: {raw: message, time: new Date(), type: 'text', isMe: true, status: 'waiting'}
        } as Message;
        msg.id = await messagesDB.add(msg);
        setMessages(messages = [...messages, msg]);
        ccManager?.sendSendMsgMessage(msg);

        chat = chats.find(c => c.user.hash === chat?.user.hash);
        chat!.lastMessageTime = new Date(msg.data.time);
        chat!.lastMessage = msg.data.raw;
        setChats(prevChats => [...prevChats]);
        await chatsDB.update(chat);
        setMessage('');
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
            data: {raw: file, time: new Date(), name: file.name, type, isMe: true, status: 'waiting'}
        };
        msg.id = await messagesDB.add(msg);
        setMessages(prevMessages => [...prevMessages, msg]);

        chat = chats.find(c => c.user.hash === chat?.user.hash);
        chat!.lastMessageTime = new Date(msg.data.time);
        chat!.lastMessage = msg.data.type === 'text' ? msg.data.raw : `[${msg.data.type}] ${msg.data.name}`;
        setChats(prevChats => [...prevChats]);
        await chatsDB.update(chat);

        let offset = 0;
        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
            let buffer = e.target?.result as ArrayBuffer;
            fcManager?.dataChannel?.send(buffer);
            offset += buffer.byteLength;
            if (offset === file.size) {
                ccManager?.sendFileCompleteMessage();
                ccManager?.sendSendMsgMessage(msg);
                event.target.value = "";
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

        ccManager?.sendFileStartMessage(file.size);
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
        ccManager?.sendChangeModeMessage(mode);
    }

    const chatMessages = messages.filter(m => m.user.hash === chat?.user.hash);
    return (
        <Box component="main" sx={{flexGrow: 1, width: '100%'}}>
            <ChatToolbar onModeChangeClick={onModeChangeClick}/>
            <ChatContainerWrapper>
                <div ref={chatContainer} style={{overflowY: 'auto'}}>
                    <div
                        style={{display: mode === 'chat' ? 'block' : 'none'}}>
                        {chatMessages.map(m =>
                            <ChatMessageBox key={new Date(m.data.time).getTime()} message={m}
                                            isMaxScrollHeight={isMaxScrollHeight}
                                            scrollToBottom={scrollToBottom}/>
                        )}
                    </div>
                    <div style={{height: '100%', display: mode === 'video' ? 'block' : 'none'}}>
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