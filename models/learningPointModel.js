// models/learningPointModel.js
const { firestore } = require('../config/firebase');
const { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, addDoc } = require('firebase/firestore');

class LearningPoints {
  // Inicializa los puntos de aprendizaje para un usuario
  static async initialize(userId) {
    try {
      const pointsRef = collection(firestore, 'learningPoints');
      const initialData = {
        userId,
        visual: 0,
        auditivo: 0,
        kinestesico: 0,
        estilo_dominante: null,
        created_at: new Date()
      };
      
      const docRef = await addDoc(pointsRef, initialData);
      return { id: docRef.id, ...initialData };
    } catch (error) {
      console.error('Error al inicializar puntos de aprendizaje:', error);
      throw error;
    }
  }

  // Encuentra los puntos de aprendizaje por ID de usuario
  static async findByUserId(userId) {
    try {
      const pointsRef = collection(firestore, 'learningPoints');
      const q = query(pointsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      };
    } catch (error) {
      console.error('Error al obtener puntos de aprendizaje:', error);
      throw error;
    }
  }

  // Actualiza los puntos de aprendizaje de un usuario
  static async update(userId, points) {
    try {
      // Primero, buscar si el usuario ya tiene puntos
      const existingPoints = await this.findByUserId(userId);
      
      // Calcular los nuevos valores
      const newVisual = (existingPoints ? existingPoints.visual : 0) + points.visual;
      const newAuditivo = (existingPoints ? existingPoints.auditivo : 0) + points.auditivo;
      const newKinestesico = (existingPoints ? existingPoints.kinestesico : 0) + points.kinestesico;
      
      // Determinar el estilo dominante
      const valores = { visual: newVisual, auditivo: newAuditivo, kinestesico: newKinestesico };
      const maxValor = Math.max(newVisual, newAuditivo, newKinestesico);
      let estiloDominante = '';
      
      for (let [key, value] of Object.entries(valores)) {
        if (value === maxValor) {
          estiloDominante = key;
          break;
        }
      }
      
      const updatedData = {
        visual: newVisual,
        auditivo: newAuditivo,
        kinestesico: newKinestesico,
        estilo_dominante: estiloDominante,
        updated_at: new Date()
      };
      
      if (existingPoints) {
        // Actualizar documento existente
        const pointRef = doc(firestore, 'learningPoints', existingPoints.id);
        await updateDoc(pointRef, updatedData);
        return { id: existingPoints.id, ...updatedData };
      } else {
        // Crear nuevo documento
        return await this.initialize(userId);
      }
    } catch (error) {
      console.error('Error al actualizar puntos de aprendizaje:', error);
      throw error;
    }
  }

  // Calcula los porcentajes de aprendizaje para un usuario
  static async calculatePercentages(userId) {
    try {
      const points = await this.findByUserId(userId);
      
      if (!points) {
        return { visual: 0, auditivo: 0, kinestesico: 0 };
      }
      
      const totalPuntos = points.visual + points.auditivo + points.kinestesico;
      
      if (totalPuntos === 0) {
        return { visual: 0, auditivo: 0, kinestesico: 0 };
      }
      
      return {
        visual: ((points.visual / totalPuntos) * 100).toFixed(2),
        auditivo: ((points.auditivo / totalPuntos) * 100).toFixed(2),
        kinestesico: ((points.kinestesico / totalPuntos) * 100).toFixed(2)
      };
    } catch (error) {
      console.error('Error al calcular porcentajes de aprendizaje:', error);
      throw error;
    }
  }

  // Calcula los porcentajes promedio para un grupo
  static async calculateGroupPercentages(groupName) {
    try {
      // Primero, encontrar todos los usuarios en el grupo
      const usersRef = collection(firestore, 'users');
      const usersQuery = query(usersRef, where('grupo', '==', groupName));
      const usersSnapshot = await getDocs(usersQuery);
      
      if (usersSnapshot.empty) {
        return { visual: 0, auditivo: 0, kinestesico: 0 };
      }
      
      // Recopilar todos los IDs de usuarios
      const userIds = usersSnapshot.docs.map(doc => doc.id);
      
      // Obtener los puntos de aprendizaje para cada usuario
      let totalVisual = 0;
      let totalAuditivo = 0;
      let totalKinestesico = 0;
      let totalPuntos = 0;
      let usersWithPoints = 0;
      
      for (const userId of userIds) {
        const points = await this.findByUserId(userId);
        
        if (points) {
          totalVisual += points.visual;
          totalAuditivo += points.auditivo;
          totalKinestesico += points.kinestesico;
          totalPuntos += (points.visual + points.auditivo + points.kinestesico);
          usersWithPoints++;
        }
      }
      
      if (totalPuntos === 0) {
        return { visual: 0, auditivo: 0, kinestesico: 0 };
      }
      
      return {
        grupo: groupName,
        visual: ((totalVisual / totalPuntos) * 100).toFixed(2),
        auditivo: ((totalAuditivo / totalPuntos) * 100).toFixed(2),
        kinestesico: ((totalKinestesico / totalPuntos) * 100).toFixed(2),
        totalUsuarios: usersWithPoints
      };
    } catch (error) {
      console.error('Error al calcular porcentajes de grupo:', error);
      throw error;
    }
  }
}

module.exports = LearningPoints;