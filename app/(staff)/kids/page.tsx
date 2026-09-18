import { getChildren, getRooms } from "@/app/_actions/child-actions";
import { mapChildToKid } from "@/app/_lib/db-types";
import KidsPageClient from "./kids-page-client";

export default async function KidsPage() {
  const children = await getChildren();
  const rooms = await getRooms();

  const kids = children.map(mapChildToKid);
  const roomName = kids.length > 0 ? kids[0].room : "Soles";

  return <KidsPageClient kids={kids} roomName={roomName} rooms={rooms} />;
}
