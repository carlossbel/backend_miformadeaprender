// models/respuestaModel.js
const { firestore } = require('../config/firebase');
const { collection, query, where, getDocs, addDoc, Timestamp } = require('firebase/firestore');
const regression = require('regression');

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
      
      // Crear consulta
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

  // Calcula resultados usando regresión lineal
  static async calculatePrediction(userId, points) {
    try {
      const { visual, auditivo, kinestesico } = points;
      const total = visual + auditivo + kinestesico;
      
      // Preparamos los datos para la regresión lineal
      // Usamos puntos anteriores para entrenar el modelo
      // En un caso real, deberías tener más puntos de datos
      
      // Datos de entrada: valores normalizados
      const visualRatio = total > 0 ? visual / total : 0;
      const auditivoRatio = total > 0 ? auditivo / total : 0;
      const kinestesicoRatio = total > 0 ? kinestesico / total : 0;
      
      // Implementación de regresión lineal simple
      // Podríamos crear datos de entrenamiento ficticios para tener un modelo más robusto
      const trainingData = [
        [0.1, 10],
        [0.5, 50],
        [0.9, 90]
      ];
      
      // Regresión para visual
      const visualRegression = regression.linear(trainingData);
      const visualPred = Math.max(0, Math.min(100, visualRegression.predict(visualRatio)[1])).toFixed(2);
      
      // Regresión para auditivo
      const auditivoRegression = regression.linear(trainingData);
      const auditivoPred = Math.max(0, Math.min(100, auditivoRegression.predict(auditivoRatio)[1])).toFixed(2);
      
      // Regresión para kinestésico
      const kinestesicoRegression = regression.linear(trainingData);
      const kinestesicoPred = Math.max(0, Math.min(100, kinestesicoRegression.predict(kinestesicoRatio)[1])).toFixed(2);
      
      // Guardar resultados
      const resultadosRef = collection(firestore, 'resultados');
      const resultadoData = {
        id_user: userId,
        visual_predicho: visualPred,
        auditivo_predicho: auditivoPred,
        kinestesico_predicho: kinestesicoPred,
        detalles: JSON.stringify({
          input: {
            visual,
            auditivo,
            kinestesico
          },
          normalized: {
            visual: visualRatio,
            auditivo: auditivoRatio,
            kinestesico: kinestesicoRatio
          },
          predicted: {
            visual: visualPred,
            auditivo: auditivoPred,
            kinestesico: kinestesicoPred
          },
          modelo: 'Regresión Lineal Simple'
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
      
      // Crear consulta
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