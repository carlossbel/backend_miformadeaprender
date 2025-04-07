// routes/authRoutes.js
const express = require('express');
const router = express.Router();

// Importar controladores
const authController = require('../controllers/authController');
const tokenController = require('../controllers/tokenController');
const groupController = require('../controllers/groupController');
const learningController = require('../controllers/learningController');

// Rutas de autenticación
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/registro-profesor', authController.registerProfesor);
router.post('/datos', authController.storeUserData);
router.get('/getProfesores', authController.getProfessors);

// Rutas de tokens
router.post('/generate-token', tokenController.generateToken);
router.get('/token-details', tokenController.getTokenDetails);
router.post('/verify', tokenController.verifyAndStoreToken);

// Rutas de grupos
router.post('/asignar', groupController.registerGrupo);
router.get('/buscar/:id', groupController.getUniqueGroups);
router.get('/buscar2', groupController.getUniqueGroups2);
router.get('/buscar/:profesorId/:grupo', groupController.getGroups);
router.get('/profesores-grupo', groupController.getProfessorsGrupo);
router.get('/getUsersByGroup/:grupo', groupController.getUsersByGroup);

// Rutas de aprendizaje
router.post('/puntos', learningController.updatePoints);
router.get('/getpuntos/:id_user', learningController.getResultados);
router.post('/guardarRespuesta', learningController.guardarRespuesta);
router.get('/getRespuestas/:id_user', learningController.getRespuestasByUser);
router.get('/preguntas', learningController.obtenerPreguntas);
router.get('/getResultadosTutor/:id_user', learningController.getResultadosTutor);
router.get('/grafica/:grupo', learningController.grafica);

module.exports = router;