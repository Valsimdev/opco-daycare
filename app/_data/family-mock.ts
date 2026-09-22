import type { Post } from "./mock";

export interface FamilyPost extends Post {
  childId: string;
}

const classroom = { name: "Soles", dateLabel: "martes 17 jun" };

const teacher = { name: "Maestra Caro", room: "Sala Soles" };

const familyKids = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Mateo",
    fullName: "Mateo Fernández",
    avatarBg: "#A9D9E8",
    avatarTextColor: "#1F7A93",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Sofía",
    fullName: "Sofía Méndez",
    avatarBg: "#F4B8CC",
    avatarTextColor: "#C44A7A",
  },
];

const familyPosts: FamilyPost[] = [
  {
    id: "mateo-achievement",
    childId: "00000000-0000-0000-0000-000000000001",
    type: "achievement",
    title: "Mateo",
    time: "14:20",
    publishedBy: `${teacher.name} · ${teacher.room}`,
    recipients: "familia de Mateo",
    text: "¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.",
    reactions: 3,
    comments: 1,
  },
  {
    id: "mateo-activity",
    childId: "00000000-0000-0000-0000-000000000001",
    type: "activity",
    title: "Mateo",
    time: "09:40",
    publishedBy: `${teacher.name} · ${teacher.room}`,
    recipients: "familia de Mateo",
    text: "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.",
    photoPlaceholder: "Foto · pintando con témperas",
    reactions: 5,
    comments: 2,
  },
  {
    id: "general-announcement",
    childId: "all",
    type: "announcement",
    title: "Anuncio general",
    time: "07:50",
    publishedBy: `${teacher.name}`,
    recipients: "toda la sala",
    text: "El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.",
    reactions: 8,
    comments: 0,
  },
];

export { classroom, teacher, familyKids, familyPosts };
