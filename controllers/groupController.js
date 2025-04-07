// controllers/groupController.js
const Group = require('../models/groupModel');
const User = require('../models/userModel');
const LearningPoints = require('../models/learningPointModel');

// Asignar un profesor a un grupo
exports.registerGrupo = async (req, res) => {
  const { grupo, profesor } = req.body;

  if (!grupo || !profesor) {
    return res.status(400).json({
      message: 'Por favor, proporciona el grupo y el ID del profesor.',
    });
  }

  try {
    // Verificar si el grupo existe
    let existingGroup = await Group.findByName(grupo);
    
    if (!existingGroup) {
      // Crear el grupo si no existe
      existingGroup = await Group.create({ grupo });
    }
    
    // Verificar si el profesor existe
    const professor = await User.findById(profesor);
    if (!professor) {
      return res.status(404).json({
        message: 'El profesor especificado no existe.',
      });
    }
    
    // Asignar el profesor al grupo
    await Group.assignTeacher(existingGroup.id, profesor);

    res.status(201).json({ 
      message: 'Registro de grupo y profesor exitoso',
      groupId: existingGroup.id
    });
  } catch (error) {
    console.error('Error al asignar profesor al grupo:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener todos los grupos
exports.getUniqueGroups2 = async (req, res) => {
  try {
    const groups = await Group.getAll();
    
    if (groups.length === 0) {
      return res.status(404).json({ error: 'No se encontraron grupos' });
    }
    
    // Formatear la respuesta para mantener compatibilidad con la API anterior
    const formattedGroups = groups.map(group => ({
      grupo: group.grupo
    }));
    
    return res.json({ grupos: formattedGroups });
  } catch (err) {
    console.error('Error al obtener los grupos:', err);
    return res.status(500).json({ error: 'Error al obtener los grupos' });
  }
};

// Obtener grupos de un profesor específico
exports.getUniqueGroups = async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: 'El ID del profesor es requerido' });
  }
  
  try {
    const groups = await Group.getByProfessor(id);
    
    if (groups.length === 0) {
      return res.status(404).json({ error: 'No se encontraron grupos asociados al profesor' });
    }
    
    // Formatear la respuesta para mantener compatibilidad
    const formattedGroups = groups.map(group => ({
      grupo: group.grupo
    }));
    
    return res.json({ grupos: formattedGroups });
  } catch (err) {
    console.error('Error al obtener los grupos del profesor:', err);
    return res.status(500).json({ error: 'Error al obtener los grupos' });
  }
};

// Obtener usuarios de un grupo específico
exports.getUsersByGroup = async (req, res) => {
  const { grupo } = req.params;

  if (!grupo || grupo.trim() === '') {
    return res.status(400).json({ error: 'El parámetro "grupo" no puede estar vacío' });
  }

  try {
    const users = await Group.getGroupUsers(grupo);
    
    if (users.length === 0) {
      return res.status(404).json({ error: `No se encontraron usuarios en el grupo ${grupo}` });
    }
    
    // Formatear la respuesta para mantener compatibilidad
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      grupo: user.grupo
    }));
    
    return res.json({ usuarios: formattedUsers });
  } catch (err) {
    console.error('Error al obtener los usuarios del grupo:', err);
    return res.status(500).json({ error: 'Error al obtener los usuarios del grupo' });
  }
};

// Obtener usuarios y su estilo de aprendizaje de un grupo
exports.getGroups = async (req, res) => {
  const { profesorId, grupo } = req.params;

  if (!profesorId || !grupo) {
    return res.status(400).json({ 
      error: 'Los parámetros "profesorId" y "grupo" son requeridos' 
    });
  }

  try {
    // Verificar que el grupo esté asignado al profesor
    const professorGroups = await Group.getByProfessor(profesorId);
    const groupExists = professorGroups.some(g => g.grupo === grupo);
    
    if (!groupExists) {
      return res.status(403).json({ 
        error: 'El grupo especificado no está asignado a este profesor' 
      });
    }
    
    // Obtener usuarios del grupo
    const users = await Group.getGroupUsers(grupo);
    
    if (users.length === 0) {
      return res.status(404).json({ 
        error: `No se encontraron usuarios en el grupo ${grupo} del profesor` 
      });
    }
    
    // Obtener estilos de aprendizaje para cada usuario
    const usersWithStyles = await Promise.all(users.map(async (user) => {
      const learningPoints = await LearningPoints.findByUserId(user.id);
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        grupo: user.grupo,
        estilo_dominante: learningPoints ? learningPoints.estilo_dominante : null
      };
    }));
    
    return res.json({ usuarios: usersWithStyles });
  } catch (err) {
    console.error('Error al obtener los usuarios del grupo:', err);
    return res.status(500).json({ error: 'Error al obtener los usuarios del grupo' });
  }
};

// Obtener profesores con sus grupos asignados
exports.getProfessorsGrupo = async (req, res) => {
  try {
    // Obtener todos los profesores
    const professors = await User.findByType(2);
    
    if (professors.length === 0) {
      return res.status(404).json({ message: 'No se encontraron profesores' });
    }
    
    // Para cada profesor, obtener sus grupos asignados
    const professorsWithGroups = await Promise.all(professors.map(async (prof) => {
      const groups = await Group.getByProfessor(prof.id);
      const groupNames = groups.map(g => g.grupo);
      
      return {
        profesor_id: prof.id,
        profesor_nombre: prof.username,
        grupos_asignados: groupNames
      };
    }));
    
    res.status(200).json({ professors: professorsWithGroups });
  } catch (error) {
    console.error('Error al obtener los profesores:', error);
    res.status(500).json({ message: 'Error en el servidor al obtener los profesores' });
  }
};