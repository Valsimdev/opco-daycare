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
