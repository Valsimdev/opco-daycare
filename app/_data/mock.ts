// Fictional data for the feed screen — no persistence.

export type PostType = "achievement" | "activity" | "announcement";

export interface Post {
  id: string;
  type: PostType;
  title: string;
  time: string;
  publishedBy: string;
  recipients: string;
  text: string;
  photoPlaceholder?: string;
  reactions: number;
  comments: number;
}

export interface StaffProfile {
  name: string;
  role: string;
  initial: string;
}

export const classroom = { name: "Soles", children: 12, dateLabel: "martes 17 jun" };

export const profile: StaffProfile = {
  name: "Caro Giménez",
  role: "Maestra · Soles",
  initial: "C",
};

export const posts: Post[] = [
  {
    id: "mateo-achievement",
    type: "achievement",
    title: "Mateo",
    time: "14:20",
    publishedBy: "publicado por vos",
    recipients: "familia de Mateo",
    text: "¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.",
    reactions: 3,
    comments: 1,
  },
  {
    id: "mateo-activity",
    type: "activity",
    title: "Mateo",
    time: "09:40",
    publishedBy: "publicado por vos",
    recipients: "familia de Mateo",
    text: "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.",
    photoPlaceholder: "Foto · pintando con témperas",
    reactions: 5,
    comments: 2,
  },
  {
    id: "general-announcement",
    type: "announcement",
    title: "Anuncio general",
    time: "07:50",
    publishedBy: "publicado por vos",
    recipients: "toda la sala",
    text: "El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellito de agua.",
    reactions: 8,
    comments: 0,
  },
];

// Kids profile data

export interface KidBadge {
  label: string;
  bg: string;
  textColor: string;
}

export interface Parent {
  name: string;
  role: string;
  status: "activa" | "invitación enviada";
  avatarInitial: string;
  avatarBg: string;
}

export interface Kid {
  id: string;
  name: string;
  age: number;
  room: string;
  avatarInitial: string;
  avatarBg: string;
  avatarTextColor: string;
  parentCount: number;
  badges: KidBadge[];
  birthDate: string;
  enrollmentDate: string;
  allergies?: string;
  parents: Parent[];
}

export const kids: Kid[] = [
  {
    id: "mateo-fernandez",
    name: "Mateo Fernández",
    age: 3,
    room: "Soles",
    avatarInitial: "M",
    avatarBg: "#FFD166",
    avatarTextColor: "#ffffff",
    parentCount: 2,
    badges: [{ label: "MANÍ", bg: "#FFE4E1", textColor: "#D8000C" }],
    birthDate: "12 mar 2022",
    enrollmentDate: "feb 2025",
    allergies: "Alergia al maní. Evitar snacks con trazas.",
    parents: [
      { name: "Laura Fernández", role: "Mamá", status: "activa", avatarInitial: "L", avatarBg: "#06D6A0" },
      { name: "Martín Fernández", role: "Papá", status: "activa", avatarInitial: "M", avatarBg: "#118AB2" },
    ],
  },
  {
    id: "sofia-mendez",
    name: "Sofía Méndez",
    age: 2,
    room: "Soles",
    avatarInitial: "S",
    avatarBg: "#EF476F",
    avatarTextColor: "#ffffff",
    parentCount: 1,
    badges: [],
    birthDate: "5 ago 2023",
    enrollmentDate: "mar 2025",
    parents: [
      { name: "Carla Méndez", role: "Mamá", status: "activa", avatarInitial: "C", avatarBg: "#FFD166" },
    ],
  },
  {
    id: "benjamin-ruiz",
    name: "Benjamín Ruiz",
    age: 3,
    room: "Soles",
    avatarInitial: "B",
    avatarBg: "#118AB2",
    avatarTextColor: "#ffffff",
    parentCount: 2,
    badges: [],
    birthDate: "22 ene 2022",
    enrollmentDate: "feb 2025",
    parents: [
      { name: "Ana Ruiz", role: "Mamá", status: "activa", avatarInitial: "A", avatarBg: "#06D6A0" },
      { name: "Diego Ruiz", role: "Papá", status: "activa", avatarInitial: "D", avatarBg: "#FFD166" },
    ],
  },
  {
    id: "valentina-soto",
    name: "Valentina Soto",
    age: 2,
    room: "Soles",
    avatarInitial: "V",
    avatarBg: "#FFD166",
    avatarTextColor: "#ffffff",
    parentCount: 0,
    badges: [{ label: "VINCULAR", bg: "#E0F7FA", textColor: "#007B8A" }],
    birthDate: "15 nov 2023",
    enrollmentDate: "jun 2025",
    parents: [],
  },
  {
    id: "tomas-diaz",
    name: "Tomás Díaz",
    age: 3,
    room: "Soles",
    avatarInitial: "T",
    avatarBg: "#06D6A0",
    avatarTextColor: "#ffffff",
    parentCount: 1,
    badges: [{ label: "LACTOSA", bg: "#FFE4E1", textColor: "#D8000C" }],
    birthDate: "8 abr 2022",
    enrollmentDate: "feb 2025",
    allergies: "Intolerancia a la lactosa. Leche sin lactosa.",
    parents: [
      { name: "Marta Díaz", role: "Mamá", status: "activa", avatarInitial: "M", avatarBg: "#EF476F" },
    ],
  },
  {
    id: "emma-castro",
    name: "Emma Castro",
    age: 2,
    room: "Soles",
    avatarInitial: "E",
    avatarBg: "#EF476F",
    avatarTextColor: "#ffffff",
    parentCount: 1,
    badges: [],
    birthDate: "30 jul 2023",
    enrollmentDate: "mar 2025",
    parents: [
      { name: "Lucía Castro", role: "Mamá", status: "activa", avatarInitial: "L", avatarBg: "#118AB2" },
    ],
  },
  {
    id: "lucas-romero",
    name: "Lucas Romero",
    age: 3,
    room: "Soles",
    avatarInitial: "L",
    avatarBg: "#118AB2",
    avatarTextColor: "#ffffff",
    parentCount: 1,
    badges: [],
    birthDate: "17 feb 2022",
    enrollmentDate: "feb 2025",
    parents: [
      { name: "Jorge Romero", role: "Papá", status: "activa", avatarInitial: "J", avatarBg: "#FFD166" },
    ],
  },
  {
    id: "olivia-vega",
    name: "Olivia Vega",
    age: 2,
    room: "Soles",
    avatarInitial: "O",
    avatarBg: "#06D6A0",
    avatarTextColor: "#ffffff",
    parentCount: 1,
    badges: [],
    birthDate: "9 sep 2023",
    enrollmentDate: "abr 2025",
    parents: [
      { name: "Patricia Vega", role: "Mamá", status: "activa", avatarInitial: "P", avatarBg: "#EF476F" },
    ],
  },
];
