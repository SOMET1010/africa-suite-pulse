import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/unified-toast";

export interface POSTicketData {
  order: {
    id: string;
    order_number: string;
    total_amount: number;
    tax_amount: number;
    status: string;
    created_at: string;
    fne_invoice_id?: string;
    fne_reference_number?: string;
    fne_qr_code?: string;
    fne_validated_at?: string;
    fne_status?: string;
  };
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  outlet: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  cashier?: {
    display_name: string;
  };
}

export const usePOSTicketPrinting = () => {
  // Récupérer les données complètes d'une commande pour impression
  const getTicketData = async (orderId: string): Promise<POSTicketData> => {
    // Récupérer la commande avec infos FNE
    const { data: order, error: orderError } = await supabase
      .from("pos_orders")
      .select(`
        id,
        order_number,
        total_amount,
        tax_amount,
        status,
        created_at,
        fne_invoice_id,
        fne_reference_number,
        fne_qr_code,
        fne_validated_at,
        fne_status,
        outlet_id,
        cashier_id
      `)
      .eq("id", orderId)
      .single();

    if (orderError) throw orderError;

    // Récupérer les articles avec informations produit
    const { data: items, error: itemsError } = await supabase
      .from("pos_order_items")
      .select(`
        id,
        quantity,
        unit_price,
        total_price,
        pos_products(name)
      `)
      .eq("order_id", orderId)
      .order("created_at");

    if (itemsError) throw itemsError;

    // Transformation des items avec nom du produit
    const transformedItems = (items || []).map(item => ({
      id: item.id,
      product_name: item.pos_products?.name || 'Produit inconnu',
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }));

    // Récupérer les infos outlet
    const { data: outlet, error: outletError } = await supabase
      .from("pos_outlets")
      .select("name")
      .eq("id", order.outlet_id)
      .single();

    const finalOutlet = outlet || {
      name: "Point de Vente",
      address: "",
      phone: "",
      email: "",
    };

    // Récupérer les infos caissier (optionnel)
    let cashier = null;
    if (order.cashier_id) {
      const { data: cashierData } = await supabase
        .from("pos_users")
        .select("display_name")
        .eq("user_id", order.cashier_id)
        .single();
      
      cashier = cashierData;
    }

    return {
      order,
      items: transformedItems,
      outlet: finalOutlet,
      cashier,
    };
  };

  // Hook pour récupérer les données de ticket
  const useTicketData = (orderId?: string) => {
    return useQuery({
      queryKey: ["ticket-data", orderId],
      queryFn: () => getTicketData(orderId!),
      enabled: !!orderId,
    });
  };

  // Mutation pour déclencher l'impression
  const printTicketMutation = useMutation({
    mutationFn: async ({ orderId, copies = 1 }: { orderId: string; copies?: number }) => {
      const ticketData = await getTicketData(orderId);
      
      // Générer le HTML du ticket
      const ticketHtml = generateTicketHtml(ticketData);
      
      // Ouvrir une nouvelle fenêtre pour impression
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (!printWindow) {
        throw new Error('Impossible d\'ouvrir la fenêtre d\'impression');
      }

      printWindow.document.write(ticketHtml);
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé puis imprimer
      printWindow.onload = () => {
        setTimeout(() => {
          for (let i = 0; i < copies; i++) {
            printWindow.print();
          }
          printWindow.close();
        }, 500);
      };

      return ticketData;
    },
    onSuccess: (data) => {
      toast({
        title: "Ticket imprimé",
        description: `Ticket ${data.order.order_number} envoyé à l'imprimante`,
        variant: "success",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur d'impression",
        description: error.message || "Impossible d'imprimer le ticket",
        variant: "destructive",
      });
    },
  });

  return {
    useTicketData,
    printTicket: printTicketMutation.mutate,
    isPrinting: printTicketMutation.isPending,
    getTicketData,
  };
};

