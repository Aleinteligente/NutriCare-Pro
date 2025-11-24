// chat-client.js
// Adapter de mensajería cliente-agnóstico.
// Soporta transporte "local" (localStorage + BroadcastChannel) y placeholders para WebSocket.
(function(global){
  const DEFAULT_CONV = 'default';

  function nowIso(){ return new Date().toISOString(); }

  function makeId(){ return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8); }

  function createLocalTransport(conversationId){
    const storageKey = 'chat_messages_' + conversationId;
    const channelName = 'chat_channel_' + conversationId;
    let bc = null;
    const listeners = [];

    function loadAll(){
      try{
        const raw = localStorage.getItem(storageKey);
        if (!raw) return [];
        return JSON.parse(raw);
      }catch(e){ return []; }
    }

    function saveAll(arr){
      try{ localStorage.setItem(storageKey, JSON.stringify(arr)); }catch(e){ console.error('localStorage error', e); }
    }

    function connect(){
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel(channelName);
        bc.onmessage = (ev) => {
          if (ev && ev.data && ev.data.type === 'message') {
            listeners.forEach(cb => cb(ev.data.payload));
          }
        };
      }
      // emitir historial
      const all = loadAll();
      all.forEach(m => listeners.forEach(cb => cb(m)));
    }

    function disconnect(){ if (bc) { bc.close(); bc = null; } }

    function send(msg){
      const all = loadAll();
      all.push(msg);
      saveAll(all);
      // emitir por BroadcastChannel para otras pestañas
      if (bc) bc.postMessage({ type: 'message', payload: msg });
      // notificar listeners en la misma pestaña (sin delay)
      listeners.forEach(cb => cb(msg));
    }

    function onMessage(cb){ listeners.push(cb); }

    return { connect, disconnect, send, onMessage };
  }

  // chatClient principal
  const chatClient = (function(){
    let transport = null;
    let config = { transport: 'local', conversationId: DEFAULT_CONV, authorId: 'anonymous' };
    const events = { message: [] };

    function emit(ev, payload){ if (events[ev]) events[ev].forEach(cb => cb(payload)); }

    function init(options = {}){
      config = Object.assign({}, config, options);
      // create transport
      if (config.transport === 'local'){
        transport = createLocalTransport(config.conversationId);
        transport.onMessage((msg) => emit('message', msg));
      } else if (config.transport === 'ws'){
        // placeholder: user will plug WS implementation later
        console.warn('WS transport selected but not implemented in this adapter (placeholder)');
      }
    }

    function connect(){ if (transport && transport.connect) transport.connect(); }
    function disconnect(){ if (transport && transport.disconnect) transport.disconnect(); }

    function sendMessage({ text, conversationId }){
      const convId = conversationId || config.conversationId;
      const msg = {
        id: makeId(),
        conversationId: convId,
        authorId: config.authorId,
        text: text,
        timestamp: nowIso(),
        status: 'sent'
      };
      if (transport && transport.send) transport.send(msg);
      // emit local for immediate UI update
      emit('message', msg);
      return msg;
    }

    function on(event, cb){ if (!events[event]) events[event] = []; events[event].push(cb); }

    return { init, connect, disconnect, sendMessage, on };
  })();

  // export
  global.chatClient = chatClient;
})(window);

// EOF
