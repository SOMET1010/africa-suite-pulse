// Date and overlap utilities for the Rack
import type { UIRoom } from "./rack.types";

export function overlapsDay(res: { date_arrival: string; date_departure: string }, dayISO: string) {
  // Occupe la nuit de dayISO si arrival <= dayISO < departure
  return res.date_arrival <= dayISO && dayISO < res.date_departure;
}

export function roomDotClass(status: UIRoom["status"]) {
  switch (status) {
    case "clean": return "bg-green-200";
    case "inspected": return "bg-blue-200";
    case "dirty": return "bg-yellow-200";
    case "maintenance": return "bg-orange-200";
    case "out_of_order": return "bg-red-200";
    default: return "bg-gray-200";
  }
}