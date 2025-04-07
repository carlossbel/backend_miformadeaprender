// models/groupModel.js
const { firestore } = require('../config/firebase');
const { collection, query, where, getDocs, addDoc, getDoc, doc, updateDoc } = require('firebase/firestore');
const User = require('./userModel');

class Group {
  // Crea un nuevo grupo
  static async create(groupData) {
    try {
      const groupsRef = collection(firestore, 'groups');
      
      // Verificar si el grupo ya existe
      const existingGroup = await this.findByName(groupData.grupo);
      
      if (existingGroup) {
        return existingGroup;
      }
      
      // Crear nuevo grupo
      const docRef = await addDoc(groupsRef, {
        ...groupData,
        created_at: new Date()
      });
      
      return { id: docRef.id, ...groupData };
    } catch (error) {
      console.error('Error al crear grupo:', error);
      throw error;
    }
  }

  // Encuentra un grupo por su nombre
  static async findByName(groupName) {
    try {
      const groupsRef = collection(firestore, 'groups');
      const q = query(groupsRef, where('grupo', '==', groupName));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      };
    } catch (error) {
      console.error('Error al buscar grupo por nombre:', error);
      throw error;
    }
  }

  // Asigna un profesor a un grupo
  static async assignTeacher(groupId, professorId) {
    try {
      const groupRef = doc(firestore, 'groups', groupId);
      await updateDoc(groupRef, { profesor: professorId });
      
      const updatedDoc = await getDoc(groupRef);
      return { 
        id: updatedDoc.id, 
        ...updatedDoc.data() 
      };
    } catch (error) {
      console.error('Error al asignar profesor al grupo:', error);
      throw error;
    }
  }

  // Obtiene todos los grupos
  static async getAll() {
    try {
      const groupsRef = collection(firestore, 'groups');
      const querySnapshot = await getDocs(groupsRef);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener todos los grupos:', error);
      throw error;
    }
  }

  // Obtiene todos los grupos asignados a un profesor
  static async getByProfessor(professorId) {
    try {
      const groupsRef = collection(firestore, 'groups');
      const q = query(groupsRef, where('profesor', '==', professorId));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener grupos por profesor:', error);
      throw error;
    }
  }

  // Obtiene los usuarios de un grupo específico
  static async getGroupUsers(groupName) {
    try {
      const users = await User.findByGroup(groupName);
      return users;
    } catch (error) {
      console.error('Error al obtener usuarios del grupo:', error);
      throw error;
    }
  }
}

module.exports = Group;