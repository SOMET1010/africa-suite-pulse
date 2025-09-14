-- Add foreign key constraints for better data integrity
-- This will allow native SQL joins instead of manual enrichment

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

-- Add foreign key from reservations.org_id to hotel_settings.org_id for consistency
ALTER TABLE public.reservations 
ADD CONSTRAINT fk_reservations_org_id 
FOREIGN KEY (org_id) REFERENCES public.hotel_settings(org_id) 
ON DELETE CASCADE ON UPDATE CASCADE;