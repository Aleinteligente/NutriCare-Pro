# NutriCare Pro - Chat Socket Server (Demo)

Pequeño scaffold de servidor para pruebas locales de mensajería usando Socket.IO.

Requisitos:
- Node 18+ (o compatible)

Instalación y ejecución:

```powershell
cd e:\NutriCarePro\socket-server
npm install
npm start
```

El servidor escuchará por defecto en `http://localhost:3000`.

Endpoints disponibles (demo):
- `GET /health` — estado del servicio.
- `GET /conversations/:id/messages` — obtiene mensajes en memoria para la conversación.
- `POST /conversations/:id/messages` — crea un mensaje (y lo broadcast a la sala via Socket.IO).

Socket.IO events:
- Cliente debe conectarse y emitir `join` con `conversationId` para unirse a una sala.
- El servidor emite `history` con el historial actual al unirse.
- Enviar mensaje: emitir `message` con payload `{ conversationId, text, authorId }`. El servidor guardará en memoria y emitirá `message` a la sala.

Autenticación (modo demo)
- El servidor soporta validación básica de JWT con la variable de entorno `JWT_SECRET`. Por defecto el scaffold usa `dev-secret`.
- Para pruebas locales puedes generar un token con el mismo secreto. Ejemplo (Node):

```js
const jwt = require('jsonwebtoken');
const token = jwt.sign({ sub: 'DraMarisol', name: 'Marisol Morales' }, 'dev-secret');
console.log(token);
```

- También puedes deshabilitar la validación estableciendo `NO_AUTH=1` en el entorno (no recomendado fuera de pruebas locales).

Uso desde el cliente
- Socket.IO: el cliente debe enviar el token como `auth` en la conexión: `io(url, { auth: { token: '...' } })`.
- REST POST: incluir cabecera `Authorization: Bearer <TOKEN>`.

Notas:

Notas:
- Este servidor es sólo para demo local. No usar en producción tal cual (no hay persistencia, ni autenticación, ni escalado).
