import {useEffect, useRef, useState} from 'react';
import {AppContext, DataChannelConfigurator} from "../types/hoodadak-client";
import {RTCConnectionMode, WSMessage, WSMessageType} from "../types/hoodadak";
import DCManager from "../network/DCManager";

const defaultMediaConstrains = {
    audio: true,
    video: {
        aspectRatio: {
            ideal: 1.333333
        }
    }
};

export default function useWebRTC(config: {
    fileChannelConfigurator?: DataChannelConfigurator,
    chatChannelConfigurator?: DataChannelConfigurator,
    mediaConstraints?: MediaStreamConstraints,
    mode: RTCConnectionMode
}, {wsManager, lastJsonMessage, setting}: AppContext) {
    const getIceServers = () => {
        let iceServers = process.env.REACT_APP_ICE_SERVERS.split(',').map(s => {
            let serverInfo = s.split(':');
            let [type, host, port, username, credential] = serverInfo;
            let urls = `${type}:${host}${port ? ':' + port : ''}`;
            return {urls, username, credential};
        }).filter(server => server.urls);
        if (!setting?.useTURNServer) {
            iceServers = iceServers.filter(server => !server.urls.toLowerCase().includes('turn'));
        }
        return iceServers;
    }
    let [peerConnection, setPeerConnection] = useState<RTCPeerConnection>();
    let [chatChannel, setChatChannel] = useState<RTCDataChannel>();
    let [fileChannel, setFileChannel] = useState<RTCDataChannel>();
    let [webcamStream, setWebcamStream] = useState<MediaStream>();

    const localVideo = useRef<HTMLVideoElement>(null);
    const remoteVideo = useRef<HTMLVideoElement>(null);

    async function initWebcamStream() {
        try {
            setWebcamStream(webcamStream = await navigator.mediaDevices.getUserMedia(config?.mediaConstraints ? config?.mediaConstraints : defaultMediaConstrains));
            if (localVideo.current) {
                localVideo.current.srcObject = webcamStream;
            }
            (global as any).WCST = webcamStream;
        } catch (err) {
            console.error(err);
            return;
        }
    }

    function addTransceiver() {
        try {
            webcamStream!.getTracks().forEach(
                (track => peerConnection?.addTransceiver(track, {streams: [webcamStream!]}))
            );
        } catch (e) {
            console.error(e);
        }
    }

    function close() {
        if (peerConnection) {
            peerConnection.ontrack = null;
            peerConnection.onicecandidate = null;
            peerConnection.oniceconnectionstatechange = null;
            peerConnection.onsignalingstatechange = null;
            peerConnection.onicegatheringstatechange = null;
            peerConnection.onnegotiationneeded = null;
            peerConnection.getTransceivers().forEach(transceiver => {
                try {
                    transceiver.stop();
                } catch (e) {
                    console.error(e);
                }
            });
            peerConnection.close();
        }
        setPeerConnection(peerConnection = undefined);
        if (localVideo.current?.srcObject) {
            localVideo.current?.pause();
            let tracks = (localVideo.current?.srcObject as any).getTracks();
            tracks.forEach((track: MediaStreamTrack) => {
                track?.stop();
            });
        }
        setWebcamStream(webcamStream = undefined);
    }

    function addDataChannel() {
        try {
            setChatChannel(chatChannel = peerConnection!.createDataChannel("chat")!);
            setFileChannel(fileChannel = peerConnection!.createDataChannel("file")!);

            peerConnection!.ondatachannel = (event) => {
                let receiveChannel = event.channel;
                if (receiveChannel.label === 'chat') {
                    config?.chatChannelConfigurator?.(receiveChannel);
                } else if (receiveChannel.label === 'file') {
                    config?.fileChannelConfigurator?.(receiveChannel);
                }
            };
        } catch (e) {
            console.error(e);
        }
    }

    async function start() {
        initPeerConnection(config.mode);
        if (config.mode === 'video') {
            await initWebcamStream();
            addTransceiver();
        } else {
            addDataChannel();
        }
    }

    useEffect(() => {
        let message: WSMessage = lastJsonMessage;
        if (!message) return;
        if (message.mode !== config.mode) return;
        if (message.msg === WSMessageType.RTC_SDP_EXCHANGE && message?.sdp?.type === 'offer') {
            (async () => {
                console.log('RTC_SDP_EXCHANGE - offer');
                initPeerConnection(config.mode);
                let desc = new RTCSessionDescription(message.sdp);
                if (peerConnection?.signalingState !== "stable") {
                    await Promise.all([
                        peerConnection?.setLocalDescription({type: "rollback"}),
                        peerConnection?.setRemoteDescription(desc)
                    ]);
                    return;
                } else {
                    await peerConnection?.setRemoteDescription(desc);
                }

                if (config.mode === 'video') {
                    if (!webcamStream) {
                        await initWebcamStream();
                        addTransceiver();
                    }
                } else {
                    addDataChannel();
                }
                await peerConnection.setLocalDescription(await peerConnection.createAnswer());
                wsManager.sendRTCSDPExchangeMessage(config.mode, peerConnection?.localDescription!);
            })();
        } else if (message.msg === WSMessageType.RTC_SDP_EXCHANGE && message?.sdp?.type === 'answer') {
            (async () => {
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

    function createPeerConnection(mode: RTCConnectionMode) {
        const connection = new RTCPeerConnection({
            iceServers: getIceServers()
        });

        connection.onicecandidate = function handleICECandidateEvent(event) {
            if (event.candidate) {
                console.log("Candidate:", event.candidate.candidate);
                wsManager.sendRTCICEExchangeMessage(mode, event.candidate);
            }
        }
        connection.oniceconnectionstatechange = function handleICEConnectionStateChangeEvent(event) {
            console.log("iceConnectionState:", connection.iceConnectionState);

            switch (connection.iceConnectionState) {
                case "closed":
                case "failed":
                case "disconnected":
                    // close();
                    break;
            }
        }
        connection.onicegatheringstatechange = function handleICEGatheringStateChangeEvent(event) {
            console.log("iceGatheringState:", connection.iceGatheringState);
        }

        connection.onsignalingstatechange = function handleSignalingStateChangeEvent(event) {
            console.log("signalingState:", connection.signalingState);
            switch (connection.signalingState) {
                case "closed":
                    // close();
                    break;
            }
        }

        connection.onnegotiationneeded = async function handleNegotiationNeededEvent() {
            console.log("onnegotiationneeded:", connection.signalingState);
            try {
                const offer = await connection.createOffer();
                if (connection.signalingState !== "stable") {
                    return;
                }
                await connection.setLocalDescription(offer);
                setTimeout(() => {
                    wsManager.sendRTCSDPExchangeMessage(mode, connection.localDescription!);
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

    function initPeerConnection(mode: RTCConnectionMode) {
        if (!peerConnection) {
            setPeerConnection(peerConnection = createPeerConnection(mode));
        }
    }

    return {
        localVideo,
        remoteVideo,
        close,
        peerConnection,
        start,
        fcManager: new DCManager(fileChannel!),
        ccManager: new DCManager(chatChannel!)
    };
}