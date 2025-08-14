import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TButton } from '@/core/ui/TButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { reservationGroupsApi } from '@/services/reservationGroups.api';
import { queryKeys } from '@/lib/queryClient';
import type { ReservationGroupInsert } from '@/types/reservationGroup';

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
}

export function CreateGroupDialog({ open, onOpenChange, orgId }: CreateGroupDialogProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ReservationGroupInsert>();

  const createMutation = useMutation({
    mutationFn: (data: ReservationGroupInsert) => reservationGroupsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.groups(orgId) });
      toast.success('Groupe créé avec succès');
      reset();
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error creating group:', error);
      toast.error('Erreur lors de la création du groupe');
    },
  });

  const onSubmit = (data: ReservationGroupInsert) => {
    createMutation.mutate({
      ...data,
      org_id: orgId,
      status: 'draft'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer un nouveau groupe</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du groupe*</Label>
              <Input
                id="name"
                {...register('name', { required: 'Le nom du groupe est obligatoire' })}
                placeholder="Ex: Groupe ABC Tour"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="group_type">Type de groupe*</Label>
              <Select onValueChange={(value) => setValue('group_type', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tour">Voyage organisé</SelectItem>
                  <SelectItem value="business">Affaires</SelectItem>
                  <SelectItem value="event">Événement</SelectItem>
                  <SelectItem value="wedding">Mariage</SelectItem>
                  <SelectItem value="conference">Conférence</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arrival_date">Date d'arrivée*</Label>
              <Input
                id="arrival_date"
                type="date"
                {...register('arrival_date', { required: 'La date d\'arrivée est obligatoire' })}
              />
              {errors.arrival_date && <p className="text-sm text-destructive">{errors.arrival_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="departure_date">Date de départ*</Label>
              <Input
                id="departure_date"
                type="date"
                {...register('departure_date', { required: 'La date de départ est obligatoire' })}
              />
              {errors.departure_date && <p className="text-sm text-destructive">{errors.departure_date.message}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Responsable du groupe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leader_name">Nom du responsable*</Label>
                <Input
                  id="leader_name"
                  {...register('leader_name', { required: 'Le nom du responsable est obligatoire' })}
                  placeholder="Nom complet"
                />
                {errors.leader_name && <p className="text-sm text-destructive">{errors.leader_name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="leader_email">Email du responsable</Label>
                <Input
                  id="leader_email"
                  type="email"
                  {...register('leader_email')}
                  placeholder="email@exemple.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="leader_phone">Téléphone du responsable</Label>
                <Input
                  id="leader_phone"
                  {...register('leader_phone')}
                  placeholder="+225 XX XX XX XX"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Contact (optionnel)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_person">Personne de contact</Label>
                <Input
                  id="contact_person"
                  {...register('contact_person')}
                  placeholder="Nom de la personne de contact"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Email de contact</Label>
                <Input
                  id="contact_email"
                  type="email"
                  {...register('contact_email')}
                  placeholder="contact@exemple.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Téléphone de contact</Label>
                <Input
                  id="contact_phone"
                  {...register('contact_phone')}
                  placeholder="+225 XX XX XX XX"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_requests">Demandes spéciales</Label>
            <Textarea
              id="special_requests"
              {...register('special_requests')}
              placeholder="Décrivez les demandes spéciales du groupe..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes internes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Notes internes pour l'équipe..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <TButton
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </TButton>
            <TButton
              type="submit"
              loading={createMutation.isPending}
            >
              Créer le groupe
            </TButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}