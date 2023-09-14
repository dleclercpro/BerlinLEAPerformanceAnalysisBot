import pino from 'pino';
import pretty from 'pino-pretty';
import { DEFAULT_LOG_LEVEL, ENV, LOGS_PATH } from './config';
import { Environment } from './types';

const DEV_TRANSPORT = {
    target: 'pino-pretty',
};

const PROD_TRANSPORT = pino.transport({
    targets: [
        {
            level: 'info',
            target: 'pino/file',
            options: { destination: LOGS_PATH },
        },
        {
            level: 'debug',
            target: 'pino-pretty',
            options: { },
        },
    ],
});

const getLogger = (env: Environment) => {
    switch (env) {
        case Environment.Test:
            return pino(pretty({ sync: true }));
        case Environment.Production:
            return pino({
                level: DEFAULT_LOG_LEVEL,
            }, PROD_TRANSPORT);
        case Environment.Development:
            return pino({
                level: DEFAULT_LOG_LEVEL,
                transport: DEV_TRANSPORT,
            });
    }
}

export default getLogger(ENV);