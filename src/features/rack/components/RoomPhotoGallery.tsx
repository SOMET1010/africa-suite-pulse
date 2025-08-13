import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { ChevronLeft, ChevronRight, Wifi, Tv, Car, Utensils, Wind, Bath, Coffee, Shield, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { UIRoom } from '../rack.types';

interface RoomPhotoGalleryProps {
  room: UIRoom;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RoomPhoto {
  url: string;
  name: string;
}

const ROOM_FEATURES_ICONS = {
  wifi: { icon: Wifi, label: 'WiFi Gratuit' },
  tv: { icon: Tv, label: 'TV Écran Plat' },
  parking: { icon: Car, label: 'Parking' },
  minibar: { icon: Utensils, label: 'Minibar' },
  ac: { icon: Wind, label: 'Climatisation' },
  jacuzzi: { icon: Bath, label: 'Jacuzzi' },
  coffee: { icon: Coffee, label: 'Machine à Café' },
  safe: { icon: Shield, label: 'Coffre-fort' },
};

const DEMO_FEATURES = ['wifi', 'tv', 'ac', 'minibar', 'safe'];

export function RoomPhotoGallery({ room, open, onOpenChange }: RoomPhotoGalleryProps) {
  const [photos, setPhotos] = useState<RoomPhoto[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && room) {
      loadRoomPhotos();
    }
  }, [open, room]);

  const loadRoomPhotos = async () => {
    try {
      setLoading(true);
      
      // Try to get photos from storage
      const { data: files, error } = await supabase.storage
        .from('room-photos')
        .list(`${room.id}`, {
          limit: 10,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error('Error loading photos:', error);
        // Use demo photos if no real photos
        setPhotos([
          { url: '/placeholder.svg', name: 'Vue principale' },
          { url: '/placeholder.svg', name: 'Salle de bain' },
          { url: '/placeholder.svg', name: 'Vue balcon' }
        ]);
        return;
      }

      if (files && files.length > 0) {
        const photoUrls = await Promise.all(
          files.map(async (file) => {
            const { data: urlData } = supabase.storage
              .from('room-photos')
              .getPublicUrl(`${room.id}/${file.name}`);
            
            return {
              url: urlData.publicUrl,
              name: file.name.replace(/\.[^/.]+$/, '')
            };
          })
        );
        setPhotos(photoUrls);
      } else {
        // Demo photos when no uploads
        setPhotos([
          { url: '/placeholder.svg', name: 'Vue principale' },
          { url: '/placeholder.svg', name: 'Salle de bain' },
          { url: '/placeholder.svg', name: 'Vue balcon' }
        ]);
      }
    } catch (error) {
      console.error('Error loading room photos:', error);
      setPhotos([{ url: '/placeholder.svg', name: 'Chambre non disponible' }]);
    } finally {
      setLoading(false);
    }
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const currentPhoto = photos[currentPhotoIndex];

  if (!room) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-display">
            Chambre {room?.number || 'N/A'} - {room?.type || 'N/A'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Photo Gallery */}
          <div className="flex-1 relative bg-muted/10">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                <img
                  src={currentPhoto?.url || '/placeholder.svg'}
                  alt={currentPhoto?.name || 'Chambre'}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation arrows */}
                {photos.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                      onClick={prevPhoto}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                      onClick={nextPhoto}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}

                {/* Photo counter */}
                <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
                  {currentPhotoIndex + 1} / {photos.length}
                </div>

                {/* Photo name */}
                <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
                  {currentPhoto?.name}
                </div>
              </>
            )}
          </div>

          {/* Room Details Panel */}
          <div className="w-80 p-6 bg-background border-l overflow-y-auto">
            <div className="space-y-6">
              {/* Room Info */}
              <div>
                <h3 className="font-semibold mb-3">Informations</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Étage</span>
                    <span>{room?.floor || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span>{room?.type || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacité</span>
                    <span>2 personnes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut</span>
                    <Badge variant={room?.status === 'clean' ? 'default' : 'secondary'}>
                      {room?.status === 'clean' ? 'Propre' : 
                       room?.status === 'dirty' ? 'Sale' :
                       room?.status === 'maintenance' ? 'Maintenance' : 'Indisponible'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Equipment */}
              <div>
                <h3 className="font-semibold mb-3">Équipements</h3>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_FEATURES.map((feature) => {
                    const featureInfo = ROOM_FEATURES_ICONS[feature as keyof typeof ROOM_FEATURES_ICONS];
                    if (!featureInfo) return null;
                    
                    const IconComponent = featureInfo.icon;
                    return (
                      <div key={feature} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                        <IconComponent className="w-4 h-4 text-primary" />
                        <span className="text-xs">{featureInfo.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="font-semibold mb-3">Tarification</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base nuit</span>
                    <span className="font-semibold">85€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weekend</span>
                    <span className="font-semibold">95€</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Haute saison</span>
                    <span className="font-semibold">110€</span>
                  </div>
                </div>
              </div>

              {/* Thumbnail navigation */}
              {photos.length > 1 && (
                <div>
                  <h3 className="font-semibold mb-3">Toutes les photos</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentPhotoIndex ? 'border-primary' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}