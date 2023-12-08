import {DefaultWSServer} from "./types/hoodadak-server";
import HTTPServer from "./server/HTTPServer";
import WSServer from "./server/WSServer";
import DefaultWSManager from "./server/impl/manager/DefaultWSManager";
import DefaultWSHandler from "./server/impl/handler/DefaultWSHandler";

!async function () {
    process.on('unhandledRejection', (err: Error, promise) => {
        console.error('Unhandled rejection:', err.stack || err);
    });
    const httpServer: HTTPServer = new HTTPServer({
        wsOptions: {
            perMessageDeflate: {
                zlibDeflateOptions: {
                    // See zlib defaults.
                    chunkSize: 1024,
                    memLevel: 7,
                    level: 3
                },
                zlibInflateOptions: {
                    chunkSize: 10 * 1024
                },
                // Other options settable:
                clientNoContextTakeover: true, // Defaults to negotiated value.
                serverNoContextTakeover: true, // Defaults to negotiated value.
                serverMaxWindowBits: 10, // Defaults to negotiated value.
                // Below options specified as default values.
                concurrencyLimit: 10, // Limits zlib concurrency for perf.
                threshold: 1024 // Size (in bytes) below which messages
                // should not be compressed.
            }
        }
    });
    const wsServer: DefaultWSServer = new WSServer(httpServer.app, '/websocket', new DefaultWSManager());

    wsServer.addHandler(new DefaultWSHandler());
    httpServer.listen(parseInt(process.env.PORT) || 5000);
    wsServer.start();
}();