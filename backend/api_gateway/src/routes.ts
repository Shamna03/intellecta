import { Router, Request, Response } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { SERVICES } from "./config";

const router = Router();

// router.get('/health', (req: Request, res: Response) => {
//     res.status(200).send('API Gateway is running');
// });

const handleProxyError = (serviceName: string) => {
    return (err: Error, req: Request, res: Response) => {
        console.error(`Proxy error for ${serviceName}: ${err.message}`);
        res.status(502).send(`Cannot connect to ${serviceName}: ${err.message}`);
    };
};

const createProxy = (target: string ) => 
    createProxyMiddleware({
        target,
        changeOrigin: true,
        onError: handleProxyError(target),
        logLevel: 'debug' as any  
    } as any); 

router.use("/api/user", createProxy(SERVICES.user));

router.use("/api/ai-tutor", createProxy(SERVICES.aiTutor));

router.use("/api/games", createProxy(SERVICES.game));

router.use("/api/courses", createProxy(SERVICES.content));

export default router;
