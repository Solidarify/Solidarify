const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors()); 
app.use(express.json({ limit: '100mb' })); // Límite alto para fotos Base64
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/propuestas', require('./routes/propuestaRoutes'));
app.use('/api/organizadores', require('./routes/organizadorRoutes'));
app.use('/api/ongs', require('./routes/ongRoutes'));

app.get('/', (req, res) => {
  res.send('API Solidarify Funcionando 🚀');
});

sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a Base de Datos exitosa.');
    
    // force: false para NO borrar datos.
    // alter: true actualiza tablas si cambias modelos
    return sequelize.sync({ force: false, alter: false });
  })
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`📡 Servidor escuchando en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error de conexión:', err);
  });
