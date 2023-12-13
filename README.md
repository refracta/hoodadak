# Hoodadak - Fast and lightweight direct messenger
<img src="client/public/logo.svg" width="300">

Hoodadak is a fast and lightweight web messenger utilizing WebRTC. It supports chat and video calling features. Implemented message exchange (including file sharing) and video calling features using WebRTC technology.

![](https://github.com/refracta/hoodadak/assets/58779799/5ff46e93-066a-4517-bf8f-d4d16d9134df)

# Installation & Run
```bash
git clone https://github.com/refracta/hoodadak

# Server
cd server
npm install
npm run start

# Client
cd ../client
npm install
npm run start 
# or npm run build && serve -s build
```

# Setting
```env
REACT_APP_RTC_FILE_BUFFER_SIZE=16384
# WebRTC File Buffer Size
REACT_APP_BACKEND_ENTRYPOINT=0.0.0.0:5000
# Server entrypoint 
REACT_APP_ICE_SERVERS=stun:stun.l.google.com:19302,turn:freeturn.net:3478:free:free
# STUN & TURN server list (protocol:domain:port:username:creditinal)
```