// controllers/authController.js
const bcrypt = require('bcryptjs');
const { auth } = require('../config/firebase');
const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const User = require('../models/userModel');
const LearningPoints = require('../models/learningPointModel');

// Registro de usuarios normales (tipo 1 - tutor/admin)
exports.register = async (req, res) => {
  const { username, password, email } = req.body;

  // Validar campos requeridos
  if (!username || !password || !email) {
    return res.status(400).json({ 
      message: 'Por favor, proporciona un nombre de usuario, una contraseña y un correo electrónico.' 
    });
  }

  // Expresión regular para validar la contraseña
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
      message: 'La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, un número y un carácter especial.' 
    });
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ 
        message: 'El nombre de usuario ya está registrado. Por favor, usa otro.' 
      });
    }

    let uid = 'temp-' + Date.now();
    
    try {
      // Intentar crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      uid = userCredential.user.uid;
    } catch (authError) {
      console.error('Error en el registro con Firebase Auth:', authError);
      // Continuar con el flujo principal incluso si hay un error en Firebase Auth
    }

    // Generar hash de la contraseña para almacenar en Firestore
    const hash = await bcrypt.hash(password, 10);

    // Guardar la información del usuario en Firestore
    const userData = {
      username,
      email,
      password: hash, // Guardamos el hash para poder verificar contraseñas en login
      type: 1, // Tipo 1 = tutor/admin
      uid: uid, // ID de Firebase Authentication o temporal
      created_at: new Date()
    };

    const createdUser = await User.create(userData);

    res.status(201).json({ 
      message: 'Registro exitoso',
      userId: createdUser.id 
    });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Registro de profesores (tipo 2)
exports.registerProfesor = async (req, res) => {
  const { username, password, email } = req.body;

  // Validación de campos
  if (!username || !password || !email) {
    return res.status(400).json({
      message: 'Por favor, proporciona un nombre de usuario, una contraseña y un correo electrónico.',
    });
  }

  // Validación de contraseña
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula, un número y un carácter especial.',
    });
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ 
        message: 'El nombre de usuario ya está registrado. Por favor, usa otro.' 
      });
    }

    let uid = 'temp-' + Date.now();
    
    try {
      // Intentar crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      uid = userCredential.user.uid;
    } catch (authError) {
      console.error('Error en el registro de profesor con Firebase Auth:', authError);
      // Continuar con el flujo principal incluso si hay un error en Firebase Auth
    }

    // Generar hash de la contraseña
    const hash = await bcrypt.hash(password, 10);

    // Guardar la información del profesor
    const userData = {
      username,
      email,
      password: hash,
      type: 2, // Tipo 2 = profesor
      uid: uid,
      created_at: new Date()
    };

    const createdUser = await User.create(userData);

    res.status(201).json({ 
      message: 'Registro exitoso como profesor',
      userId: createdUser.id 
    });
  } catch (error) {
    console.error('Error en el registro de profesor:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Registro de estudiantes (tipo 3)
exports.storeUserData = async (req, res) => {
  const { grupo, username, email } = req.body;

  if (!grupo || !username || !email) {
    return res.status(400).json({
      message: 'Por favor, proporciona el grupo, nombre de usuario y correo electrónico.',
    });
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ 
        message: 'El nombre de usuario ya está registrado. Por favor, usa otro.' 
      });
    }

    // No usamos Authentication para alumnos, solo Firestore
    // Guardar la información del estudiante
    const userData = {
      username,
      email,
      grupo,
      type: 3, // Tipo 3 = estudiante
      created_at: new Date()
    };

    const createdUser = await User.create(userData);

    // Inicializar puntos para el estudiante
    await LearningPoints.initialize(createdUser.id);

    res.status(201).json({ 
      message: 'Usuario y puntos inicializados exitosamente', 
      userId: createdUser.id 
    });
  } catch (error) {
    console.error('Error al guardar los datos del usuario:', error);
    res.status(500).json({ error: 'Error al guardar los datos del usuario y puntos' });
  }
};

// Login
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Buscar usuario por nombre de usuario
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    // Si el usuario tiene uid y no es temporal, validar con Firebase Auth
    if (user.uid && !user.uid.startsWith('temp-')) {
      try {
        // Intentamos iniciar sesión en Firebase Auth
        await signInWithEmailAndPassword(auth, user.email, password);
      } catch (authError) {
        console.error('Error en Firebase Auth:', authError);
        // Continuar con el inicio de sesión local si hay problemas con Firebase Auth
      }
    }

    // Asegurarse de que el tipo sea un número antes de enviarlo
    const userType = typeof user.type === 'string' ? parseInt(user.type, 10) : user.type;

    // Responder con el usuario, incluyendo el id y el type
    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        username: user.username,
        type: userType,
      }
    });
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener todos los profesores
exports.getProfessors = async (req, res) => {
  try {
    const professors = await User.findByType(2); // Tipo 2 = profesor
    
    if (professors.length > 0) {
      // Filtrar para devolver solo id y username
      const filteredProfessors = professors.map(prof => ({
        id: prof.id,
        username: prof.username
      }));
      
      res.status(200).json({ professors: filteredProfessors });
    } else {
      res.status(404).json({ message: 'No se encontraron profesores' });
    }
  } catch (error) {
    console.error('Error al obtener los profesores:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener los profesores' });
  }
};