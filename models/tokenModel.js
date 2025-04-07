// models/tokenModel.js
const { firestore } = require('../config/firebase');
const { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp } = require('firebase/firestore');

class Token {
  // Genera un token aleatorio de 5 caracteres
  static generateRandomToken() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 5; i++) {
      token += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return token;
  }

  // Busca un token activo para un grupo específico
  static async findActiveTokenByGroup(grupo) {
    try {
      const tokensRef = collection(firestore, 'tokens');
      const q = query(
        tokensRef, 
        where('grupo', '==', grupo),
        where('estatus', '==', 1)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const tokenData = querySnapshot.docs[0].data();
      return { 
        id: querySnapshot.docs[0].id, 
        ...tokenData 
      };
    } catch (error) {
      console.error('Error al buscar token activo por grupo:', error);
      throw error;
    }
  }

  // Crea un nuevo token
  static async create(tokenData) {
    try {
      const tokensRef = collection(firestore, 'tokens');
      const dataWithTimestamp = {
        ...tokenData,
        created_at: Timestamp.now(),
        estatus: 1 // 1 es activo
      };
      
      const docRef = await addDoc(tokensRef, dataWithTimestamp);
      return { id: docRef.id, ...dataWithTimestamp };
    } catch (error) {
      console.error('Error al crear token:', error);
      throw error;
    }
  }

  // Verifica si un token es válido
  static async verifyToken(tokenValue) {
    try {
      const tokensRef = collection(firestore, 'tokens');
      const q = query(tokensRef, where('token', '==', tokenValue));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const tokenData = querySnapshot.docs[0].data();
      
      // Verificar si el token está expirado
      if (tokenData.estatus !== 1) {
        return { ...tokenData, isValid: false, reason: 'expired' };
      }
      
      // Verificar si el token ha expirado por tiempo (60 minutos)
      const tokenCreationTime = tokenData.created_at.toDate();
      const currentTime = new Date();
      const diffInMinutes = (currentTime - tokenCreationTime) / (1000 * 60);
      
      if (diffInMinutes > 60) {
        // Actualizar el token a expirado en la base de datos
        await this.updateStatus(querySnapshot.docs[0].id, 0);
        return { ...tokenData, isValid: false, reason: 'timeExpired' };
      }
      
      return { id: querySnapshot.docs[0].id, ...tokenData, isValid: true };
    } catch (error) {
      console.error('Error al verificar token:', error);
      throw error;
    }
  }

  // Actualiza el estado de un token
  static async updateStatus(tokenId, newStatus) {
    try {
      const tokenRef = doc(firestore, 'tokens', tokenId);
      await updateDoc(tokenRef, { estatus: newStatus });
      return true;
    } catch (error) {
      console.error('Error al actualizar estado del token:', error);
      throw error;
    }
  }

  // Obtiene todos los tokens activos
  static async getAllActiveTokens() {
    try {
      const tokensRef = collection(firestore, 'tokens');
      const q = query(tokensRef, where('estatus', '==', 1));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener tokens activos:', error);
      throw error;
    }
  }

  // Actualiza los tokens expirados
  static async updateExpiredTokens() {
    try {
      const tokensRef = collection(firestore, 'tokens');
      const q = query(tokensRef, where('estatus', '==', 1));
      const querySnapshot = await getDocs(q);
      
      const currentTime = new Date();
      let updatedCount = 0;
      
      for (const doc of querySnapshot.docs) {
        const tokenData = doc.data();
        const tokenCreationTime = tokenData.created_at.toDate();
        const diffInMinutes = (currentTime - tokenCreationTime) / (1000 * 60);
        
        if (diffInMinutes > 60) {
          await this.updateStatus(doc.id, 0);
          updatedCount++;
        }
      }
      
      return updatedCount;
    } catch (error) {
      console.error('Error al actualizar tokens expirados:', error);
      throw error;
    }
  }
}

module.exports = Token;