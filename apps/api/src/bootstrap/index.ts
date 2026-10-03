import { bootstrap, logFatal } from './server.ts';

export * from './app.ts';
export * from './server.ts';

// Auto-bootstrap when executed as entry point
if (process.env.NODE_ENV !== 'test') {
  bootstrap().catch((err) => {
    console.error('Fatal bootstrap error:', err);
    logFatal(err, 'bootstrap');
    process.exit(1);
  });
}
