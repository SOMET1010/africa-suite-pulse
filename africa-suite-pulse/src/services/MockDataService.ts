/**
 * Service pour générer des jeux de données de test adaptés au contexte ivoirien
 * Utilise Mockaroo et des données locales spécifiques à la Côte d'Ivoire
 */

interface MockDataOptions {
  rows: number;
  format: 'json' | 'csv' | 'sql';
  includeHeaders?: boolean;
}

interface IvoirianCustomer {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  ville: string;
  quartier: string;
  profession: string;
  age: number;
  sexe: 'M' | 'F';
  created_at: string;
}

interface IvoirianHotelData {
  reservation_id: string;
  client_nom: string;
  client_prenom: string;
  client_telephone: string;
  client_email: string;
  client_nationalite: string;
  numero_chambre: string;
  type_chambre: string;
  date_arrivee: string;
  date_depart: string;
  prix_nuit: number;
  nb_adultes: number;
  nb_enfants: number;
  statut: string;
  mode_paiement: string;
  created_at: string;
}

interface IvoirianPOSData {
  transaction_id: string;
  produit: string;
  categorie: string;
  prix: number;
  quantite: number;
  serveur: string;
  table_numero: string;
  date_heure: string;
  mode_paiement: string;
  tva: number;
  total: number;
}

export class MockDataService {
  // Données spécifiques à la Côte d'Ivoire
  private static readonly PRENOMS_MASCULINS = [
    'Kouadio', 'Kouassi', 'Kouakou', 'Konan', 'Koffi', 'Yao', 'Aya', 'Adjoua',
    'Akissi', 'Ama', 'Amenan', 'Affoué', 'Mariam', 'Fatou', 'Aïssata', 'Aminata',
    'Awa', 'Bintou', 'Fatoumata', 'Hawa', 'Salif', 'Ibrahim', 'Ousmane', 'Mamadou',
    'Aboubacar', 'Souleymane', 'Moussa', 'Adama', 'Seydou', 'Bakary'
  ];

  private static readonly PRENOMS_FEMININS = [
    'Adjoua', 'Akissi', 'Ama', 'Amenan', 'Affoué', 'Aya', 'Mariam', 'Fatou',
    'Aïssata', 'Aminata', 'Awa', 'Bintou', 'Fatoumata', 'Hawa', 'Kadiatou',
    'Ramatou', 'Korotoumou', 'Maimouna', 'Safiatou', 'Djéneba', 'Aïcha',
    'Rokia', 'Khadidja', 'Oumou', 'Assétou'
  ];

  private static readonly NOMS_FAMILLE = [
    'Kouassi', 'Kouadio', 'Kouakou', 'Konan', 'Koffi', 'Yao', 'Bamba', 'Diallo',
    'Traoré', 'Ouattara', 'Coulibaly', 'Koné', 'Sanogo', 'Diabaté', 'Touré',
    'Diarrassouba', 'N\'Guessan', 'Assouline', 'Bakayoko', 'Konaté', 'Dosso',
    'Fofana', 'Camara', 'Béchié', 'Doumbia', 'Silué', 'Yapo', 'Tano', 'Gbagbo'
  ];

  private static readonly VILLES_COTE_IVOIRE = [
    'Abidjan', 'Bouaké', 'Daloa', 'Yamoussoukro', 'San-Pédro', 'Korhogo',
    'Man', 'Divo', 'Gagnoa', 'Anyama', 'Abengourou', 'Agboville', 'Grand-Bassam',
    'Dabou', 'Grand-Lahou', 'Issia', 'Soubré', 'Adzopé', 'Oumé', 'Bongouanou'
  ];

  private static readonly QUARTIERS_ABIDJAN = [
    'Cocody', 'Plateau', 'Marcory', 'Treichville', 'Adjamé', 'Yopougon',
    'Abobo', 'Koumassi', 'Port-Bouët', 'Attécoubé', 'Bingerville', 'Anyama',
    'Riviera', 'Deux Plateaux', 'Zone 4', 'Angré', 'Bassam', 'Songon'
  ];

  private static readonly PROFESSIONS = [
    'Fonctionnaire', 'Commerçant', 'Enseignant', 'Chauffeur', 'Mécanicien',
    'Couturier', 'Coiffeur', 'Agriculteur', 'Pêcheur', 'Infirmier', 'Médecin',
    'Avocat', 'Banquier', 'Ingénieur', 'Étudiant', 'Artisan', 'Vendeur',
    'Restaurateur', 'Hôtelier', 'Guide touristique'
  ];

