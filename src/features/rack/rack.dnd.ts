import type { UIRoom } from "./rack.types";

export const DND_MIME = "text/x-reservation-id";

export function isBlockedRoom(status: UIRoom["status"]) {
  return status === "out_of_order" || status === "maintenance";
}

export function setDragData(e: React.DragEvent, resId: string) {
  e.dataTransfer.setData(DND_MIME, resId);
  // compat baseline
  e.dataTransfer.setData("text/plain", resId);
  e.dataTransfer.effectAllowed = "move";
}

export function getDragData(e: React.DragEvent): string | null {
  return e.dataTransfer.getData(DND_MIME) || e.dataTransfer.getData("text/plain") || null;
}