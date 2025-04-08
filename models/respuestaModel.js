// models/respuestaModel.js
const { firestore } = require('../config/firebase');
const { collection, query, where, getDocs, addDoc, orderBy, Timestamp } = require('firebase/firestore');

class Respuesta {
  // Guarda una nueva respuesta
  static async create(respuestaData) {
    try {
      const respuestasRef = collection(firestore, 'respuestas');
      const dataWithTimestamp = {
        ...respuestaData,
        created_at: Timestamp.now()
      };
      
      const docRef = await addDoc(respuestasRef, dataWithTimestamp);
      return { id: docRef.id, ...dataWithTimestamp };
    } catch (error) {
      console.error('Error al guardar respuesta:', error);
      throw error;
    }
  }

  // Obtiene todas las respuestas de un usuario
  static async getByUserId(userId) {
    try {
      const respuestasRef = collection(firestore, 'respuestas');
      
      // Crear consulta sin orderBy inicialmente
      const q = query(
        respuestasRef, 
        where('id_user', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener respuestas del usuario:', error);
      throw error;
    }
  }

  // Calcula resultados para predicción de estilo de aprendizaje
  static async calculatePrediction(userId, points) {
    try {
      // Esta función simula el cálculo de predicción basado en los puntos
      
      const { visual, auditivo, kinestesico } = points;
      const total = visual + auditivo + kinestesico;
      
      // Cálculos simplificados para la demostración
      const visualPred = total > 0 ? (visual / total * 100).toFixed(2) : '0.00';
      const auditivoPred = total > 0 ? (auditivo / total * 100).toFixed(2) : '0.00';
      const kinestesicoPred = total > 0 ? (kinestesico / total * 100).toFixed(2) : '0.00';
      
      // Guardar resultados
      const resultadosRef = collection(firestore, 'resultados');
      const resultadoData = {
        id_user: userId,
        visual_predicho: visualPred,
        auditivo_predicho: auditivoPred,
        kinestesico_predicho: kinestesicoPred,
        detalles: JSON.stringify({
          X: [visual, auditivo, kinestesico],
          Y: [visualPred, auditivoPred, kinestesicoPred],
          modelo: 'Cálculo Simplificado'
        }),
        created_at: Timestamp.now()
      };
      
      const docRef = await addDoc(resultadosRef, resultadoData);
      return { id: docRef.id, ...resultadoData };
    } catch (error) {
      console.error('Error al calcular predicción:', error);
      throw error;
    }
  }

  // Obtiene los resultados de predicción de un usuario
  static async getResultadosByUserId(userId) {
    try {
      const resultadosRef = collection(firestore, 'resultados');
      
      // Crear consulta sin orderBy inicialmente
      const q = query(
        resultadosRef, 
        where('id_user', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener resultados del usuario:', error);
      throw error;
    }
  }
}

module.exports = Respuesta;