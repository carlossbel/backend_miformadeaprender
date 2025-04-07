// models/userModel.js
const { firestore } = require('../config/firebase');
const { collection, query, where, getDocs, getDoc, doc, setDoc, addDoc, updateDoc } = require('firebase/firestore');

class User {
  // Encuentra un usuario por su nombre de usuario
  static async findByUsername(username) {
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      // Devuelve el primer documento coincidente
      const userData = querySnapshot.docs[0].data();
      return { 
        id: querySnapshot.docs[0].id, 
        ...userData 
      };
    } catch (error) {
      console.error('Error al buscar usuario por nombre de usuario:', error);
      throw error;
    }
  }

  // Encuentra un usuario por su ID
  static async findById(userId) {
    try {
      const userRef = doc(firestore, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return null;
      }
      
      return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      throw error;
    }
  }

  // Crea un nuevo usuario
  static async create(userData) {
    try {
      const usersRef = collection(firestore, 'users');
      const docRef = await addDoc(usersRef, userData);
      return { id: docRef.id, ...userData };
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  // Actualiza un usuario existente
  static async update(userId, userData) {
    try {
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, userData);
      return { id: userId, ...userData };
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  // Obtiene todos los usuarios de un tipo específico
  static async findByType(type) {
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('type', '==', type));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error al obtener usuarios de tipo ${type}:`, error);
      throw error;
    }
  }

  // Obtiene todos los usuarios de un grupo específico
  static async findByGroup(grupo) {
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('grupo', '==', grupo));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error al obtener usuarios del grupo ${grupo}:`, error);
      throw error;
    }
  }
}

module.exports = User;