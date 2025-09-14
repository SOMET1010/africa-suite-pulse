import { RoomServiceInterface } from "@/features/pos/components/room-service/RoomServiceInterface";
import { useNavigate } from "react-router-dom";

export default function POSRoomServicePage() {
  const navigate = useNavigate();

  return (
    <RoomServiceInterface 
      onBack={() => navigate("/pos")}
    />
  );
}