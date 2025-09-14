import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TButton } from '@/core/ui/TButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReservationGroupInsert>();

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
              <Label htmlFor="group_name">Nom du groupe*</Label>
              <Input
                id="group_name"
                {...register('group_name', { required: 'Le nom du groupe est obligatoire' })}
                placeholder="Ex: Groupe ABC Tour"
              />
              {errors.group_name && <p className="text-sm text-destructive">{errors.group_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="group_leader_name">Nom du responsable*</Label>
              <Input
                id="group_leader_name"
                {...register('group_leader_name', { required: 'Le nom du responsable est obligatoire' })}
                placeholder="Nom complet"
              />
              {errors.group_leader_name && <p className="text-sm text-destructive">{errors.group_leader_name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="group_leader_email">Email du responsable</Label>
              <Input
                id="group_leader_email"
                type="email"
                {...register('group_leader_email')}
                placeholder="email@exemple.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group_leader_phone">Téléphone du responsable</Label>
              <Input
                id="group_leader_phone"
                {...register('group_leader_phone')}
                placeholder="+225 XX XX XX XX"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_rooms">Nombre de chambres</Label>
              <Input
                id="total_rooms"
                type="number"
                min="0"
                {...register('total_rooms', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_guests">Nombre de clients</Label>
              <Input
                id="total_guests"
                type="number"
                min="0"
                {...register('total_guests', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group_rate">Tarif groupe (XOF)</Label>
              <Input
                id="group_rate"
                type="number"
                min="0"
                step="0.01"
                {...register('group_rate', { valueAsNumber: true })}
                placeholder="0"
              />
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
              disabled={createMutation.isPending}
            >
              Créer le groupe
            </TButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}