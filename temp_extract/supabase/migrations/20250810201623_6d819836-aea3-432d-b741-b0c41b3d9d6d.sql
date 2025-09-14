-- Create room_types_with_stock view for performance
CREATE OR REPLACE VIEW room_types_with_stock AS
SELECT 
  rt.*,
  COALESCE(room_counts.stock, 0) as stock
FROM room_types rt
LEFT JOIN (
  SELECT 
    type,
    COUNT(*) as stock
  FROM rooms 
  WHERE type IS NOT NULL
  GROUP BY type
) room_counts ON rt.code = room_counts.type;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_room_types_org_id ON room_types(org_id);
CREATE INDEX IF NOT EXISTS idx_room_types_code ON room_types(code);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type);

-- Enable RLS on the view
ALTER VIEW room_types_with_stock SET (security_invoker = true);

-- Add trigger for updated_at on room_types
CREATE TRIGGER update_room_types_updated_at
  BEFORE UPDATE ON room_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();