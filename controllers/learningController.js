// controllers/learningController.js
const LearningPoints = require('../models/learningPointModel');
const Respuesta = require('../models/respuestaModel');
const Pregunta = require('../models/preguntaModel');

// Actualizar puntos de aprendizaje
exports.updatePoints = async (req, res) => {
  const { id_user, visual, auditivo, kinestesico } = req.body;

  if (!id_user) {
    return res.status(400).json({ error: 'El ID del usuario es requerido' });
  }

  // Verificar que los puntos sean números válidos
  if (isNaN(visual) || isNaN(auditivo) || isNaN(kinestesico)) {
    return res.status(400).json({ error: 'Los puntos deben ser números válidos' });
  }

  try {
    const updatedPoints = await LearningPoints.update(id_user, {
      visual: Number(visual),
      auditivo: Number(auditivo),
      kinestesico: Number(kinestesico)
    });
    
    res.json({ 
      message: 'Puntos y estilo dominante actualizados exitosamente',
      estilo_dominante: updatedPoints.estilo_dominante
    });
  } catch (err) {
    console.error('Error al actualizar los puntos:', err);
    res.status(500).json({ error: 'Error al actualizar los puntos' });
  }
};

// Obtener porcentajes de aprendizaje de un usuario
exports.getResultados = async (req, res) => {
  const { id_user } = req.params;

  if (!id_user) {
    return res.status(400).json({ error: 'El ID del usuario es requerido' });
  }

  try {
    const percentages = await LearningPoints.calculatePercentages(id_user);
    res.json(percentages);
  } catch (err) {
    console.error('Error al obtener los resultados:', err);
    res.status(500).json({ error: 'Error al obtener los resultados' });
  }
};

// Guardar una respuesta y actualizar puntos
exports.guardarRespuesta = async (req, res) => {
  const { 
    id_user, pregunta_id, respuesta, estilo, respuestaValor, 
    visualPoints, auditivoPoints, kinestesicoPoints 
  } = req.body;

  if (!id_user || !pregunta_id) {
    return res.status(400).json({ error: 'El ID del usuario y de la pregunta son requeridos' });
  }

  try {
    // Guardar la respuesta
    const respuestaData = {
      id_user,
      pregunta_id,
      respuesta,
      estilo,
      respuestaValor
    };
    
    await Respuesta.create(respuestaData);
    
    // Actualizar los puntos
    await LearningPoints.update(id_user, {
      visual: Number(visualPoints),
      auditivo: Number(auditivoPoints),
      kinestesico: Number(kinestesicoPoints)
    });
    
    // Calcular predicción
    const prediction = await Respuesta.calculatePrediction(id_user, {
      visual: Number(visualPoints),
      auditivo: Number(auditivoPoints),
      kinestesico: Number(kinestesicoPoints)
    });
    
    res.json({ 
      message: 'Respuesta guardada y regresión calculada', 
      prediction 
    });
  } catch (err) {
    console.error('Error al guardar la respuesta:', err);
    res.status(500).json({ error: 'Error al guardar la respuesta' });
  }
};

// Obtener las respuestas de un usuario
exports.getRespuestasByUser = async (req, res) => {
  const { id_user } = req.params;

  if (!id_user) {
    return res.status(400).json({ error: 'El ID del usuario es requerido' });
  }

  try {
    const respuestas = await Respuesta.getByUserId(id_user);
    
    if (respuestas.length === 0) {
      return res.status(404).json({ error: 'No se encontraron respuestas para este usuario' });
    }
    
    res.json(respuestas);
  } catch (err) {
    console.error('Error al obtener las respuestas:', err);
    res.status(500).json({ error: 'Error al obtener las respuestas' });
  }
};

// Obtener las preguntas
exports.obtenerPreguntas = async (req, res) => {
  try {
    // Intentar obtener las preguntas
    let preguntas = await Pregunta.getAll();
    
    // Si no hay preguntas, inicializar las predeterminadas
    if (preguntas.length === 0) {
      preguntas = await Pregunta.initializeDefaultQuestions();
    }
    
    res.status(200).json(preguntas);
  } catch (error) {
    console.error('Error al obtener las preguntas:', error);
    res.status(500).json({ message: 'Error al obtener las preguntas' });
  }
};

// Obtener resultados de predicción de un usuario
exports.getResultadosTutor = async (req, res) => {
  const { id_user } = req.params;

  if (!id_user) {
    return res.status(400).json({ error: 'El ID del usuario es requerido' });
  }

  try {
    const resultados = await Respuesta.getResultadosByUserId(id_user);
    
    if (resultados.length === 0) {
      return res.status(404).json({ error: 'No se encontraron resultados para este usuario' });
    }
    
    res.json(resultados);
  } catch (err) {
    console.error('Error al obtener los resultados:', err);
    res.status(500).json({ error: 'Error al obtener los resultados' });
  }
};

// Obtener estadísticas de un grupo
exports.grafica = async (req, res) => {
  const { grupo } = req.params;

  if (!grupo) {
    return res.status(400).json({ error: 'El grupo es requerido' });
  }

  try {
    const stats = await LearningPoints.calculateGroupPercentages(grupo);
    res.json(stats);
  } catch (err) {
    console.error('Error al obtener los resultados del grupo:', err);
    res.status(500).json({ error: 'Error al obtener los resultados del grupo' });
  }
};