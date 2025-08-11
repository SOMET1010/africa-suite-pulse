-- Add foreign key constraints for better data integrity
-- Only add the essential guest and room foreign keys

-- Add foreign key from reservations.guest_id to guests.id
ALTER TABLE public.reservations 
ADD CONSTRAINT fk_reservations_guest_id 
FOREIGN KEY (guest_id) REFERENCES public.guests(id) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Add foreign key from reservations.room_id to rooms.id
ALTER TABLE public.reservations 
ADD CONSTRAINT fk_reservations_room_id 
FOREIGN KEY (room_id) REFERENCES public.rooms(id) 
ON DELETE SET NULL ON UPDATE CASCADE;