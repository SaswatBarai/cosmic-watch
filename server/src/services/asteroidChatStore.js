// In-memory store for asteroid chat messages (per asteroid). Resets on server restart.
const store = new Map();

function getMessages(asteroidId) {
  if (!store.has(asteroidId)) store.set(asteroidId, []);
  return store.get(asteroidId);
}

function addMessage(asteroidId, { userId, userName, text }) {
  const messages = getMessages(asteroidId);
  const msg = {
    id: `${asteroidId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    userId: userId || null,
    userName: userName || 'Anonymous',
    text: (text || '').trim().slice(0, 2000),
    createdAt: new Date().toISOString(),
  };
  messages.push(msg);
  return msg;
}

export { getMessages, addMessage };