  private static readonly PRODUITS_LOCAUX = [
    'Attiéké', 'Bangui', 'Foutou', 'Kedjenou', 'Alloco', 'Garba', 'Tchep',
    'Placali', 'Sauce arachide', 'Sauce graine', 'Poisson braisé', 'Poulet DG',
    'Jus de bissap', 'Jus de gingembre', 'Bandji', 'Kachassa', 'Dégué',
    'Pain de singe', 'Cola', 'Bière Solibra', 'Bière Flag', 'Youki Soda'
  ];

  private static readonly TYPES_CHAMBRES = [
    'Chambre Simple', 'Chambre Double', 'Chambre Twin', 'Suite Junior',
    'Suite Exécutive', 'Suite Présidentielle', 'Chambre Familiale',
    'Chambre Climatisée', 'Chambre VIP', 'Bungalow'
  ];

  private static readonly NATIONALITES = [
    'Ivoirienne', 'Française', 'Malienne', 'Burkinabé', 'Ghanéenne',
    'Nigérienne', 'Sénégalaise', 'Guinéenne', 'Libanaise', 'Américaine',
    'Canadienne', 'Allemande', 'Italienne', 'Espagnole', 'Chinoise'
  ];

  private static getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private static getRandomDate(start: Date, end: Date): string {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
  }

  private static getRandomDateTime(): string {
    const now = new Date();
    const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 jours dans le passé
    const date = new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
    return date.toISOString();
  }

  private static generatePhoneNumber(): string {
    const prefixes = ['01', '02', '03', '05', '06', '07', '08', '09'];
    const prefix = this.getRandomItem(prefixes);
    const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    return `+225 ${prefix} ${number.substring(0, 2)} ${number.substring(2, 4)} ${number.substring(4)}`;
  }

  private static generateEmail(prenom: string, nom: string): string {
    const domains = ['gmail.com', 'yahoo.fr', 'hotmail.com', 'outlook.com', 'orange.ci', 'aviso.ci'];
    const domain = this.getRandomItem(domains);
    const cleanPrenom = prenom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const cleanNom = nom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return `${cleanPrenom}.${cleanNom}@${domain}`;
  }

  /**
   * Génère des données clients ivoiriens
   */
  static generateIvoirianCustomers(count: number): IvoirianCustomer[] {
    const customers: IvoirianCustomer[] = [];
    
    for (let i = 0; i < count; i++) {
      const sexe = Math.random() > 0.5 ? 'M' : 'F';
      const prenom = sexe === 'M' 
        ? this.getRandomItem(this.PRENOMS_MASCULINS)
        : this.getRandomItem(this.PRENOMS_FEMININS);
      const nom = this.getRandomItem(this.NOMS_FAMILLE);
      
      customers.push({
        id: `CUST-${(i + 1).toString().padStart(6, '0')}`,
        prenom,
        nom,
        email: this.generateEmail(prenom, nom),
        telephone: this.generatePhoneNumber(),
        ville: this.getRandomItem(this.VILLES_COTE_IVOIRE),
        quartier: this.getRandomItem(this.QUARTIERS_ABIDJAN),
        profession: this.getRandomItem(this.PROFESSIONS),
        age: Math.floor(Math.random() * 60) + 18,
        sexe,
        created_at: this.getRandomDateTime()
      });
    }
    
    return customers;
  }

