const http = require('http');

http.createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
}).listen(10000);

const mqtt = require('mqtt');
const axios = require('axios');

// === YOUR DETAILS ===
const MQTT_HOST = 'mqtt://c32709b4.ala.eu-central-1.emqxsl.com:8883';
const MQTT_USER = 'Test1';
const MQTT_PASS = '4-ci:5qUwDSGUxp';

const SUPABASE_URL = 'https://kmohmaosossxqnbqqxpm.supabase.co/rest/v1/';
const SUPABASE_KEY = 'sb_publishable__xpv-dtlmUmBAJuH0ytmwQ_gTK0SUCV';

// Connect to MQTT
console.log('Starting receiver');
console.log('Connecting to MQTT...');
const client = mqtt.connect(MQTT_HOST, {
  username: MQTT_USER,
  password: MQTT_PASS,
  rejectUnauthorized: false
});

client.on('error', (err) => {
  console.error('MQTT error:', err.message);
});

client.on('message', async (topic, message) => {
  const payload = message.toString();
  console.log(`Received: ${topic} - ${payload}`);

  try {
    await axios.post(
      `${SUPABASE_URL}/rest/v1/messages`,
      {
        topic: topic,
        payload: payload
      },
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Saved to database');
  } catch (err) {
    console.error('Error saving:', err.message);
  }
});
