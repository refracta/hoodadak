export const DBConfig = {
    name: "hoodadak",
    version: 1,
    objectStoresMeta: [
        {
            store: "user",
            storeConfig: {keyPath: "id", autoIncrement: false},
            storeSchema: [
                {name: "name", keypath: "name", options: {unique: false}},
                {name: "uuid", keypath: "uuid", options: {unique: false}},
            ],
        }
    ],
};