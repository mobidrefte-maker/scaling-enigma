require('dotenv').config();
const { createClient } = require('bedrock-protocol');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = parseInt(process.env.PORT || '19132', 10);
const USERNAME = process.env.USERNAME || 'AFK_68fk';
const RECONNECT_MS = parseInt(process.env.RECONNECT_MS || '5000', 10);
const HEARTBEAT_SEC = parseInt(process.env.HEARTBEAT_SEC || '300', 10);

function heartbeat(client) {
  let tick = 0;
  const say = (msg) =>
    client.queue('text', { type: 'chat', message: msg, needs_translation: false, xuid: '', platform_chat_id: '' });

  const t = setInterval(() => {
    tick++;
    // حرك اتجاه النظر + نبضة تشات كل فترة
    client.queue('move_player', {
      position: client.entity?.position ?? { x: 0, y: 80, z: 0 },
      rotation: { x: 0, y: (tick % 360), z: 0 },
      on_ground: true,
      mode: 0,
      tick: BigInt(Date.now())
    });
    if (tick % HEARTBEAT_SEC === 0) say('⚙️ 68fk bot is alive.');
  }, 1000);

  client.on('close', () => clearInterval(t));
}

function connect() {
  console.log(`[68fk] connecting to ${HOST}:${PORT} as ${USERNAME} ...`);
  const client = createClient({
    host: HOST,
    port: PORT,
    username: USERNAME,
    reliable: true
    // ملاحظة: إذا سيرفرك يطلب Xbox Live auth، لازم إعداد مختلف.
  });

  client.on('join', () => {
    console.log('[68fk] joined server.');
    heartbeat(client);
  });

  client.on('kick', (reason) => {
    console.log('[68fk] kicked:', reason?.toString?.() ?? reason);
  });

  client.on('error', (err) => {
    console.error('[68fk] error:', err?.message || err);
  });

  client.on('close', () => {
    console.log(`[68fk] disconnected. reconnecting in ${RECONNECT_MS}ms ...`);
    setTimeout(connect, RECONNECT_MS);
  });
}

connect();
