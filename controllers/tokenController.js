// controllers/tokenController.js
const Token = require('../models/tokenModel');
const Group = require('../models/groupModel');

// Genera un token y lo guarda en la base de datos
exports.generateToken = async (req, res) => {
  const { group } = req.body;
  
  if (!group) {
    return res.status(400).json({ error: 'El grupo es requerido' });
  }

  try {
    // Verificar si ya existe un token activo para el grupo
    const existingToken = await Token.findActiveTokenByGroup(group);

    if (existingToken) {
      return res.json({ 
        message: `Ya existe un token activo para el grupo ${group}.`, 
        token: existingToken.token 
      });
    }

    // Generar nuevo token
    const token = Token.generateRandomToken();
    
    // Guardar token en Firestore
    const tokenData = {
      token,
      grupo: group,
      estatus: 1  // 1 = activo
    };
    
    const savedToken = await Token.create(tokenData);
    
    // Asegurarse de que el grupo exista
    await Group.create({ grupo: group });
    
    res.json({ 
      token: savedToken.token, 
      status: savedToken.estatus, 
      group: savedToken.grupo 
    });
  } catch (err) {
    console.error('Error al generar token:', err);
    res.status(500).json({ error: 'Error al generar token' });
  }
};

// Obtener detalles de los tokens activos
exports.getTokenDetails = async (req, res) => {
  try {
    const tokens = await Token.getAllActiveTokens();
    
    // Formatear la respuesta para mantener compatibilidad
    const formattedTokens = tokens.map(token => ({
      token: token.token,
      created_at: token.created_at.toDate(),
      grupo: token.grupo
    }));
    
    res.json(formattedTokens);
  } catch (err) {
    console.error('Error al obtener los detalles del token:', err);
    res.status(500).json({ error: 'Error al obtener los detalles del token' });
  }
};

// Verificar un token proporcionado
exports.verifyAndStoreToken = async (req, res) => {
  const { token } = req.body;

  // Validar el formato del token
  if (!token || token.length !== 5) {
    return res.status(400).json({ 
      error: 'Código inválido: El token debe tener exactamente 5 caracteres.' 
    });
  }

  try {
    // Verificar el token
    const tokenInfo = await Token.verifyToken(token);
    
    if (!tokenInfo) {
      return res.status(404).json({ error: 'Token no encontrado' });
    }
    
    if (!tokenInfo.isValid) {
      const reason = tokenInfo.reason === 'expired' 
        ? 'El token ha expirado' 
        : 'El token ha expirado por tiempo';
      
      return res.status(400).json({ error: reason });
    }
    
    // Token válido
    return res.json({ 
      message: 'Token verificado con éxito', 
      token: tokenInfo.token, 
      grupo: tokenInfo.grupo 
    });
  } catch (err) {
    console.error('Error al verificar el token:', err);
    return res.status(500).json({ error: 'Error al verificar el token' });
  }
};