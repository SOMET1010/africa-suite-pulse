import { Reservation, Room } from "./types";
import { RackCell } from "./RackCell";

interface Props {
  room: Room;
  days: string[];
  reservations: Reservation[];
  mode: "compact" | "detailed";
  highlight?: boolean;
  onHighlight?: () => void;
}

export function RackRow({ room, days, reservations, mode, highlight, onHighlight }: Props) {
  const resForRoom = reservations.filter(r => r.roomId === room.id);

  return (
    <>
      <div
        className={"sticky left-0 z-10 bg-card px-3 py-2 border-b border-border " + (highlight ? "ring-1 ring-ring" : "")}
        onClick={onHighlight}
      >
        <div className="font-medium">{room.number} · {room.type}</div>
        <div className="text-xs text-muted-foreground">Étage {room.floor}</div>
      </div>
      {days.map((d) => (
        <RackCell key={room.id + d} date={d} roomId={room.id} roomStatus={room.status} mode={mode} reservations={resForRoom} />
      ))}
    </>
  );
}
