// src/lib/battle-data.ts

export interface LostSoul {
  id: string;
  nombre: string;
  papelOriginal: string; // Referencia para nosotros
  frasePerdida: string;
  opciones: {
    label: string;
    esCorrecta: boolean;
    respuesta: string;
  }[];
}

export const LOST_SOULS_DATA: LostSoul[] = [
  {
    id: "soul-indira",
    nombre: "Indira",
    papelOriginal: "Toriel",
    frasePerdida: "Todo este tiempo cuidando a la comunidad... ¿para qué? Es mejor que todo termine aquí.",
    opciones: [
      { label: "* Recordar su apoyo", esCorrecta: true, respuesta: "¡Indira parece recordar su determinación! Un destello brilla en su mirada." },
      { label: "* Hablar de reglas", esCorrecta: false, respuesta: "No parece escucharte. Su mirada sigue vacía." },
      { label: "* Pedir un abrazo", esCorrecta: false, respuesta: "Tus palabras se pierden en el ruido blanco." }
    ]
  },
  {
    id: "soul-bigstyle",
    nombre: "BigStyle",
    papelOriginal: "Asgore",
    frasePerdida: "Solo quería lo mejor para todos... pero fallé. Ya no hay esperanza.",
    opciones: [
      { label: "* Recordar el inicio", esCorrecta: true, respuesta: "¡BigStyle aprieta los puños! Sientes que su alma vibra de nuevo." },
      { label: "* Rendirse", esCorrecta: false, respuesta: "Él baja la cabeza. La oscuridad se vuelve más densa." },
      { label: "* Atacar", esCorrecta: false, respuesta: "No puedes... tu determinación no te deja." }
    ]
  },
  {
    id: "soul-cristian",
    nombre: "Cristian",
    papelOriginal: "Sans",
    frasePerdida: "ya no tiene sentido... ¿por qué molestarse? solo... ríndete. ya hemos visto este final.",
    opciones: [
      { label: "* Contar un mal chiste", esCorrecta: false, respuesta: "Parece suspirar, pero su alma sigue gris." },
      { label: "* Recordar las risas", esCorrecta: true, respuesta: "¡Cristian esboza una sonrisa real! Sientes que te reconoce." },
      { label: "* Insistir", esCorrecta: false, respuesta: "Sientes que el mundo se vuelve más pesado." }
    ]
  },
  {
    id: "soul-horrorkarua",
    nombre: "HorrorKarua",
    papelOriginal: "Papyrus",
    frasePerdida: "¡EL GRAN KARUA YA NO TIENE PLANES! TODO MI TRABAJO... ES BASURA.",
    opciones: [
      { label: "* Alentar", esCorrecta: true, respuesta: "¡HorrorKarua recupera su postura! ¡Siente su grandeza de nuevo!" },
      { label: "* Ignorar", esCorrecta: false, respuesta: "Se desmorona un poco más." },
      { label: "* Ofrecer comida", esCorrecta: false, respuesta: "No parece tener hambre en este vacío." }
    ]
  },
  {
    id: "soul-taka",
    nombre: "Taka",
    papelOriginal: "Undyne",
    frasePerdida: "¡NO PODEMOS GANAR! La oscuridad es demasiado fuerte...",
    opciones: [
      { label: "* Desafiar", esCorrecta: false, respuesta: "Sus gritos ahogan tus palabras." },
      { label: "* Recordar su valor", esCorrecta: true, respuesta: "¡Taka grita con fuerza! Su espíritu de lucha está volviendo." },
      { label: "* Escapar", esCorrecta: false, respuesta: "No hay a dónde ir." }
    ]
  },
  {
    id: "soul-darling",
    nombre: "Darling",
    papelOriginal: "Alphys",
    frasePerdida: "Metí la pata... todo es mi culpa. Solo soy un desastre.",
    opciones: [
      { label: "* Hablar de anime", esCorrecta: false, respuesta: "No es el momento, aunque parece que una chispa brilló." },
      { label: "* Consolar", esCorrecta: true, respuesta: "Darling deja de temblar. Siente que no está sola." },
      { label: "* Darle la espalda", esCorrecta: false, respuesta: "El silencio se vuelve insoportable." }
    ]
  }
];

export const ASRIEL_ATTACKS = {
  STARS: 'Star Blazing',
  SABERS: 'Chaos Saber',
  LIGHTNING: 'Shocker Breaker',
  GONER: 'Hyper Goner' // El ataque final de succion
};