import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { posCustomersApi } from '@/services/pos-customers.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Search, Plus, CreditCard, Receipt, DollarSign, Calendar } from 'lucide-react';
import { CustomerPaymentDialog } from './CustomerPaymentDialog';
import { CustomerInvoicesDialog } from './CustomerInvoicesDialog';

export function CustomerAccountsManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showInvoicesDialog, setShowInvoicesDialog] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ['pos-customers'],
    queryFn: () => posCustomersApi.getCustomerAccounts()
  });

  const { data: searchResults } = useQuery({
    queryKey: ['pos-customers-search', searchTerm],
    queryFn: () => posCustomersApi.searchCustomers(searchTerm),
    enabled: searchTerm.length > 2
  });

  const createCustomerMutation = useMutation({
    mutationFn: posCustomersApi.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-customers'] });
      setShowCreateDialog(false);
      toast.success('Client créé avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la création du client');
    }
  });

  const compressionMutation = useMutation({
    mutationFn: ({ month, year }: { month: number; year: number }) => 
      posCustomersApi.compressMonthlyStatements(month, year),
    onSuccess: (data) => {
      const successCount = data.data?.filter(r => !r.error).length || 0;
      toast.success(`Compression terminée: ${successCount} relevés créés`);
      queryClient.invalidateQueries({ queryKey: ['pos-customers'] });
    },
    onError: () => {
      toast.error('Erreur lors de la compression');
    }
  });

  const displayedCustomers = searchTerm.length > 2 
    ? searchResults?.data || []
    : customers?.data || [];

  const handleCreateCustomer = (formData: FormData) => {
    const customerData = {
      org_id: '', // Will be set by RLS
      name: formData.get('name') as string,
      address_line1: formData.get('address_line1') as string,
      address_line2: formData.get('address_line2') as string,
      postal_code: formData.get('postal_code') as string,
      city: formData.get('city') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      account_status: formData.get('account_status') as 'active' | 'blocked' | 'suspended',
      credit_limit_type: formData.get('credit_limit_type') as 'unlimited' | 'limited' | 'blocked',
      credit_limit: Number(formData.get('credit_limit')) || 0,
      loyalty_card_number: formData.get('loyalty_card_number') as string,
      notes: formData.get('notes') as string,
    };

    createCustomerMutation.mutate(customerData);
  };

  const handleMonthlyCompression = () => {
    const currentDate = new Date();
    const lastMonth = currentDate.getMonth() === 0 ? 12 : currentDate.getMonth();
    const year = currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
    
    compressionMutation.mutate({ month: lastMonth, year });
  };

  const getCreditLimitDisplay = (customer: any) => {
    if (customer.credit_limit_type === 'unlimited') return 'Illimité';
    if (customer.credit_limit_type === 'blocked') return 'Bloqué';
    return `${customer.credit_limit} XOF`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'blocked': return 'bg-destructive';
      case 'suspended': return 'bg-warning';
      default: return 'bg-muted';
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance < 0) return 'text-destructive';
    if (balance > 0) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion Débiteurs</h1>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleMonthlyCompression}
            variant="outline"
            disabled={compressionMutation.isPending}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Compression Mensuelle
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Débiteur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un nouveau client</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateCustomer(new FormData(e.currentTarget));
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom *</Label>
                    <Input name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input name="phone" type="tel" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input name="email" type="email" />
                </div>

                <div>
                  <Label htmlFor="address_line1">Adresse</Label>
                  <Input name="address_line1" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="postal_code">Code Postal</Label>
                    <Input name="postal_code" />
                  </div>
                  <div>
                    <Label htmlFor="city">Ville</Label>
                    <Input name="city" />
                  </div>
                  <div>
                    <Label htmlFor="loyalty_card_number">N° Carte Fidélité</Label>
                    <Input name="loyalty_card_number" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="credit_limit_type">Type de Crédit</Label>
                    <Select name="credit_limit_type" defaultValue="unlimited">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unlimited">Débit Illimité</SelectItem>
                        <SelectItem value="limited">Débit Limité</SelectItem>
                        <SelectItem value="blocked">Bloqué</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="credit_limit">Limite de Crédit</Label>
                    <Input name="credit_limit" type="number" min="0" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="account_status">Statut du Compte</Label>
                  <Select name="account_status" defaultValue="active">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="suspended">Suspendu</SelectItem>
                      <SelectItem value="blocked">Bloqué</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea name="notes" />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={createCustomerMutation.isPending}>
                    Créer
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un client (nom, code, téléphone)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Customers List */}
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : displayedCustomers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'Aucun client trouvé' : 'Aucun client enregistré'}
          </div>
        ) : (
          displayedCustomers.map((customer: any) => (
            <Card key={customer.id} className="cursor-pointer hover:bg-accent/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      <Badge className={getStatusColor(customer.account_status)}>
                        {customer.account_status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {customer.customer_code}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Solde: </span>
                        <span className={`font-medium ${getBalanceColor(customer.current_balance)}`}>
                          {customer.current_balance.toLocaleString()} XOF
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Crédit: </span>
                        <span className="font-medium">
                          {getCreditLimitDisplay(customer)}
                        </span>
                      </div>
                      {customer.phone && (
                        <div>
                          <span className="text-muted-foreground">Tél: </span>
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      {customer.city && (
                        <div>
                          <span className="text-muted-foreground">Ville: </span>
                          <span>{customer.city}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowInvoicesDialog(true);
                      }}
                    >
                      <Receipt className="h-4 w-4 mr-1" />
                      Factures
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowPaymentDialog(true);
                      }}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Règlement
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialogs */}
      {selectedCustomer && (
        <>
          <CustomerPaymentDialog
            customer={selectedCustomer}
            open={showPaymentDialog}
            onOpenChange={setShowPaymentDialog}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['pos-customers'] });
              setShowPaymentDialog(false);
            }}
          />
          <CustomerInvoicesDialog
            customer={selectedCustomer}
            open={showInvoicesDialog}
            onOpenChange={setShowInvoicesDialog}
          />
        </>
      )}
    </div>
  );
}