  /**
   * Génère des données de réservations hôtelières
   */
  static generateHotelReservations(count: number): IvoirianHotelData[] {
    const reservations: IvoirianHotelData[] = [];
    
    for (let i = 0; i < count; i++) {
      const sexe = Math.random() > 0.5 ? 'M' : 'F';
      const prenom = sexe === 'M' 
        ? this.getRandomItem(this.PRENOMS_MASCULINS)
        : this.getRandomItem(this.PRENOMS_FEMININS);
      const nom = this.getRandomItem(this.NOMS_FAMILLE);
      
      const dateArrivee = new Date();
      dateArrivee.setDate(dateArrivee.getDate() + Math.floor(Math.random() * 90));
      const dateDepart = new Date(dateArrivee);
      dateDepart.setDate(dateDepart.getDate() + Math.floor(Math.random() * 14) + 1);
      
      const typeChambre = this.getRandomItem(this.TYPES_CHAMBRES);
      let prixBase = 25000; // Prix de base en FCFA
      
      // Ajustement du prix selon le type de chambre
      if (typeChambre.includes('Suite')) prixBase *= 3;
      else if (typeChambre.includes('VIP')) prixBase *= 2;
      else if (typeChambre.includes('Familiale')) prixBase *= 1.5;
      
      reservations.push({
        reservation_id: `RES-${(i + 1).toString().padStart(6, '0')}`,
        client_nom: nom,
        client_prenom: prenom,
        client_telephone: this.generatePhoneNumber(),
        client_email: this.generateEmail(prenom, nom),
        client_nationalite: this.getRandomItem(this.NATIONALITES),
        numero_chambre: `${Math.floor(Math.random() * 3) + 1}${(Math.floor(Math.random() * 50) + 1).toString().padStart(2, '0')}`,
        type_chambre: typeChambre,
        date_arrivee: this.getRandomDate(dateArrivee, dateArrivee),
        date_depart: this.getRandomDate(dateDepart, dateDepart),
        prix_nuit: prixBase + Math.floor(Math.random() * 10000),
        nb_adultes: Math.floor(Math.random() * 3) + 1,
        nb_enfants: Math.floor(Math.random() * 3),
        statut: this.getRandomItem(['Confirmée', 'En attente', 'Annulée', 'Check-in', 'Check-out']),
        mode_paiement: this.getRandomItem(['Espèces', 'Carte bancaire', 'Virement', 'Mobile Money', 'Orange Money', 'MTN Money']),
        created_at: this.getRandomDateTime()
      });
    }
    
    return reservations;
  }

  /**
   * Génère des données de transactions POS
   */
  static generatePOSTransactions(count: number): IvoirianPOSData[] {
    const transactions: IvoirianPOSData[] = [];
    
    for (let i = 0; i < count; i++) {
      const produit = this.getRandomItem(this.PRODUITS_LOCAUX);
      const prix = Math.floor(Math.random() * 15000) + 500; // Prix entre 500 et 15500 FCFA
      const quantite = Math.floor(Math.random() * 5) + 1;
      const tva = Math.round(prix * quantite * 0.18); // TVA 18%
      const total = prix * quantite + tva;
      
      transactions.push({
        transaction_id: `TXN-${(i + 1).toString().padStart(8, '0')}`,
        produit,
        categorie: this.getRandomItem(['Plats', 'Boissons', 'Desserts', 'Entrées', 'Spécialités']),
        prix,
        quantite,
        serveur: `${this.getRandomItem(this.PRENOMS_MASCULINS)} ${this.getRandomItem(this.NOMS_FAMILLE)}`,
        table_numero: `T${Math.floor(Math.random() * 50) + 1}`,
        date_heure: this.getRandomDateTime(),
        mode_paiement: this.getRandomItem(['Espèces', 'Carte', 'Mobile Money', 'Orange Money', 'MTN Money']),
        tva,
        total
      });
    }
    
    return transactions;
  }

  /**
   * Exporte les données au format CSV
   */
  static exportToCSV<T>(data: T[], filename: string): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0] as object).join(',');
    const rows = data.map(item => 
      Object.values(item as object).map(value => 
        typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }

  /**
   * Génère et télécharge un fichier de données
   */
  static downloadData<T>(data: T[], filename: string, format: 'json' | 'csv' = 'json'): void {
    let content: string;
    let mimeType: string;
    let extension: string;

    if (format === 'csv') {
      content = this.exportToCSV(data, filename);
      mimeType = 'text/csv';
      extension = 'csv';
    } else {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      extension = 'json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Génère un dataset complet pour tests
   */
  static generateCompleteTestDataset(counts: {
    customers?: number;
    reservations?: number;
    transactions?: number;
  } = {}) {
    const {
      customers = 100,
      reservations = 50,
      transactions = 200
    } = counts;

    return {
      clients: this.generateIvoirianCustomers(customers),
      reservations: this.generateHotelReservations(reservations),
      transactions_pos: this.generatePOSTransactions(transactions),
      metadata: {
        generated_at: new Date().toISOString(),
        country: 'Côte d\'Ivoire',
        total_records: customers + reservations + transactions,
        generator: 'AfricaSuite MockDataService v1.0'
      }
    };
  }
}