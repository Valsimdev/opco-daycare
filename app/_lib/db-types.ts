import type { Kid, KidBadge, Parent } from "@/app/_data/mock";

export interface ChildRow {
  id: string;
  room_id: string;
  full_name: string;
  birth_date: string;
  enrolled_at: string;
  medical_notes: string | null;
  allergy_tags: string[] | null;
  photo_consent: boolean;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
}

export interface RoomRow {
  id: string;
  daycare_id: string;
  name: string;
  created_at: string;
}

export interface ChildWithRoom {
  id: string;
  full_name: string;
  birth_date: string;
  enrolled_at: string;
  medical_notes: string | null;
  allergy_tags: string[] | null;
  photo_consent: boolean;
  status: "active" | "archived";
  room_name: string;
}

const ALLERGY_MAP: Record<string, { label: string; bg: string; textColor: string }> = {
  peanut: { label: "MANÍ", bg: "#FBD8CC", textColor: "#D9684A" },
  lactose: { label: "LACTOSA", bg: "#FBD8CC", textColor: "#D9684A" },
};

function getAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function formatBirthDateUI(birthDate: string): string {
  const months = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  const d = new Date(birthDate + "T00:00:00");
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatEnrollmentDateUI(enrolledAt: string): string {
  const months = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
  ];
  const d = new Date(enrolledAt + "T00:00:00");
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
}

function buildBadges(allergyTags: string[] | null): KidBadge[] {
  if (!allergyTags || allergyTags.length === 0) return [];
  return allergyTags
    .map((tag) => ALLERGY_MAP[tag.toLowerCase()])
    .filter((b): b is KidBadge => b !== undefined);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const AVATAR_COLORS = [
  { bg: "#A9D9E8", textColor: "#1F7A93" },
  { bg: "#F4B8CC", textColor: "#C44A7A" },
  { bg: "#B9DEC4", textColor: "#3E8B62" },
  { bg: "#F4DC8E", textColor: "#9A7B1E" },
  { bg: "#C9B6E8", textColor: "#7B5FC0" },
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function mapChildToKid(row: ChildWithRoom, parentCount: number = 0, parents: Parent[] = []): Kid {
  const badges = buildBadges(row.allergy_tags);
  const { bg, textColor } = getAvatarColor(row.full_name);

  return {
    id: slugify(row.full_name),
    childId: row.id,
    name: row.full_name,
    age: getAge(row.birth_date),
    room: row.room_name,
    avatarInitial: row.full_name.charAt(0).toUpperCase(),
    avatarBg: bg,
    avatarTextColor: textColor,
    parentCount,
    badges,
    birthDate: formatBirthDateUI(row.birth_date),
    enrollmentDate: formatEnrollmentDateUI(row.enrolled_at),
    allergies: row.medical_notes || undefined,
    parents,
  };
}
