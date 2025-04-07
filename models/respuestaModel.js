// models/respuestaModel.js
const { firestore } = require('../config/firebase');
const { collection, query, where, getDocs, addDoc, orderBy } = require('firebase/firestore');

class Respuesta {
  // Guarda una nueva respuesta
  static async create(respuestaData) {
    try {
      const respuestasRef = collection(firestore, 'respuestas');
      const dataWithTimestamp = {
        ...respuestaData,
        created_at: new Date()
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
      const q = query(
        respuestasRef, 
        where('id_user', '==', userId),
        orderBy('created_at', 'asc')
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
  // Esta es una versión simplificada, ya que la regresión lineal compleja
  // sería mejor implementada con bibliotecas especializadas
  static async calculatePrediction(userId, points) {
    try {
      // Esta función simula el cálculo de predicción basado en los puntos
      // En un caso real, podrías usar TensorFlow.js u otra biblioteca
      
      const { visual, auditivo, kinestesico } = points;
      const total = visual + auditivo + kinestesico;
      
      // Cálculos simplificados para la demostración
      const visualPred = (visual / total * 100).toFixed(2);
      const auditivoPred = (auditivo / total * 100).toFixed(2);
      const kinestesicoPred = (kinestesico / total * 100).toFixed(2);
      
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
        created_at: new Date()
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
      const q = query(
        resultadosRef, 
        where('id_user', '==', userId),
        orderBy('created_at', 'desc')
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