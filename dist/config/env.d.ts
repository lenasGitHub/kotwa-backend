export declare const config: {
    nodeEnv: string;
    port: number;
    database: {
        url: string;
    };
    redis: {
        url: string;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    cors: {
        origin: string;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
};
//# sourceMappingURL=env.d.ts.map