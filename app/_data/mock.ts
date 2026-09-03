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

export const rooms = ["Soles", "Lunas", "Estrellas"] as const;

export const kids: Kid[] = [
  {
    id: "mateo-fernandez",
    name: "Mateo Fernández",
    age: 3,
    room: "Soles",
    avatarInitial: "M",
    avatarBg: "#A9D9E8",
    avatarTextColor: "#1F7A93",
    parentCount: 2,
    badges: [{ label: "MANÍ", bg: "#FBD8CC", textColor: "#D9684A" }],
    birthDate: "12 mar 2022",
    enrollmentDate: "feb 2025",
    allergies: "Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.",
    parents: [
      { name: "Lucía Fernández", role: "Mamá", status: "activa", avatarInitial: "L", avatarBg: "#C9B6E8" },
      { name: "Diego Fernández", role: "Papá", status: "invitación enviada", avatarInitial: "D", avatarBg: "#A9C7E8" },
    ],
  },
  {
    id: "sofia-mendez",
    name: "Sofía Méndez",
    age: 2,
    room: "Soles",
    avatarInitial: "S",
    avatarBg: "#F4B8CC",
    avatarTextColor: "#C44A7A",
    parentCount: 1,
    badges: [],
    birthDate: "5 ago 2023",
    enrollmentDate: "mar 2025",
    parents: [
      { name: "Carla Méndez", role: "Mamá", status: "activa", avatarInitial: "C", avatarBg: "#F4B8CC" },
    ],
  },
  {
    id: "benjamin-ruiz",
    name: "Benjamín Ruiz",
    age: 3,
    room: "Soles",
    avatarInitial: "B",
    avatarBg: "#B9DEC4",
    avatarTextColor: "#3E8B62",
    parentCount: 2,
    badges: [],
    birthDate: "22 ene 2022",
    enrollmentDate: "feb 2025",
    parents: [
      { name: "Ana Ruiz", role: "Mamá", status: "activa", avatarInitial: "A", avatarBg: "#B9DEC4" },
      { name: "Diego Ruiz", role: "Papá", status: "activa", avatarInitial: "D", avatarBg: "#A9D9E8" },
    ],
  },
  {
    id: "valentina-soto",
    name: "Valentina Soto",
    age: 2,
    room: "Soles",
    avatarInitial: "V",
    avatarBg: "#F4DC8E",
    avatarTextColor: "#9A7B1E",
    parentCount: 0,
    badges: [{ label: "VINCULAR", bg: "#F9D2DE", textColor: "#C56486" }],
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
    avatarBg: "#C9B6E8",
    avatarTextColor: "#7B5FC0",
    parentCount: 1,
    badges: [{ label: "LACTOSA", bg: "#FBD8CC", textColor: "#D9684A" }],
    birthDate: "8 abr 2022",
    enrollmentDate: "feb 2025",
    allergies: "Intolerancia a la lactosa. Leche sin lactosa.",
    parents: [
      { name: "Marta Díaz", role: "Mamá", status: "activa", avatarInitial: "M", avatarBg: "#C9B6E8" },
    ],
  },
  {
    id: "emma-castro",
    name: "Emma Castro",
    age: 2,
    room: "Soles",
    avatarInitial: "E",
    avatarBg: "#F4B8CC",
    avatarTextColor: "#C44A7A",
    parentCount: 1,
    badges: [],
    birthDate: "30 jul 2023",
    enrollmentDate: "mar 2025",
    parents: [
      { name: "Lucía Castro", role: "Mamá", status: "activa", avatarInitial: "L", avatarBg: "#F4B8CC" },
    ],
  },
  {
    id: "lucas-romero",
    name: "Lucas Romero",
    age: 3,
    room: "Soles",
    avatarInitial: "L",
    avatarBg: "#A9D9E8",
    avatarTextColor: "#1F7A93",
    parentCount: 1,
    badges: [],
    birthDate: "17 feb 2022",
    enrollmentDate: "feb 2025",
    parents: [
      { name: "Jorge Romero", role: "Papá", status: "activa", avatarInitial: "J", avatarBg: "#A9D9E8" },
    ],
  },
  {
    id: "olivia-vega",
    name: "Olivia Vega",
    age: 2,
    room: "Soles",
    avatarInitial: "O",
    avatarBg: "#B9DEC4",
    avatarTextColor: "#3E8B62",
    parentCount: 1,
    badges: [],
    birthDate: "9 sep 2023",
    enrollmentDate: "abr 2025",
    parents: [
      { name: "Patricia Vega", role: "Mamá", status: "activa", avatarInitial: "P", avatarBg: "#B9DEC4" },
    ],
  },
];
