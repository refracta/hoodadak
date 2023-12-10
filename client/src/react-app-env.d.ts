/// <reference types="react-scripts" />

declare namespace NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test';
        readonly REACT_APP_ICE_SERVERS: string;
        readonly REACT_APP_BACKEND_ENTRYPOINT: string;
    }
}