import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateSparePart } from "../hooks/useSpareParts";

const formSchema = z.object({
  part_code: z.string().min(1, "Le code pièce est obligatoire"),
  name: z.string().min(1, "Le nom est obligatoire"),
  description: z.string().optional(),
  category: z.enum(["hvac", "plumbing", "electrical", "mechanical", "consumable", "other"]),
  supplier: z.string().optional(),
  supplier_part_number: z.string().optional(),
  current_stock: z.number().min(0).optional(),
  min_stock_level: z.number().min(0).optional(),
  max_stock_level: z.number().min(1).optional(),
  unit_cost: z.number().min(0).optional(),
  unit: z.string().optional(),
  storage_location: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateSparePartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSparePartDialog({
  open,
  onOpenChange,
}: CreateSparePartDialogProps) {
  const createMutation = useCreateSparePart();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      part_code: "",
      name: "",
      description: "",
      category: "other",
      supplier: "",
      supplier_part_number: "",
      current_stock: 0,
      min_stock_level: 5,
      max_stock_level: 50,
      unit: "piece",
      storage_location: "",
      notes: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      // Ensure required fields are present and properly typed
      const createData = {
        part_code: values.part_code!,
        name: values.name!,
        category: values.category!,
        description: values.description || undefined,
        supplier: values.supplier || undefined,
        supplier_part_number: values.supplier_part_number || undefined,
        current_stock: values.current_stock || undefined,
        min_stock_level: values.min_stock_level || undefined,
        max_stock_level: values.max_stock_level || undefined,
        unit_cost: values.unit_cost || undefined,
        unit: values.unit || undefined,
        storage_location: values.storage_location || undefined,
        notes: values.notes || undefined,
      };
      
      await createMutation.mutateAsync(createData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors de la création de la pièce détachée:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle pièce détachée</DialogTitle>
          <DialogDescription>
            Ajouter une nouvelle pièce détachée au stock
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="part_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code pièce</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: FILT-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de la pièce</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Filtre climatisation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="hvac">Climatisation</SelectItem>
                        <SelectItem value="plumbing">Plomberie</SelectItem>
                        <SelectItem value="electrical">Électricité</SelectItem>
                        <SelectItem value="mechanical">Mécanique</SelectItem>
                        <SelectItem value="consumable">Consommable</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unité</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une unité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="piece">Pièce</SelectItem>
                        <SelectItem value="meter">Mètre</SelectItem>
                        <SelectItem value="liter">Litre</SelectItem>
                        <SelectItem value="kg">Kilogramme</SelectItem>
                        <SelectItem value="box">Boîte</SelectItem>
                        <SelectItem value="roll">Rouleau</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fournisseur</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: ABC Fournitures" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier_part_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Référence fournisseur</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: REF-ABC-123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="current_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock actuel</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="Ex: 10"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_stock_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock minimum</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="Ex: 5"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 5)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_stock_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock maximum</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="Ex: 50"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 50)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coût unitaire (FCFA)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="Ex: 2500"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storage_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu de stockage</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Entrepôt A - Étagère 3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description détaillée de la pièce..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informations complémentaires..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Création..." : "Créer la pièce"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
