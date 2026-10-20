import { Request, Response, NextFunction } from 'express';

export function requestLogger( req: Request, res: Response, next: NextFunction) : void {
    const start = performance.now();
    if (req.originalUrl !== '/api/health') {
    res.on('finish', () => {
        const duration = performance.now() - start;
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration.toFixed(2)} ms`);
    });
    }
    next();
}
