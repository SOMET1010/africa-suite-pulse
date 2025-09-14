-- Fix room creation issues: Add missing RLS policies and proper relationships

-- 1. Add missing RLS policies for rooms table
CREATE POLICY "Authenticated can insert rooms" 
ON public.rooms 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated can delete rooms" 
ON public.rooms 
FOR DELETE 
USING (true);

-- 2. Add missing RLS policies for room_types table  
CREATE POLICY "Authenticated can insert room types"
ON public.room_types
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated can delete room types"
ON public.room_types
FOR DELETE
USING (true);

-- 3. Add room_type_id column to rooms table
ALTER TABLE public.rooms 
ADD COLUMN room_type_id UUID REFERENCES public.room_types(id);

-- 4. Add missing columns to rooms table
ALTER TABLE public.rooms 
ADD COLUMN is_fictive BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN features JSONB DEFAULT '{}',
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- 5. Update existing rooms to link to room_types via room_type_id
UPDATE public.rooms 
SET room_type_id = rt.id
FROM public.room_types rt 
WHERE rooms.type = rt.code 
AND rooms.org_id = rt.org_id;

-- 6. Create trigger for automatic timestamp updates on rooms
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON public.rooms
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();