// Fonction pour générer le HTML du ticket
const generateTicketHtml = (data: POSTicketData): string => {
  const { order, items, outlet, cashier } = data;
  
  // Calculer les totaux
  const subtotal = order.total_amount - order.tax_amount;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ticket ${order.order_number}</title>
      <style>
        @page { 
          size: 80mm auto; 
          margin: 0; 
        }
        body { 
          font-family: 'Courier New', monospace; 
          font-size: 12px; 
          line-height: 1.2; 
          margin: 0; 
          padding: 10px;
          width: 70mm;
          background: white;
        }
        .header { 
          text-align: center; 
          border-bottom: 2px solid #000; 
          padding-bottom: 10px; 
          margin-bottom: 10px; 
        }
        .outlet-name { 
          font-size: 16px; 
          font-weight: bold; 
          margin-bottom: 5px; 
        }
        .outlet-info { 
          font-size: 10px; 
          margin-bottom: 2px; 
        }
        .order-info { 
          margin-bottom: 10px; 
          font-size: 11px; 
        }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 10px; 
        }
        .items-table th { 
          border-bottom: 1px solid #000; 
          padding: 3px 0; 
          font-size: 10px; 
        }
        .items-table td { 
          padding: 2px 0; 
          font-size: 10px; 
        }
        .item-name { 
          max-width: 30mm; 
          word-wrap: break-word; 
        }
        .item-qty { 
          text-align: center; 
        }
        .item-price { 
          text-align: right; 
        }
        .totals { 
          border-top: 1px solid #000; 
          padding-top: 5px; 
          margin-top: 10px; 
        }
        .total-line { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 2px; 
        }
        .grand-total { 
          font-weight: bold; 
          font-size: 14px; 
          border-top: 1px solid #000; 
          padding-top: 3px; 
          margin-top: 5px; 
        }
        .footer { 
          text-align: center; 
          margin-top: 15px; 
          font-size: 9px; 
        }
        .fne-section { 
          border-top: 2px solid #000; 
          padding-top: 10px; 
          margin-top: 15px; 
          text-align: center; 
        }
        .fne-title { 
          font-size: 11px; 
          font-weight: bold; 
          margin-bottom: 5px; 
          letter-spacing: 0.5px; 
        }
        .fne-subtitle { 
          font-size: 9px; 
          margin-bottom: 8px; 
          color: #666; 
        }
        .qr-container { 
          display: flex; 
          justify-content: center; 
          margin: 8px 0; 
        }
        .fne-info { 
          font-size: 8px; 
          line-height: 1.3; 
          margin-bottom: 3px; 
        }
        .fne-instructions { 
          font-size: 7px; 
          margin-top: 5px; 
          font-style: italic; 
          color: #555; 
        }
        .fne-url { 
          font-size: 6px; 
          margin-top: 3px; 
          word-break: break-all; 
        }
      </style>
    </head>
    <body>
      <!-- En-tête -->
      <div class="header">
        <div class="outlet-name">${outlet.name}</div>
        ${outlet.address ? `<div class="outlet-info">${outlet.address}</div>` : ''}
        ${outlet.phone ? `<div class="outlet-info">Tél: ${outlet.phone}</div>` : ''}
        ${outlet.email ? `<div class="outlet-info">${outlet.email}</div>` : ''}
      </div>

      <!-- Informations commande -->
      <div class="order-info">
        <div><strong>Commande:</strong> ${order.order_number}</div>
        <div><strong>Date:</strong> ${new Date(order.created_at).toLocaleString('fr-FR')}</div>
        ${cashier ? `<div><strong>Caissier:</strong> ${cashier.display_name}</div>` : ''}
      </div>

      <!-- Articles -->
      <table class="items-table">
        <thead>
          <tr>
            <th style="text-align: left;">Article</th>
            <th style="text-align: center;">Qté</th>
            <th style="text-align: right;">Prix</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td class="item-name">${item.product_name}</td>
              <td class="item-qty">${item.quantity}</td>
              <td class="item-price">${item.total_price.toLocaleString('fr-FR')} F</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Totaux -->
      <div class="totals">
        <div class="total-line">
          <span>Sous-total:</span>
          <span>${subtotal.toLocaleString('fr-FR')} FCFA</span>
        </div>
        <div class="total-line">
          <span>TVA (18%):</span>
          <span>${order.tax_amount.toLocaleString('fr-FR')} FCFA</span>
        </div>
        <div class="total-line grand-total">
          <span>TOTAL:</span>
          <span>${order.total_amount.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>

      ${order.fne_invoice_id && order.fne_qr_code ? `
        <!-- Section FNE -->
        <div class="fne-section">
          <div class="fne-title">FACTURE NORMALISEE ELECTRONIQUE</div>
          <div class="fne-subtitle">Direction Générale des Impôts - Côte d'Ivoire</div>
          
          <div class="qr-container">
            <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
              <!-- QR Code généré côté client -->
              <rect width="100" height="100" fill="white"/>
              <text x="50" y="50" text-anchor="middle" font-size="8" fill="black">QR Code FNE</text>
            </svg>
          </div>
          
          <div class="fne-info">
            <strong>ID FNE:</strong> ${order.fne_invoice_id}
          </div>
          ${order.fne_reference_number ? `
            <div class="fne-info">
              <strong>Réf DGI:</strong> ${order.fne_reference_number}
            </div>
          ` : ''}
          ${order.fne_validated_at ? `
            <div class="fne-info">
              <strong>Validée le:</strong> ${new Date(order.fne_validated_at).toLocaleString('fr-FR')}
            </div>
          ` : ''}
          
          <div class="fne-instructions">
            Scannez ce QR code pour vérifier l'authenticité<br>
            de cette facture sur le site de la DGI
          </div>
          
          <div class="fne-url">
            ${order.fne_qr_code.replace('https://', '')}
          </div>
        </div>
      ` : ''}

      <!-- Pied de page -->
      <div class="footer">
        <div>Merci de votre visite !</div>
        <div>Conservez ce ticket</div>
        ${order.fne_invoice_id ? '<div style="margin-top: 5px; font-weight: bold;">Facture certifiée DGI</div>' : ''}
      </div>

      <script>
        // Injecter le QR code réel si disponible
        ${order.fne_qr_code ? `
          // Ici on pourrait injecter une bibliothèque QR code côté client
          // Pour l'instant, on affiche un placeholder
        ` : ''}
      </script>
    </body>
    </html>
  `;
};