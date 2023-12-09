import React, {useEffect, useRef, useState} from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css';
import './styles/App.scss';
import {initDB, useIndexedDB} from "react-indexed-db-hook";
import {DBConfig} from "./db/DBConfig";
import StartPage from "./pages/StartPage";
import Main from "./components/base/Main";
import useWebSocket from "react-use-websocket";
import {
    Chat,
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

function App() {
    const userDB = useIndexedDB('user');
    const chatsDB = useIndexedDB('chats');
    const messagesDB = useIndexedDB('messages');
    const [user, setUser] = useState<User>();
    const [users, setUsers] = useState<User[]>([]);
    const [chat, setChat] = useState<Chat>();
    const [chats, setChats] = useState<Chat[]>([]);
    const [toggled, setToggled] = React.useState<boolean>(false);
    const [kickReason, setKickReason] = useState<string | undefined>(undefined);

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

    const localVideo = useRef<HTMLVideoElement>(null);
    const remoteVideo = useRef<HTMLVideoElement>(null);
    let [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();

    function initPeerConnection() {
        if (!peerConnection) {
            setPeerConnection(peerConnection = createPeerConnection());
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
            console.log(e);
        }
    }

    function createPeerConnection() {
        const connection = new RTCPeerConnection({
            iceServers: [
                {urls: "stun:stun.l.google.com:19302"}
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
                    // closeVideoCall();
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
                    // closeVideoCall();
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
                        sdp: connection.localDescription
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

    useEffect(() => {
        let message: WSMessage = lastJsonMessage;
        if (!message) return;
        if (message.msg === WSMessageType.KICK) {
            setKickReason(message.reason);
        } else if (message.msg === WSMessageType.USERS) {
            setUsers(message.users);
        } else if (message.msg === WSMessageType.RTC_START) {
            (async () => {
                initPeerConnection();
                try {
                    webcamStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
                    setWebcamStream(webcamStream);
                    if (localVideo.current) {
                        localVideo.current.srcObject = webcamStream;
                    }
                } catch (err) {
                    console.error(err);
                    return;
                }

                if (localVideo.current) {
                    localVideo.current.srcObject = webcamStream;
                }
                webcamStream.getTracks().forEach(
                    track => peerConnection?.addTransceiver(track, {streams: [webcamStream as MediaStream]})
                );

                try {
                    const dataChannel = peerConnection!.createDataChannel("chat");
                    const handleDataChannelOpen = (event: any) => {
                        console.log("dataChannel.OnOpen", event);
                        setInterval(_ => {
                            dataChannel.send("Hello World!");
                        }, 1000);
                    };

                    const handleDataChannelMessageReceived = (event: any) => {
                        console.log("dataChannel.OnMessage:", event);
                    };

                    const handleDataChannelError = (error: any) => {
                        console.log("dataChannel.OnError:", error);
                    };

                    const handleDataChannelClose = (event: any) => {
                        console.log("dataChannel.OnClose", event);
                    };

                    dataChannel.onopen = handleDataChannelOpen;
                    dataChannel.onmessage = handleDataChannelMessageReceived;
                    dataChannel.onerror = handleDataChannelError;
                    dataChannel.onclose = handleDataChannelClose;

                    peerConnection!.ondatachannel = (event) => {
                        console.log("on data channel")
                        let receiveChannel = event.channel;
                        receiveChannel.onopen = handleDataChannelOpen;
                        receiveChannel.onmessage = handleDataChannelMessageReceived;
                        receiveChannel.onerror = handleDataChannelError;
                        receiveChannel.onclose = handleDataChannelClose;
                    };

                    (global as any).DC = dataChannel;
                    // global transceiver
                } catch (err) {
                    console.error(err);
                }
            })();
        } else if (message.msg === WSMessageType.RTC_SDP_EXCHANGE && message?.sdp?.type === 'offer') {
            (async () => {
                console.log('[SDP OFFER]');
                createPeerConnection();
                let desc = new RTCSessionDescription(message.sdp);

                // If the connection isn't stable yet, wait for it...
                if (peerConnection?.signalingState != "stable") {
                    console.log("  - But the signaling state isn't stable, so triggering rollback");
                    // Set the local and remove descriptions for rollback; don't proceed
                    // until both return.
                    await Promise.all([
                        peerConnection?.setLocalDescription({type: "rollback"}),
                        peerConnection?.setRemoteDescription(desc)
                    ]);
                    return;
                } else {
                    console.log("  - Setting remote description");
                    await peerConnection?.setRemoteDescription(desc);
                }

                // Get the webcam stream if we don't already have it

                if (!webcamStream) {
                    try {
                        webcamStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
                        setWebcamStream(webcamStream);
                        if (localVideo.current) {
                            localVideo.current.srcObject = webcamStream;
                        }
                    } catch (err) {
                        console.error(err);
                        return;
                    }

                    if (localVideo.current) {
                        localVideo.current.srcObject = webcamStream;
                    }
                    try {
                        webcamStream.getTracks().forEach(
                            track => peerConnection?.addTransceiver(track, {streams: [webcamStream as MediaStream]})
                        );
                        const dataChannel = peerConnection!.createDataChannel("chat");
                        const handleDataChannelOpen = (event: any) => {
                            console.log("dataChannel.OnOpen", event);
                            setInterval(_ => {
                                dataChannel.send("Hello World!");
                            }, 1000);
                        };

                        const handleDataChannelMessageReceived = (event: any) => {
                            console.log("dataChannel.OnMessage:", event);
                        };

                        const handleDataChannelError = (error: any) => {
                            console.log("dataChannel.OnError:", error);
                        };

                        const handleDataChannelClose = (event: any) => {
                            console.log("dataChannel.OnClose", event);
                        };

                        dataChannel.onopen = handleDataChannelOpen;
                        dataChannel.onmessage = handleDataChannelMessageReceived;
                        dataChannel.onerror = handleDataChannelError;
                        dataChannel.onclose = handleDataChannelClose;

                        peerConnection!.ondatachannel = (event) => {
                            console.log("on data channel")
                            let receiveChannel = event.channel;
                            receiveChannel.onopen = handleDataChannelOpen;
                            receiveChannel.onmessage = handleDataChannelMessageReceived;
                            receiveChannel.onerror = handleDataChannelError;
                            receiveChannel.onclose = handleDataChannelClose;
                        };

                        (global as any).DC = dataChannel;
                        // global transceiver
                    } catch (err) {
                        console.error(err);
                    }
                }
                console.log("---> Creating and sending answer to caller");
                await peerConnection.setLocalDescription(await peerConnection.createAnswer());
                sendJsonMessage({
                    msg: WSMessageType.RTC_SDP_EXCHANGE,
                    sdp: peerConnection.localDescription
                } as WSRTCSDPExchangeMessage);
            })();
        } else if (message.msg === WSMessageType.RTC_SDP_EXCHANGE && message?.sdp?.type === 'answer') {
            (async () => {
                console.log('[SDP ANSWER]');
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

    const handleSendMessage = () => {
        console.log(message);
        setMessage('');
    };

    const handleFileUpload = (event: any) => {
        console.log(event.target.files);
    };

    if (user) {
        return (
            <>
                {kickReason ? <KickOverlay reason={kickReason}/> : <></>}
                <Main context={context}>
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{overflowY: 'auto'}}>
                            <MessageBox type={"text"} id={1} position={'right'} text={'hello'} title={'title'}
                                        focus={false}
                                        date={new Date(new Date().getTime() - 60000)} titleColor={'black'}
                                        forwarded={false} replyButton={false}
                                        removeButton={false} status={'sent'} notch={false} retracted={false}/>
                            <video style={{border: 'solid 1px red'}} ref={remoteVideo} autoPlay></video>
                            <video style={{border: 'solid 1px blue'}} ref={localVideo} autoPlay muted></video>
                        </div>
                        <Paper component="form"
                               sx={{
                                   display: 'flex',
                                   alignItems: 'center',
                                   width: 'calc(100% - 3px - 20px)',
                                   margin: '10px 10px 10px 10px',
                                   border: 'solid 1.5px #1976d2',
                                   borderRadius: '20px'
                               }}>
                            <IconButton sx={{p: '10px'}} aria-label="upload picture" component="label">
                                <input hidden accept="image/*" type="file" onChange={handleFileUpload}/>
                                <AttachFileIcon/>
                            </IconButton>
                            <TextField
                                disabled={context.chat === undefined}
                                multiline
                                maxRows={4} // You can specify the maximum number of rows
                                placeholder="Type a message"
                                variant="standard" // This removes the underline and border from the TextField
                                InputProps={{disableUnderline: true}} // This also helps in removing the underline
                                sx={{ml: 1, flex: 1}}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                            />
                            <IconButton sx={{p: '10px'}} aria-label="send" onClick={handleSendMessage}>
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

export default App;
