import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import './styles/App.scss';
import {initDB, useIndexedDB} from "react-indexed-db-hook";
import {DBConfig} from "./db/DBConfig";
import StartPage from "./components/pages/StartPage";
import Main from "./components/base/Main";
import useWebSocket from "react-use-websocket";
import {
    Chat,
    Message,
    User,
    WSLoginMessage,
    WSMessage,
    WSMessageType,
    WSRTCICEExchangeMessage,
    WSRTCSDPExchangeMessage,
    WSSelectUserMessage
} from "./types/hoodadak";
import useEffectOnce from "./hooks/useEffectOnce";
import KickOverlay from "./components/overlay/KickOverlay";
import {AppContext} from "./types/hoodadak-client";
import {IconButton, Paper, TextField} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import {MessageBox} from "react-chat-elements";

initDB(DBConfig);

export default function App() {
    const userDB = useIndexedDB('user');
    const chatsDB = useIndexedDB('chats');
    const messagesDB = useIndexedDB('messages');
    const [user, setUser] = useState<User>();
    const [users, setUsers] = useState<User[]>([]);
    let [chat, setChat] = useState<Chat>();
    let [chats, setChats] = useState<Chat[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [toggled, setToggled] = React.useState<boolean>(false);
    const [kickReason, setKickReason] = useState<string | undefined>(undefined);
    const [mode, setMode] = React.useState<'chat' | 'video'>('chat');
    const [connectionStatus, setConnectionStatus] = React.useState<'connected' | 'disconnected'>('disconnected');
    const [downloadProgress, setDownloadProgress] = React.useState<number>(0);
    const [uploadProgress, setUploadProgress] = React.useState<number>(0);
    const chatContainer = useRef<HTMLDivElement>(null);
    const localVideo = useRef<HTMLVideoElement>(null);
    const remoteVideo = useRef<HTMLVideoElement>(null);

    useEffectOnce(() => {
        (async () => {
            let user = (await userDB.getAll())[0];
            setUser(user);
        })();
    }, [userDB]);

    useEffectOnce(() => {
        (async () => {
            let chats = await chatsDB.getAll();
            setChats(chats);
        })();
    }, [chatsDB]);

    useEffect(() => {
        scrollChatContainer(250);
        scrollChatContainer(500);
        scrollChatContainer(1000);
    }, [chat]);

    useEffect(() => {
        scrollChatContainer();
    }, [mode]);

    useEffectOnce(() => {
        (async () => {
            let messages = await messagesDB.getAll();
            setMessages(messages);
        })();
    }, [messagesDB]);

    const {
        sendMessage,
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
        getWebSocket
    } = useWebSocket<WSMessage>((window.location.protocol.startsWith('https') ? 'wss://' : 'ws://') + window.location.host + '/websocket', {
        shouldReconnect: (closeEvent) => true,
        share: true
    });

    useEffectOnce(() => {
        if (user) {
            delete (user as any)?.id;
            sendJsonMessage({msg: WSMessageType.LOGIN, user} as WSLoginMessage);
        }
    }, [user]);

    useEffect(() => {
        if (chat?.user) {
            sendJsonMessage({msg: WSMessageType.SELECT_USER, user: chat?.user} as WSSelectUserMessage);
            closeConnection();
        }
    }, [chat?.user]);

    const mediaConstraints = {
        audio: true,            // We want an audio track
        video: {
            aspectRatio: {
                ideal: 1.333333     // 3:2 aspect is preferred
            }
        }
    };
    let [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();
    let [dataChannel, setDataChannel] = useState<RTCDataChannel>();
    let [fileChannel, setFileChannel] = useState<RTCDataChannel>();

    function initPeerConnection(mode: 'chat' | 'video') {
        if (!peerConnection) {
            setPeerConnection(peerConnection = createPeerConnection(mode));
        }
    }

    let [webcamStream, setWebcamStream] = useState<MediaStream>();

    async function initWebcamStream() {
        try {
            webcamStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
            setWebcamStream(webcamStream);
            if (localVideo.current) {
                localVideo.current.srcObject = webcamStream;
            }
            (global as any).WCST = webcamStream;
        } catch (err) {
            console.error(err);
            return;
        }
    }

    let [transceiver, setTransceiver] = useState<(track: MediaStreamTrack) => RTCRtpTransceiver | undefined>();

    function addTransceiver() {
        try {
            webcamStream!.getTracks().forEach(
                (track => peerConnection?.addTransceiver(track, {streams: [webcamStream!]}))
            );
            setTransceiver(transceiver);
        } catch (e) {
            console.error(e);
        }
    }

    function closeConnection() {
        if (peerConnection) {
            peerConnection.ontrack = null;
            peerConnection.onicecandidate = null;
            peerConnection.oniceconnectionstatechange = null;
            peerConnection.onsignalingstatechange = null;
            peerConnection.onicegatheringstatechange = null;
            peerConnection.onnegotiationneeded = null;

            // Stop all transceivers on the connection

            peerConnection.getTransceivers().forEach(transceiver => {
                try {
                    transceiver.stop();
                } catch (e) {

                }
            });

            if (localVideo.current!.srcObject) {
                localVideo.current!.pause();
                let tracks = (localVideo.current!.srcObject as any).getTracks();
                tracks.forEach((track: MediaStreamTrack) => {
                    track?.stop();
                });
            }

            peerConnection.close();
            setPeerConnection(peerConnection = undefined)
            setWebcamStream(webcamStream = undefined);
            setConnectionStatus('disconnected');
        }
    }

    function addDataChannel() {
        try {
            const dataChannelRaw = peerConnection!.createDataChannel("chat");
            const fileChannelRaw = peerConnection!.createDataChannel("file");

            const handleDataChannelOpen = (event: Event) => {
                console.log("dataChannelRaw.OnOpen", event);
                setConnectionStatus('connected');
            };

            let closeSide = false;
            let mode: 'chat' | 'video' = 'video';
            let receivedBuffers: ArrayBuffer[] = [];
            let raw: Blob;
            let fileBytes = 0;
            let fileType: string;
            let fileName: string;
            let receivedBytes = 0;
            const handleDataChannelMessageReceived = async ({data}: MessageEvent) => {
                data = JSON.parse(data);
                console.log(data);
                if (data.msg === 'ChangeMode') {
                    console.log('ChangeMode');
                    setMode(mode = data.mode);
                    closeConnection();
                    closeSide = true;
                } else if (data.msg === 'SendMessage') {
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


                    scrollChatContainer(250);
                    scrollChatContainer(500);
                    scrollChatContainer(1000);
                } else if (data.msg === 'FileStart') {
                    fileBytes = data.size;
                    fileName = data.name;
                    fileType = data.type;
                } else if (data.msg === 'FileComplete') {
                    raw = new Blob(receivedBuffers);
                    receivedBuffers = [];
                    receivedBytes = 0;
                }
            };

            const handleDataChannelError = (error: Event) => {
                console.log("dataChannelRaw.OnError:", error);
            };

            const handleDataChannelClose = (event: Event) => {
                console.log("dataChannelRaw.OnClose", event);
                closeConnection();
                if (closeSide) {
                    closeSide = false;
                    startRTC(mode);
                }
            };

            const handleFileChannelOpen = (event: Event) => {

            };

            const handleFileChannelMessageReceived = async ({data}: MessageEvent) => {
                receivedBuffers.push(data);
                receivedBytes += data.byteLength;
                updateProgress('receive', receivedBytes, fileBytes);
            };

            const handleFileChannelError = (error: Event) => {
            };

            const handleFileChannelClose = (event: Event) => {

            };

            dataChannelRaw.onopen = handleDataChannelOpen;
            dataChannelRaw.onmessage = handleDataChannelMessageReceived;
            dataChannelRaw.onerror = handleDataChannelError;
            // dataChannelRaw.onclose = handleDataChannelClose;

            fileChannelRaw.onopen = handleFileChannelOpen;
            fileChannelRaw.onmessage = handleFileChannelMessageReceived;
            fileChannelRaw.onerror = handleFileChannelError;
            // fileChannel.onclose = handleFileChannelClose;

            peerConnection!.ondatachannel = (event) => {
                console.log("on data dataChannelRaw")
                let receiveChannel = event.channel;
                if (receiveChannel.label === "chat") {
                    receiveChannel.onopen = handleDataChannelOpen;
                    receiveChannel.onmessage = handleDataChannelMessageReceived;
                    receiveChannel.onerror = handleDataChannelError;
                    receiveChannel.onclose = handleDataChannelClose;
                } else if (receiveChannel.label === "file") {
                    receiveChannel.onopen = handleFileChannelOpen;
                    receiveChannel.onmessage = handleFileChannelMessageReceived;
                    receiveChannel.onerror = handleFileChannelError;
                    receiveChannel.onclose = handleFileChannelClose;
                }
            };

            setDataChannel(dataChannel = dataChannelRaw);
            setFileChannel(dataChannel = fileChannelRaw);
            (global as any).DC = dataChannelRaw;
        } catch (e) {
            console.error(e);
        }
    }


    function createPeerConnection(mode: 'chat' | 'video') {
        const connection = new RTCPeerConnection({
            iceServers: [
                {urls: "stun:stun.l.google.com:19302"},
                {
                    urls: "turn:freeturn.net:3478",
                    credential: 'free',
                    username: 'free'
                }
            ]
        });

        connection.onicecandidate = function handleICECandidateEvent(event) {
            if (event.candidate) {
                console.log("Candidate:", event.candidate.candidate);
                sendJsonMessage({
                    msg: WSMessageType.RTC_ICE_EXCHANGE,
                    candidate: event.candidate
                } as WSRTCICEExchangeMessage)
            }
        };
        connection.oniceconnectionstatechange = function handleICEConnectionStateChangeEvent(event) {
            console.log("iceConnectionState:", connection.iceConnectionState);

            switch (connection.iceConnectionState) {
                case "closed":
                case "failed":
                case "disconnected":
                    // closeConnection();
                    break;
            }
        };
        connection.onicegatheringstatechange = function handleICEGatheringStateChangeEvent(event) {
            console.log("iceGatheringState:", connection.iceGatheringState);
        }
        ;
        connection.onsignalingstatechange = function handleSignalingStateChangeEvent(event) {
            console.log("signalingState:", connection.signalingState);
            switch (connection.signalingState) {
                case "closed":
                    // closeConnection();
                    break;
            }
        };

        connection.onnegotiationneeded = async function handleNegotiationNeededEvent() {
            console.log("onnegotiationneeded:", connection.signalingState);
            try {
                const offer = await connection.createOffer();
                if (connection.signalingState != "stable") {
                    return;
                }
                await connection.setLocalDescription(offer);
                setTimeout(_ => {
                    sendJsonMessage({
                        msg: WSMessageType.RTC_SDP_EXCHANGE,
                        sdp: connection.localDescription,
                        mode
                    } as WSRTCSDPExchangeMessage)
                }, 100);
            } catch (err) {
                console.error(err);
            }
        };
        connection.ontrack = function handleTrackEvent(event) {
            remoteVideo!.current!.srcObject = event.streams[0];
        };

        return connection;
    }

    async function startRTC(mode: 'chat' | 'video') {
        console.log('startRTC Mode: ', mode);
        initPeerConnection(mode);
        await initWebcamStream();
        if (mode === 'video') {
            addTransceiver();
        }
        addDataChannel();
    }

    (global as any).startRTC = startRTC;
    useEffect(() => {
        let message: WSMessage = lastJsonMessage;
        if (!message) return;
        if (message.msg === WSMessageType.KICK) {
            setKickReason(message.reason);
        } else if (message.msg === WSMessageType.USERS) {
            setUsers(message.users);
        } else if (message.msg === WSMessageType.RTC_START) {
            startRTC(message.mode);
        } else if (message.msg === WSMessageType.RTC_SDP_EXCHANGE && message?.sdp?.type === 'offer') {
            (async () => {
                console.log('RTC_SDP_EXCHANGE - offer');
                let mode = message.mode;
                setMode(mode);
                initPeerConnection(mode);
                let desc = new RTCSessionDescription(message.sdp);
                if (peerConnection?.signalingState != "stable") {
                    await Promise.all([
                        peerConnection?.setLocalDescription({type: "rollback"}),
                        peerConnection?.setRemoteDescription(desc)
                    ]);
                    return;
                } else {
                    await peerConnection?.setRemoteDescription(desc);
                }
                if (!webcamStream) {
                    await initWebcamStream();
                    if (mode === 'video') {
                        addTransceiver();
                    }
                    addDataChannel();
                }
                await peerConnection.setLocalDescription(await peerConnection.createAnswer());
                sendJsonMessage({
                    msg: WSMessageType.RTC_SDP_EXCHANGE,
                    sdp: peerConnection?.localDescription,
                    mode
                } as WSRTCSDPExchangeMessage);
            })();
        } else if (message.msg === WSMessageType.RTC_SDP_EXCHANGE && message?.sdp?.type === 'answer') {
            (async () => {
                setMode(mode);
                console.log('RTC_SDP_EXCHANGE - ANSWER');
                const desc = new RTCSessionDescription(message.sdp);
                await peerConnection?.setRemoteDescription(desc).catch(reportError);
            })();
        } else if (message.msg === WSMessageType.RTC_ICE_EXCHANGE) {
            (async () => {
                const candidate = new RTCIceCandidate(message.candidate);
                console.log("RTC_ICE_EXCHANGE: " + JSON.stringify(candidate));
                peerConnection?.addIceCandidate(candidate).catch(reportError);
            })();
        } else {
            console.log(message);
        }
    }, [lastJsonMessage]);

    let context: AppContext = {
        connectionStatus,
        setConnectionStatus,
        mode,
        setMode,
        toggled,
        setToggled,
        user,
        setUser,
        users,
        setUsers,
        chat,
        setChat,
        chats,
        setChats,
        userDB,
        chatsDB,
        messagesDB,
        sendMessage,
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
        getWebSocket
    };

    const [message, setMessage] = React.useState('');
    const scrollChatContainer = (delay: number = 0) => {
        setTimeout(_ => {
            if (chatContainer.current) {
                chatContainer.current.scrollTop = chatContainer.current.scrollHeight
            }
        }, delay);
    };
    const handleSendMessage = async () => {
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
        dataChannel?.send(JSON.stringify({
            msg: 'SendMessage', message: msg
        }));
        scrollChatContainer();
    };

    function updateProgress(type: string, sentBytes: number, totalBytes: number) {
        const progress = sentBytes / totalBytes;
        if (type === 'receive') {
            setDownloadProgress(Math.floor(progress * 100));
            if (progress === 1) {
                setTimeout(_ => {
                    setDownloadProgress(0);
                }, 1000);
            }
        } else {
            setUploadProgress(Math.floor(progress * 100));
            if (progress === 1) {
                setTimeout(_ => {
                    setUploadProgress(0);
                }, 1000);
            }
        }
        console.log(`전송 진행률 (${type}): ${progress * 100}%`);
    }

    const handleFileUpload = async (event: any) => {
        let [file] = event.target.files;
        let type = 'file';
        if (file.type.startsWith('image/')) {
            type = 'image';
        } else if (file.type.startsWith('video/')) {
            type = 'video';
        } else if (file.type.startsWith('audio/')) {
            type = 'audio';
        }

        let msg: Message = {
            user: chat?.user,
            data: {raw: file, time: new Date(), name: file.name, type, isMe: true}
        } as Message;

        const chunkSize = 16384; // 16 KB
        let offset = 0;
        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
            let buffer = e.target!.result as ArrayBuffer;
            fileChannel!.send(buffer);
            offset += buffer.byteLength;
            if (offset === file.size) {
                dataChannel!.send(JSON.stringify({msg: 'FileComplete'}));
                dataChannel!.send(JSON.stringify({msg: 'SendMessage', message: msg}));
                await messagesDB.add(msg);
                setMessages([...messages, msg]);
                chat!.lastMessageTime = new Date(msg.data.time);
                chat!.lastMessage = msg.data.type === 'text' ? msg.data.raw : `[${msg.data.type}] ${msg.data.name}`;
                setChats(chats = [chat!, ...chats.filter(c => c.user.hash !== chat?.user.hash)]);
                await chatsDB.update(chat);


                scrollChatContainer(250);
                scrollChatContainer(500);
                scrollChatContainer(1000);
            }
            updateProgress('send', offset, file.size);
            if (offset < file.size) {
                readSlice(offset);
            }
        };
        const readSlice = (o: number) => {
            const slice = file.slice(offset, o + chunkSize);
            fileReader.readAsArrayBuffer(slice);
        };

        dataChannel!.send(JSON.stringify({msg: 'FileStart', size: file.size, name: file.name, type: file.type}));
        readSlice(0);
    };

    if (user) {
        return (
            <>
                {kickReason ? <KickOverlay reason={kickReason}/> : <></>}
                <Main context={context} modeChangeHandler={() => {
                    let mode;
                    if (context.mode === 'chat') {
                        context.setMode(mode = 'video');
                    } else {
                        context.setMode(mode = 'chat');
                    }
                    dataChannel?.send(JSON.stringify({msg: 'ChangeMode', mode}));
                }}>
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div ref={chatContainer} style={{overflowY: 'auto'}}>
                            <div
                                style={{height: '100%', display: mode == 'chat' ? 'block' : 'none'}}>
                                {messages.filter(m => m.user.hash === chat?.user.hash).map((m, i) => {
                                    const downloadBlob = (blob: Blob, filename: string) => {
                                        const url = URL.createObjectURL(blob);

                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = filename;
                                        document.body.appendChild(a);
                                        a.click();

                                        // URL과 a 태그를 정리합니다.
                                        URL.revokeObjectURL(url);
                                        document.body.removeChild(a);
                                    }

                                    if (m.data.type === 'text') {
                                        return (
                                            <MessageBox
                                                className={m.data.isMe ? 'rce-mbox-custom-right' : 'rce-mbox-custom-left'}
                                                type='text' key={i} id={i} position={m.data.isMe ? 'right' : 'left'}
                                                text={((text: any) => {
                                                    let textSplit = text.split('\n');
                                                    return textSplit.map((line: string, index: number) => (
                                                        <React.Fragment key={index}>
                                                            {line}
                                                            {textSplit.length - 1 === index ? <></> : <br/>}
                                                        </React.Fragment>
                                                    ));
                                                })(m.data.raw)}
                                                title={''}
                                                date={m.data.time}
                                                focus={false}
                                                titleColor={'black'}
                                                forwarded={false} replyButton={false}
                                                removeButton={false} status={'sent'} notch={true}
                                                retracted={false}/>);
                                    } else if (m.data.type === 'image') {
                                        return (
                                            <MessageBox
                                                className={m.data.isMe ? 'rce-mbox-custom-right' : 'rce-mbox-custom-left'}
                                                type='photo' key={i} id={i} position={m.data.isMe ? 'right' : 'left'}
                                                text={''}
                                                data={{
                                                    uri: URL.createObjectURL(m.data.raw),
                                                    name: m.data.name,
                                                    status: {click: false, loading: 0}
                                                }}
                                                onClick={() => {
                                                    downloadBlob(m.data.raw, m.data.name!)
                                                }}
                                                title={m.data.name!}
                                                date={m.data.time}
                                                focus={false}
                                                titleColor={'black'}
                                                forwarded={false} replyButton={false}
                                                removeButton={false} status={'sent'} notch={true}
                                                retracted={false}/>);
                                    } else if (m.data.type === 'video') {
                                        return (
                                            <MessageBox
                                                className={m.data.isMe ? 'rce-mbox-custom-right' : 'rce-mbox-custom-left'}
                                                type='video' key={i} id={i} position={m.data.isMe ? 'right' : 'left'}
                                                text={''}
                                                controlsList={''}
                                                data={{
                                                    videoURL: URL.createObjectURL(m.data.raw),
                                                    name: m.data.name,
                                                    status: {
                                                        click: false, loading: 0.5,
                                                        download: true
                                                    }
                                                }}
                                                title={m.data.name!}
                                                date={m.data.time}
                                                focus={false}
                                                titleColor={'black'}
                                                forwarded={false} replyButton={false}
                                                removeButton={false} status={'sent'} notch={true}
                                                retracted={false}/>);
                                    } else if (m.data.type === 'audio') {
                                        return (
                                            <MessageBox
                                                className={m.data.isMe ? 'rce-mbox-custom-right' : 'rce-mbox-custom-left'}
                                                type='audio' key={i} id={i} position={m.data.isMe ? 'right' : 'left'}
                                                text={''}
                                                data={{
                                                    audioURL: URL.createObjectURL(m.data.raw),
                                                    name: m.data.name,
                                                }}
                                                title={m.data.name!}
                                                date={m.data.time}
                                                focus={false}
                                                titleColor={'black'}
                                                forwarded={false} replyButton={false}
                                                removeButton={false} status={'sent'} notch={true}
                                                retracted={false}/>);
                                    } else if (m.data.type === 'file') {
                                        return (
                                            <MessageBox
                                                className={m.data.isMe ? 'rce-mbox-custom-right' : 'rce-mbox-custom-left'}
                                                type='file' key={i} id={i} position={m.data.isMe ? 'right' : 'left'}
                                                text={m.data.name!}
                                                data={{
                                                    uri: URL.createObjectURL(m.data.raw),
                                                    name: m.data.name,
                                                    status: {
                                                        click: false,
                                                        loading: 0,
                                                    }
                                                }}
                                                onClick={() => {
                                                    downloadBlob(m.data.raw, m.data.name!)
                                                }}
                                                title={''}
                                                date={m.data.time}
                                                focus={false}
                                                titleColor={'black'}
                                                forwarded={false} replyButton={false}
                                                removeButton={false} status={'sent'} notch={true}
                                                retracted={false}/>);
                                    }
                                })}

                            </div>

                            <div style={{height: '100%', display: mode == 'video' ? 'block' : 'none'}}>
                                <video style={{
                                    width: '100%',
                                    height: 'calc(50% - 8px)',
                                    margin: 0,
                                    marginTop: '8px'
                                }} ref={remoteVideo} autoPlay></video>
                                <video style={{
                                    width: '100%',
                                    height: 'calc(50% - 8px)',
                                    margin: 0
                                }} ref={localVideo} autoPlay muted></video>
                            </div>
                        </div>
                        <Paper component="form"
                               sx={{
                                   display: 'flex',
                                   alignItems: 'center',
                                   width: 'calc(100% - 3px - 20px)',
                                   margin: '10px 10px 10px 10px',
                                   border: 'solid 1.5px #1976d2',
                                   borderRadius: '30px'
                               }}>
                            <IconButton style={{
                                background: `linear-gradient(to top, rgba(100, 181, 246, 0.7) ${uploadProgress}%, transparent ${uploadProgress}%),
            linear-gradient(to bottom, rgba(244, 67, 54, 0.7) ${downloadProgress}%, transparent ${downloadProgress}%)`
                            }} disabled={connectionStatus === 'disconnected'} sx={{p: '10px'}}
                                        aria-label="upload picture" component="label">
                                <input hidden accept="*" type="file" onChange={handleFileUpload}/>
                                <AttachFileIcon/>
                            </IconButton>
                            <TextField
                                disabled={connectionStatus === 'disconnected'}
                                multiline
                                maxRows={4} // You can specify the maximum number of rows
                                placeholder="Type a message"
                                variant="standard" // This removes the underline and border from the TextField
                                InputProps={{disableUnderline: true}} // This also helps in removing the underline
                                sx={{ml: 1, flex: 1}}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (message.length === 0) {
                                            return;
                                        }
                                        handleSendMessage();
                                    }
                                }
                                }
                            />
                            <IconButton sx={{p: '10px'}} aria-label="send" disabled={message.length == 0}
                                        onClick={handleSendMessage}>
                                <SendIcon/>
                            </IconButton>
                        </Paper>
                    </div>
                </Main>
            </>
        );
    } else {
        return (<StartPage setUser={setUser}/>);
    }

}
