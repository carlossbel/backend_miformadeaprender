// server.js
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const Token = require('./models/tokenModel');
const app = express();

// Configuración de CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGIN || '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Verificación periódica de tokens expirados (cada 10 minutos)
cron.schedule('*/10 * * * *', async () => {
  try {
    console.log('Verificando tokens expirados...');
    const updatedCount = await Token.updateExpiredTokens();
    console.log(`${updatedCount} token(s) actualizado(s) a estatus 0`);
  } catch (err) {
    console.error('Error al actualizar el estatus de los tokens:', err);
  }
});

// Rutas
app.use('/auth', require('./routes/authRoutes'));

// Ruta de verificación de salud
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'El servidor está funcionando correctamente' });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});