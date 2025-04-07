// scripts/importQuestions.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin
// Esto asume que tienes un archivo serviceAccountKey.json en la raíz de tu proyecto
// Si no lo tienes, deberás descargarlo desde la consola de Firebase
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();

// Las preguntas para importar
const questions = [
  {
    "contenido": "Prefieres aprender observando gráficos o imágenes.",
    "estilo": "visual",
    "pregunta_id": 1,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Encuentras más fácil comprender algo cuando lo ves representado en un diagrama.",
    "estilo": "visual",
    "pregunta_id": 2,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Disfrutas del uso de colores y esquemas visuales en las explicaciones.",
    "estilo": "visual",
    "pregunta_id": 3,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Es más fácil para ti recordar información cuando la ves escrita.",
    "estilo": "visual",
    "pregunta_id": 4,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Prefieres estudiar usando mapas conceptuales o diagramas de flujo.",
    "estilo": "visual",
    "pregunta_id": 5,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Encuentras útil destacar información importante con colores.",
    "estilo": "visual",
    "pregunta_id": 6,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Disfrutas los tutoriales en video que muestran visualmente cómo hacer algo.",
    "estilo": "visual",
    "pregunta_id": 7,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Comprendes mejor cuando te presentan información en una presentación con imágenes y gráficos.",
    "estilo": "visual",
    "pregunta_id": 8,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Prefieres usar infografías para aprender nuevos conceptos.",
    "estilo": "visual",
    "pregunta_id": 9,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Te gusta escuchar explicaciones o historias para entender algo.",
    "estilo": "auditivo",
    "pregunta_id": 10,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Prefieres aprender en clases donde el profesor explica mucho con palabras.",
    "estilo": "auditivo",
    "pregunta_id": 11,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Encuentras útil grabar las clases para revisarlas después.",
    "estilo": "auditivo",
    "pregunta_id": 12,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Comprendes mejor cuando escuchas un podcast sobre un tema.",
    "estilo": "auditivo",
    "pregunta_id": 13,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Aprendes más rápido al repetir en voz alta lo que estudias.",
    "estilo": "auditivo",
    "pregunta_id": 14,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Prefieres participar en discusiones grupales para aprender nuevos conceptos.",
    "estilo": "auditivo",
    "pregunta_id": 15,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Las canciones o rimas te ayudan a memorizar información.",
    "estilo": "auditivo",
    "pregunta_id": 16,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Encuentras que escuchar audiolibros es una forma efectiva de aprender.",
    "estilo": "auditivo",
    "pregunta_id": 17,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Es más fácil para ti entender un tema si alguien lo explica en voz alta.",
    "estilo": "auditivo",
    "pregunta_id": 18,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Aprendes mejor cuando participas activamente en la actividad.",
    "estilo": "kinestesico",
    "pregunta_id": 19,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Prefieres practicar físicamente lo que estás aprendiendo.",
    "estilo": "kinestesico",
    "pregunta_id": 20,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Encuentras útil usar modelos o herramientas para entender conceptos complejos.",
    "estilo": "kinestesico",
    "pregunta_id": 21,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Disfrutas los experimentos o actividades prácticas en clase.",
    "estilo": "kinestesico",
    "pregunta_id": 22,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Es más fácil para ti aprender algo cuando lo haces con tus manos.",
    "estilo": "kinestesico",
    "pregunta_id": 23,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Prefieres clases donde puedes moverte y participar en dinámicas.",
    "estilo": "kinestesico",
    "pregunta_id": 24,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Retienes información mejor si escribes tus propias notas a mano.",
    "estilo": "kinestesico",
    "pregunta_id": 25,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Disfrutas actividades como crear proyectos o construir algo para aprender.",
    "estilo": "kinestesico",
    "pregunta_id": 26,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  },
  {
    "contenido": "Prefieres aprender mediante juegos interactivos o actividades dinámicas.",
    "estilo": "kinestesico",
    "pregunta_id": 27,
    "categoria": "General",
    "respuesta_patron": 2,
    "opciones": ["Sí", "No", "A veces"]
  }
];

async function importQuestions() {
  try {
    console.log('Comenzando la importación de preguntas...');
    const preguntasRef = firestore.collection('preguntas');
    
    // Primero verificar si ya hay preguntas en la colección
    const snapshot = await preguntasRef.get();
    if (!snapshot.empty) {
      console.log('Ya existen preguntas en la base de datos. Verificando duplicados...');
    }
    
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const question of questions) {
      // Verificar si la pregunta ya existe por pregunta_id
      const querySnapshot = await preguntasRef
        .where('pregunta_id', '==', question.pregunta_id)
        .get();
      
      if (!querySnapshot.empty) {
        console.log(`Pregunta ${question.pregunta_id} ya existe. Omitiendo...`);
        skippedCount++;
        continue;
      }
      
      // Añadir la pregunta si no existe
      await preguntasRef.add({
        ...question,
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`Pregunta ${question.pregunta_id} importada correctamente.`);
      importedCount++;
    }
    
    console.log(`¡Importación completada exitosamente!`);
    console.log(`Preguntas importadas: ${importedCount}`);
    console.log(`Preguntas omitidas (ya existentes): ${skippedCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Error al importar preguntas:', error);
    process.exit(1);
  }
}

// Ejecutar la función de importación
importQuestions();