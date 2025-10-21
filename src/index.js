require('dotenv').config();
const express = require('express');
const nacl = require('tweetnacl');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_KEY = process.env.PUBLIC_KEY;

// Discord envía JSON pero necesitamos el **raw body** para verificar firma.
// Usamos un middleware que guarda el raw body antes de parsear.
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));

function isValidSignature(req) {
  const signature = req.get('X-Signature-Ed25519');
  const timestamp = req.get('X-Signature-Timestamp');
  const body = req.rawBody;

  if (!signature || !timestamp || !body) return false;

  const message = Buffer.concat([Buffer.from(timestamp), Buffer.from(body)]);
  try {
    return nacl.sign.detached.verify(
      message,
      Buffer.from(signature, 'hex'),
      Buffer.from(PUBLIC_KEY, 'hex')
    );
  } catch {
    return false;
  }
}

app.post('/interactions', (req, res) => {
  if (!isValidSignature(req)) {
    return res.status(401).send('invalid request signature');
  }

  const interaction = req.body;

  // Tipo 1 = PING
  if (interaction.type === 1) {
    return res.json({ type: 1 }); // PONG
  }

  // Tipo 2 = APPLICATION_COMMAND (slash commands)
  if (interaction.type === 2) {
    const name = interaction.data?.name;
    if (name === 'ping') {
      // type 4 = CHANNEL_MESSAGE_WITH_SOURCE
      return res.json({
        type: 4,
        data: { content: '🏓 pong!' }
      });
    }
    // comando desconocido
    return res.json({
      type: 4,
      data: { content: 'No conozco ese comando 🤷' }
    });
  }

  // Otros tipos no manejados
  return res.status(400).send('bad request');
});

app.get('/', (_req, res) => res.send('OK'));
app.listen(PORT, () => console.log(`HTTP listo en :${PORT}`));
