export interface LostSoul {
  id: string;
  nombre: string;
  fotoX: string;
  fotoColor: string;
  frasePerdida: string;
  dialogoTriste: string;
  acciones: {
    texto: string;
    esCorrecta: boolean;
    respuesta: string;
  }[];
  fraseSalvado: string;
  color: string;
}

export const BATTLE_STORY = {
  intro: [
    "¿De verdad creen que este 'vínculo' es real?",
    "Mírense... perdidos en una gala que solo oculta su soledad.",
    "Indira ni siquiera hace streams diarios, se burla de su tiempo.",
    "No son sus amigos. Solo son números en una pantalla",
    "¿Saben qué hace mientras no está? Se ríe con ese tal 'Developer",
    "Los cambió por alguien mas ",
    "Ríndanse. Esta gala es tan falsa como su 'amistad' de bits."
  ],
  amigos: [
    {
      id: "ronaldo",
      nombre: "Ronaldo",
      fotoX: "/images/amigos/ronaldoX.png",
      fotoColor: "/images/amigos/ronaldo.png",
      frasePerdida: "Ronaldo está rodeado de sombras... parece estar entrando en su fase más edgy.",
      dialogoTriste: "Ya no importa... la programación es solo código vacío... Zaun está más cerca de lo que creen...",
      acciones: [
        { texto: "Le dices que ya anunciaron cap5 y 6 de Deltarune ", esCorrecta: false, respuesta: "Seguramente es falso TobyFox miente " },
        { texto: "Llamar al Comandante de las Tropas Jurásicas", esCorrecta: true, respuesta: "¡Ronaldo recuerda su rango! Sus ojos brillan con carisma." },
        { texto: "Decirle que el Genshi esta regalando deseos  ", esCorrecta: false, respuesta: "No te cree.. Se siente aun mas triste " }
      ],
      fraseSalvado: "¡Pero Indi!  ¡Yo ya estoy! ¡Nadie derrota a las Tropas Jurásicas!",
      color: "#facc15" 
    },
    {
      id: "horrorKarua",
      nombre: "HorrorKarua",
      fotoX: "/images/amigos/horrorKaruaX.png",
      fotoColor: "/images/amigos/horrorKarua.png",
      frasePerdida: "HorrorCaigua está mirando su billetera vacía... parece haber olvidado sus propios diseños.",
      dialogoTriste: "Genshin ya no tiene sentido... ¿Para qué diseñar algo hermoso si nadie escucha mis problemas?",
      acciones: [
        { texto: "Le dices que ", esCorrecta: false, respuesta: "Se estresa. '¡No tengo ni para el banner!' grita." },
        { texto: "Contarle tus problemas de migajero", esCorrecta: true, respuesta: "Su instinto de lealtad despierta. ¡Empieza a aconsejarte!" },
        { texto: "Criticar su diseño", esCorrecta: false, respuesta: "Su carácter fuerte te intimida. No es por ahí." }
      ],
      fraseSalvado: "¡Ya deja de dar pena! Escucha bien lo que te voy a decir...",
      color: "#ec4899" 
    },
    {
      id: "cristian",
      nombre: "Cristian",
      fotoX: "/images/amigos/cristianX.png",
      fotoColor: "/images/amigos/cristian.png",
      frasePerdida: "Un eco rancio se escucha... Cristian ha olvidado cómo hacer reír.",
      dialogoTriste: "T1 perdió... el Bar Otaku de Perú fue solo un sueño... ¿Para qué seguir intentando hacer chistes...?",
      acciones: [
        { texto: "Le cobras 1 bit por un chiste malo ", esCorrecta: false, respuesta: "Cristian se siente utlizado" },
        { texto: "Gritar: ¡VAS A CAER INDIRA!", esCorrecta: true, respuesta: "¡La frase lo hace reaccionar! ¡El humor rancio vuelve a su cuerpo!" },
        { texto: "Hablar de Valorant", esCorrecta: false, respuesta: "Prefiere el LOL. Se aburre." }
      ],
      fraseSalvado: "¡Parce! ¡Casi me quedo en el Limbo! ¡Indira, vas a caer por abandonarnos xd!",
      color: "#3b82f6" 
    },
    {
      id: "darling",
      nombre: "Darling",
      fotoX: "/images/amigos/darlingX.png",
      fotoColor: "/images/amigos/darling.png",
      frasePerdida: "Darling busca su gorra de Clementine... pero solo encuentra estática de Cyberpunk.",
      dialogoTriste: "El Doctor no puede ayudarme ahora... Invencible resultó ser muy frágil...",
      acciones: [
        { texto: "Mencionar a Cristian", esCorrecta: true, respuesta: "¡Recordar a su 'hombre' le devuelve la determinación!" },
        { texto: "Tu Doctor da miedo ", esCorrecta: false, respuesta: "No tiene sentido DBD ahora " },
        { texto: "Hablar de brujas y slimes", esCorrecta: false, respuesta: "Se distrae, pero sigue triste." }
      ],
      fraseSalvado: " El DarlCri es real ¡Nadie me  separan de mi Cristian!",
      color: "#ef4444" 
    },
    {
      id: "bigStyle",
      nombre: "BigStyle",
      fotoX: "/images/amigos/bigStyleX.png",
      fotoColor: "/images/amigos/bigStyle.png",
      frasePerdida: "Estás atrapado en un bucle de Balatro... Mota está arañando tu alma.",
      dialogoTriste: "Soy un intento de programador... un Deku sin quirk... solo soy un migajero más por la 'D'...",
      acciones: [
        { texto: "Gritar: ¡ESTO ES COMPETITIVO!", esCorrecta: true, respuesta: "¡Tu espíritu competitivo despierta! ¡A la mierda el nerfeo de Mota!" },
        { texto: "Dejar que Mota se suba al teclado", esCorrecta: false, respuesta: "Te nerfea el alma. Te sientes más débil." },
        { texto: "Flamear al equipo", esCorrecta: false, respuesta: "Te pones tóxico y pierdes el foco." }
      ],
      fraseSalvado: "¡Mota, bájate! ¡No soy un intento de programador, soy  dueño de mi propio código!",
      color: "#22c55e" 
    },
    {
      id: "indira",
      nombre: "Indira",
      fotoX: "/images/amigos/indiraX.png",
      fotoColor: "/images/amigos/indira.png",
      frasePerdida: "Indira está rodeada de juegos gratis... pero ninguno llena el vacío de haberlos dejado.",
      dialogoTriste: "La 'D' me da seguridad... ustedes son solo bits... no puedo seguir con los streams...",
      acciones: [
        { texto: "Estar modo migajero", esCorrecta: false, respuesta: "Te unes a su tristeza. Ambos pierden." },
        { texto: "Gritar: ¡NUEVO JUEGO GRATIS EN STEAM!", esCorrecta: true, respuesta: "¡Su frase icónica rompe el hechizo de Asriel!" },
        { texto: "Preguntar por el Dev D", esCorrecta: false, respuesta: "Se pone nerviosa y se aleja más." }
      ],
      fraseSalvado: "¡CHICOS! ¡Perdón! ¡La migajería se acabó! ¡Mañana hay stream de 12 horas!",
      color: "#a855f7" 
    }
  ] as LostSoul[]
};