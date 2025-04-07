// models/preguntaModel.js
const { firestore } = require('../config/firebase');
const { collection, getDocs, addDoc, doc, getDoc, query, where } = require('firebase/firestore');

class Pregunta {
  // Obtiene todas las preguntas
  static async getAll() {
    try {
      const preguntasRef = collection(firestore, 'preguntas');
      const querySnapshot = await getDocs(preguntasRef);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener preguntas:', error);
      throw error;
    }
  }

  // Obtiene una pregunta por su ID
  static async getById(preguntaId) {
    try {
      const preguntaRef = doc(firestore, 'preguntas', preguntaId);
      const preguntaDoc = await getDoc(preguntaRef);
      
      if (!preguntaDoc.exists()) {
        return null;
      }
      
      return { id: preguntaDoc.id, ...preguntaDoc.data() };
    } catch (error) {
      console.error('Error al obtener pregunta por ID:', error);
      throw error;
    }
  }
  
  // Obtiene una pregunta por su pregunta_id (campo personalizado)
  static async getByPreguntaId(preguntaId) {
    try {
      const preguntasRef = collection(firestore, 'preguntas');
      const q = query(preguntasRef, where('pregunta_id', '==', preguntaId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      };
    } catch (error) {
      console.error('Error al obtener pregunta por pregunta_id:', error);
      throw error;
    }
  }

  // Crea una nueva pregunta
  static async create(preguntaData) {
    try {
      // Verificar si la pregunta ya existe por pregunta_id
      if (preguntaData.pregunta_id) {
        const existingQuestion = await this.getByPreguntaId(preguntaData.pregunta_id);
        if (existingQuestion) {
          console.log(`La pregunta con ID ${preguntaData.pregunta_id} ya existe.`);
          return existingQuestion;
        }
      }
      
      const preguntasRef = collection(firestore, 'preguntas');
      const docRef = await addDoc(preguntasRef, {
        ...preguntaData,
        created_at: new Date()
      });
      
      return { id: docRef.id, ...preguntaData };
    } catch (error) {
      console.error('Error al crear pregunta:', error);
      throw error;
    }
  }

  // Obtiene preguntas por estilo de aprendizaje
  static async getByEstilo(estilo) {
    try {
      const preguntasRef = collection(firestore, 'preguntas');
      const q = query(preguntasRef, where('estilo', '==', estilo));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error al obtener preguntas de estilo ${estilo}:`, error);
      throw error;
    }
  }
}

module.exports = Pregunta;