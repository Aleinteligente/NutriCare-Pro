// chat-init.js
// Inicializa el chat usando el adapter `chatClient` (implementación local por defecto).
document.addEventListener('DOMContentLoaded', function() {
    // inicializar chatClient: preferir socketio si está disponible (auto), con fallback local
    if (window.chatClient) {
            const serverUrl = window.CHAT_SERVER_URL || 'http://localhost:3000';
            const token = window.AUTH_TOKEN || null;
            chatClient.init({ transport: 'auto', conversationId: 'default', authorId: 'DraMarisol', serverUrl, token });
        chatClient.connect();

        const messageList = document.getElementById('message-list');
        const input = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-button');

        function appendMessageToDOM(msg){
            if (!messageList) return;
            const wrapper = document.createElement('div');
            wrapper.className = (msg.authorId === 'DraMarisol') ? 'message sent-by-me max-w-xs ml-auto' : 'message received max-w-xs';

            const bubble = document.createElement('p');
            bubble.className = (msg.authorId === 'DraMarisol') ? 'bg-blue-500 text-white p-2 rounded-lg break-words' : 'bg-gray-200 text-gray-800 p-2 rounded-lg break-words';
            bubble.textContent = msg.text;

            const ts = document.createElement('span');
            ts.className = 'timestamp text-xs text-gray-500 block mt-1' + (msg.authorId === 'DraMarisol' ? ' text-right' : '');
            const d = new Date(msg.timestamp);
            ts.textContent = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

            wrapper.appendChild(bubble);
            wrapper.appendChild(ts);
            messageList.appendChild(wrapper);
            messageList.scrollTop = messageList.scrollHeight;
        }

        // recibir mensajes del adapter
        chatClient.on('message', (msg) => {
            appendMessageToDOM(msg);
        });

        // enviar
        sendBtn.addEventListener('click', function(){
            const text = input.value.trim();
            if (!text) return;
            chatClient.sendMessage({ text });
            input.value = '';
            input.style.height = 'auto';
        });

        // Enter para enviar
        input.addEventListener('keydown', function(e){
            if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendBtn.click(); }
        });
    }
});

// EOF
