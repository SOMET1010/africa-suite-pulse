import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import QRCode from 'qrcode';

interface QRMenuConfig {
  table_id: string;
  table_number: string;
  outlet_id: string;
  is_active: boolean;
  menu_url: string;
  qr_code_data: string;
}

interface ClientOrder {
  id: string;
  table_id: string;
  customer_name?: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    accompaniments?: string[];
    special_instructions?: string;
  }>;
  status: 'pending_validation' | 'validated' | 'rejected';
  total_amount: number;
  created_at: string;
  customer_phone?: string;
}

export function useQRCodeMenu() {
  const [qrConfigs, setQRConfigs] = useState<QRMenuConfig[]>([]);
  const [clientOrders, setClientOrders] = useState<ClientOrder[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateQRCodeForTable = async (tableId: string, tableNumber: string, outletId: string) => {
    setIsGenerating(true);
    try {
      // URL du menu digital pour cette table
      const baseUrl = window.location.origin;
      const menuUrl = `${baseUrl}/menu/digital?table=${tableId}&outlet=${outletId}`;
      
      // Générer le QR code
      const qrCodeData = await QRCode.toDataURL(menuUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      const newConfig: QRMenuConfig = {
        table_id: tableId,
        table_number: tableNumber,
        outlet_id: outletId,
        is_active: true,
        menu_url: menuUrl,
        qr_code_data: qrCodeData
      };

      setQRConfigs(prev => [
        ...prev.filter(config => config.table_id !== tableId),
        newConfig
      ]);

      toast({
        title: "QR Code généré",
        description: `QR Code créé pour la table ${tableNumber}`,
      });

      return newConfig;
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le QR code",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateQRForAllTables = async (tables: Array<{id: string, number: string}>, outletId: string) => {
    setIsGenerating(true);
    try {
      const configs = await Promise.all(
        tables.map(table => generateQRCodeForTable(table.id, table.number, outletId))
      );

      toast({
        title: "QR Codes générés",
        description: `${configs.length} QR codes créés avec succès`,
      });

      return configs.filter(Boolean);
    } catch (error) {
      console.error('Error generating QR codes for all tables:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération des QR codes",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const printQRCode = async (tableId: string) => {
    const config = qrConfigs.find(c => c.table_id === tableId);
    if (!config) return;

    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - Table ${config.table_number}</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              text-align: center; 
              font-family: Arial, sans-serif;
            }
            .qr-container {
              border: 2px solid #000;
              padding: 20px;
              display: inline-block;
              background: white;
            }
            .table-info {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .qr-code {
              margin: 20px 0;
            }
            .instructions {
              font-size: 14px;
              margin-top: 10px;
              max-width: 300px;
              margin-left: auto;
              margin-right: auto;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="table-info">Table ${config.table_number}</div>
            <div class="qr-code">
              <img src="${config.qr_code_data}" alt="QR Code" />
            </div>
            <div class="instructions">
              Scannez ce code pour voir notre menu et passer commande directement depuis votre téléphone
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const validateClientOrder = async (orderId: string) => {
    try {
      setClientOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: 'validated' }
            : order
        )
      );

      toast({
        title: "Commande validée",
        description: "La commande client a été validée et envoyée en cuisine",
      });
    } catch (error) {
      console.error('Error validating client order:', error);
      toast({
        title: "Erreur",
        description: "Impossible de valider la commande",
        variant: "destructive"
      });
    }
  };

  const rejectClientOrder = async (orderId: string, reason: string) => {
    try {
      setClientOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status: 'rejected' }
            : order
        )
      );

      toast({
        title: "Commande rejetée",
        description: reason,
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error rejecting client order:', error);
    }
  };

  const getQRCodeForTable = (tableId: string) => {
    return qrConfigs.find(config => config.table_id === tableId);
  };

  const getPendingClientOrders = () => {
    return clientOrders.filter(order => order.status === 'pending_validation');
  };

  // Simulation de commandes clients en attente
  useEffect(() => {
    const mockOrders: ClientOrder[] = [
      {
        id: '1',
        table_id: 'table-1',
        customer_name: 'Jean Dupont',
        items: [
          {
            product_id: '1',
            product_name: 'Riz au gras',
            quantity: 2,
            price: 2500,
            accompaniments: ['Salade', 'Pain'],
            special_instructions: 'Peu épicé s\'il vous plaît'
          }
        ],
        status: 'pending_validation',
        total_amount: 5000,
        created_at: new Date().toISOString(),
        customer_phone: '+225 07 12 34 56 78'
      }
    ];
    
    setClientOrders(mockOrders);
  }, []);

  return {
    qrConfigs,
    clientOrders,
    isGenerating,
    generateQRCodeForTable,
    generateQRForAllTables,
    printQRCode,
    validateClientOrder,
    rejectClientOrder,
    getQRCodeForTable,
    getPendingClientOrders
  };
}