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
    const localVideo = useRef<HTMLVideoElement>(null);
    const remoteVideo = useRef<HTMLVideoElement>(null);
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();
    const [transceiver, setTransceiver] = useState<(track: MediaStreamTrack) => void>();
    const [webcamStream, setWebcamStream] = useState<MediaStream>();
    const [inited, setInited] = React.useState<boolean>(false);

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

    function createPeerConnection() {
        if (peerConnection) {
            console.log('already return');
            return peerConnection;
        }
        let connection = new RTCPeerConnection({
            iceServers: [
                {urls: "stun:stun.l.google.com:19302"}
            ]
        });

        connection.onicecandidate = (event) => {
            if (event.candidate) {
                let candidate = event.candidate;
                console.log("*** Outgoing ICE candidate: " + candidate);

                sendJsonMessage({
                    msg: WSMessageType.RTC_ICE_EXCHANGE,
                    candidate: candidate
                } as WSRTCICEExchangeMessage)
            }
        };
        connection.oniceconnectionstatechange = (event) => {
            console.log("*** ICE connection state changed to " + connection.iceConnectionState);

            switch (connection.iceConnectionState) {
                case "closed":
                case "failed":
                case "disconnected":
                    // closeVideoCall();
                    break;
            }
        };
        connection.onicegatheringstatechange = (event) => {
            console.log("*** ICE gathering state changed to: " + connection.iceGatheringState);
        };
        connection.onsignalingstatechange = (event) => {
            console.log("*** WebRTC signaling state changed to: " + connection.signalingState);
            switch (connection.signalingState) {
                case "closed":
                    // closeVideoCall();
                    break;
            }
        };
        connection.onnegotiationneeded = async () => {
            console.log("*** Negotiation needed");

            try {
                console.log("---> Creating offer");
                const offer = await connection.createOffer();

                // If the connection hasn't yet achieved the "stable" state,
                // return to the caller. Another negotiationneeded event
                // will be fired when the state stabilizes.

                if (connection.signalingState != "stable") {
                    console.log("     -- The connection isn't stable yet; postponing...")
                    return;
                }

                // Establish the offer as the local peer's current
                // description.

                console.log("---> Setting local description to the offer");
                await connection.setLocalDescription(offer);

                // Send the offer to the remote peer.

                console.log("---> Sending the offer to the remote peer2");
                console.log('로깔', connection.localDescription);
                sendJsonMessage({
                    msg: WSMessageType.RTC_SDP_EXCHANGE,
                    sdp: connection.localDescription
                } as WSRTCSDPExchangeMessage);
            } catch (err) {
                console.log("*** The following error occurred while handling the negotiationneeded event:");
                reportError(err);
            }
        };
        connection.ontrack = (event) => {
            console.log("*** Track event", event.streams);
            // document.getElementById("received_video").srcObject = event.streams[0];
            if (remoteVideo.current) {
                console.log(remoteVideo);
                remoteVideo.current.srcObject = event.streams[0];
            }
            // document.getElementById("hangup-button").disabled = false;
        };
        setPeerConnection(connection);
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
                console.log('rtc_start')

                let connection = createPeerConnection();
                let webcamStream = await navigator.mediaDevices.getUserMedia({
                    audio: true,            // We want an audio track
                    video: {
                        aspectRatio: {
                            ideal: 1.333333     // 3:2 aspect is preferred
                        }
                    }
                });
                setWebcamStream(webcamStream);
                if (localVideo.current) {
                    localVideo.current.srcObject = webcamStream;
                }
                let trcv = (track: MediaStreamTrack) => {
                    connection.addTransceiver(track, {streams: [webcamStream]})
                };
                // setTransceiver(trcv);
                webcamStream.getTracks().forEach(trcv);
                setInited(true);
            })();
        } else if (message.msg === WSMessageType.RTC_SDP_EXCHANGE && message?.sdp?.type === 'offer') {
            (async () => {
                if (inited) {
                    return;
                }
                let connection = createPeerConnection();
                var desc = new RTCSessionDescription(message.sdp);
                if (connection.signalingState != "stable") {
                    console.log("  - But the signaling state isn't stable, so triggering rollback");
                    await Promise.all([
                        connection.setLocalDescription({type: "rollback"}),
                        connection.setRemoteDescription(desc)
                    ]);
                    return;
                } else {
                    console.log("  - Setting remote description");
                    await connection.setRemoteDescription(desc);
                }

                let webcamStream = await navigator.mediaDevices.getUserMedia({
                    audio: true,            // We want an audio track
                    video: {
                        aspectRatio: {
                            ideal: 1.333333     // 3:2 aspect is preferred
                        }
                    }
                });
                setWebcamStream(webcamStream);
                if (localVideo.current) {
                    localVideo.current.srcObject = webcamStream;
                }
                let trcv = (track: MediaStreamTrack) => {
                    connection.addTransceiver(track, {streams: [webcamStream]})
                };
                // setTransceiver(trcv);
                webcamStream.getTracks().forEach(trcv);

                await connection.setLocalDescription(await connection.createAnswer());
                sendJsonMessage({
                    msg: WSMessageType.RTC_SDP_EXCHANGE,
                    sdp: connection.localDescription
                } as WSRTCSDPExchangeMessage);
            })();
        } else if (message.msg === WSMessageType.RTC_SDP_EXCHANGE && message?.sdp?.type === 'answer') {
            console.log('[ANSWER]');
            (async () => {
                console.log(message.sdp);
                var desc = new RTCSessionDescription(message.sdp);
                console.log('okay', desc, peerConnection, peerConnection?.setRemoteDescription);
                await peerConnection?.setRemoteDescription(desc);
            })();
        } else if (message.msg === WSMessageType.RTC_ICE_EXCHANGE) {
            (async () => {
                var candidate = new RTCIceCandidate(message.candidate);
                console.log("*** Adding received ICE candidate: " + JSON.stringify(candidate));
                try {
                    await peerConnection?.addIceCandidate(candidate)
                } catch (err) {
                    reportError(err);
                }
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
