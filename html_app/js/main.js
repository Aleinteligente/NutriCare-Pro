// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener los elementos de la interfaz por su ID
    const sendButton = document.getElementById('send-button');
    const messageInput = document.getElementById('message-input');
    const messageList = document.getElementById('message-list');

    // 2. Definir la función para enviar y mostrar el mensaje
    function sendMessage() {
        // .trim() elimina espacios en blanco al inicio y al final
        const messageText = messageInput.value.trim();

        // Solo si el mensaje tiene contenido
        if (messageText !== '') {
            
            // Crear el nuevo elemento de mensaje (div contenedor)
            const newMessageContainer = document.createElement('div');
            // Clase para identificarlo y darle estilo (asumimos que es enviado por este usuario)
            newMessageContainer.classList.add('message', 'sent-by-me', 'max-w-xs', 'ml-auto');
            
            // Usamos la misma estructura de diseño que en el HTML
            const currentTime = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

            newMessageContainer.innerHTML = `
                <p class="bg-blue-500 text-white p-2 rounded-lg break-words">${messageText}</p>
                <span class="timestamp text-xs text-gray-500 block text-right mt-1">${currentTime}</span>
            `;
            
            // 3. Añadir el mensaje a la lista (al final)
            messageList.appendChild(newMessageContainer);

            // Limpiar el área de texto
            messageInput.value = '';
            
            // Ajustar la altura del textarea a la mínima después de enviar
            messageInput.style.height = 'auto';
            
            // 4. Hacer scroll automático al mensaje más reciente
            messageList.scrollTop = messageList.scrollHeight;
        }
    }

    // 5. Conectar la función de envío al botón de clic
    sendButton.addEventListener('click', sendMessage);
    
    // 6. Conectar la función de envío a la tecla Enter (sin Shift+Enter)
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Evita el salto de línea por defecto
            sendMessage();
        }
    });
    
    // 7. Auto-ajustar la altura del textarea al escribir
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto'; // Resetear altura
        // Ajustar altura al contenido, limitando a un máximo si lo deseas
        messageInput.style.height = messageInput.scrollHeight + 'px';
    });
});