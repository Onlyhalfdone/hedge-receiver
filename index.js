const http = require('http');
const mqtt = require('mqtt');
const axios = require('axios');

// --- Tiny web server (needed for Render free tier) ---
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('OK');
}).listen(10000);

// --- Environment variables ---
const MQTT_HOST = process.env.MQTT_HOST;
const MQTT_USER = process.env.MQTT_USER;
const MQTT_PASS = process.env.MQTT_PASS;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const TOPIC = 'hedge/test';

// --- Startup logs ---
console.log('Starting receiver');
console.log('Connecting to MQTT...');

// --- MQTT connection ---
const client = mqtt.connect(MQTT_HOST, {
  username: MQTT_USER,
  password: MQTT_PASS,
  reconnectPeriod: 5000
});

// --- MQTT events ---
client.on('connect', () => {
  console.log('Connected to MQTT');
  console.log('Supabase URL:', SUPABASE_URL);

  client.subscribe(TOPIC, (err) => {
    if (err) {
      console.error('Subscribe error:', err);
    } else {
      console.log(`Subscribed to ${TOPIC}`);
    }
  });
});

client.on('error', (err) => {
  console.error('MQTT error:', err);
});

client.on('message', async (topic, message) => {
  console.log(`Message received on ${topic}: ${message.toString()}`);

  try {
    const payload = message.toString();

    const response = await axios.post(
      `${SUPABASE_URL}/rest/v1/messages`,
      {
        topic: topic,
        payload: payload
      },
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Saved to Supabase:', response.status);
  } catch (err) {
    console.error('Supabase error:', err.response?.data || err.message);
  }
});
