import { createApp } from './app.js';
import {openStore} from './store.js';
import {resolve} from 'node:path';
if (process.env.NODE_ENV === 'production') {
  throw new Error('This local starter needs durable storage, user authentication and quotas before public deployment. See README.');
}
const store=openStore(resolve(process.env.DATA_DIR || 'data','pitch.sqlite'));
const server = createApp({store}).listen(Number(process.env.PORT || 4000), '127.0.0.1', () => {
  console.log(`Bedrock: ${process.env.BEDROCK_MODEL_ID || '(not configured)'} in ${process.env.AWS_REGION || 'us-east-1'}`);
  console.log(`Pitch Please local backend: http://127.0.0.1:${process.env.PORT || 4000}`);
});

server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? 'Port is already in use. Stop the old backend with Ctrl+C before starting this one.'
    : error.message);
  store.close();
  process.exitCode = 1;
});

for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>server.close(()=>{store.close();process.exit(0);}));
