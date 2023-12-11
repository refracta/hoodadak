export const DBConfig = {
    name: "hoodadak",
    version: 1,
    objectStoresMeta: [
        {
            store: "user",
            storeConfig: {keyPath: "id", autoIncrement: true},
            storeSchema: [
                {name: "name", keypath: "name", options: {unique: false}},
                {name: "uuid", keypath: "uuid", options: {unique: false}},
                {name: "hash", keypath: "hash", options: {unique: false}},
            ],
        },
        {
            store: "setting",
            storeConfig: {keyPath: "id", autoIncrement: true},
            storeSchema: [
                {name: "useTurnServer", keypath: "useTurnServer", options: {unique: false}},
                {name: "useWaitingNotification", keypath: "useWaitingNotification", options: {unique: false}},
            ],
        },
        {
            store: "messages",
            storeConfig: {keyPath: "id", autoIncrement: true},
            storeSchema: [
                {name: "user", keypath: "user", options: {unique: false}},
                {name: "data", keypath: "data", options: {unique: false}}
            ],
        },
        {
            store: "chats",
            storeConfig: {keyPath: "id", autoIncrement: true},
            storeSchema: [
                {name: "user", keypath: "user", options: {unique: false}},
                {name: "lastMessage", keypath: "lastMessage", options: {unique: false}},
                {name: "lastMessageTime", keypath: "lastTime", options: {unique: false}}
            ],
        }
    ],
};