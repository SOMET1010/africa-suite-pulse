// Date and overlap utilities for the Rack

export function overlapsDay(res: { date_arrival: string; date_departure: string }, dayISO: string) {
  // Occupe la nuit de dayISO si arrival <= dayISO < departure
  return res.date_arrival <= dayISO && dayISO < res.date_departure;
}