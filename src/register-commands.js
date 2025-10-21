require('dotenv').config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const commands = [
  {
    name: "ping",
    description: "Responde con pong!",
    type: 1 // CHAT_INPUT
  }
];

async function main() {
  const url = guildId
    ? `https://discord.com/api/v10/applications/${clientId}/guilds/${guildId}/commands`
    : `https://discord.com/api/v10/applications/${clientId}/commands`;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bot ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(commands)
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Error registrando comandos:", res.status, text);
    process.exit(1);
  }
  console.log("✅ Comando(s) registrados.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
