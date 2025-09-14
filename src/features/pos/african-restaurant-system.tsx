/**
 * Système de Restauration Africain Complet
 * POS avancé avec gestion cuisine temps réel et plats authentiques
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Progress } from '../../components/ui/progress'
import { 
  ChefHat, 
  Clock, 
  Users, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Timer,
  Utensils,
  Star,
  TrendingUp,
  Package,
  Bell,
  MapPin,
  Thermometer,
  Zap,
  Heart,
  Award,
  Globe
} from 'lucide-react'

// Types pour le système de restauration
interface AfricanDish {
  id: string
  name: string
  nameLocal: string
  description: string
  price: number
  currency: string
  category: 'entree' | 'plat' | 'dessert' | 'boisson'
  region: string
  country: string
  preparationTime: number
  difficulty: 'facile' | 'moyen' | 'difficile'
  ingredients: string[]
  allergens: string[]
  nutritionalInfo: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  image: string
  popularity: number
  availability: boolean
  seasonality: string[]
  culturalSignificance: string
}

interface KitchenOrder {
  id: string
  tableNumber: number
  items: Array<{
    dish: AfricanDish
    quantity: number
    modifications: string[]
    priority: 'normal' | 'urgent' | 'vip'
  }>
  status: 'pending' | 'preparing' | 'cooking' | 'ready' | 'served'
  estimatedTime: number
  actualTime?: number
  assignedChef: string
  notes: string
  timestamp: Date
}

interface InventoryItem {
  id: string
  name: string
  nameLocal: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  unit: string
  cost: number
  supplier: string
  expiryDate?: Date
  location: string
  lastRestocked: Date
  predictedUsage: number
}

interface RestaurantMetrics {
  dailyRevenue: number
  ordersCount: number
  averageOrderValue: number
  popularDishes: Array<{ dish: AfricanDish; count: number }>
  kitchenEfficiency: number
  customerSatisfaction: number
  wastePercentage: number
  profitMargin: number
}

// Plats africains authentiques
const AFRICAN_DISHES: AfricanDish[] = [
  {
    id: 'thieboudienne',
    name: 'Thiéboudienne',
    nameLocal: 'Ceebu jën',
    description: 'Riz au poisson, légumes et sauce tomate épicée - plat national du Sénégal',
    price: 2500,
    currency: 'XOF',
    category: 'plat',
    region: 'Afrique de l\'Ouest',
    country: 'Sénégal',
    preparationTime: 45,
    difficulty: 'moyen',
    ingredients: ['Riz', 'Poisson', 'Tomates', 'Oignons', 'Carotte', 'Chou', 'Aubergine', 'Piment'],
    allergens: ['Poisson'],
    nutritionalInfo: { calories: 520, protein: 28, carbs: 65, fat: 12 },
    image: '/images/dishes/thieboudienne.jpg',
    popularity: 95,
    availability: true,
    seasonality: ['toute_annee'],
    culturalSignificance: 'Plat de convivialité partagé en famille'
  },
  {
    id: 'yassa_poulet',
    name: 'Yassa Poulet',
    nameLocal: 'Yassa ginaar',
    description: 'Poulet mariné aux oignons et citron, spécialité casamançaise',
    price: 2000,
    currency: 'XOF',
    category: 'plat',
    region: 'Afrique de l\'Ouest',
    country: 'Sénégal',
    preparationTime: 35,
    difficulty: 'facile',
    ingredients: ['Poulet', 'Oignons', 'Citron', 'Moutarde', 'Huile', 'Ail', 'Piment'],
    allergens: ['Moutarde'],
    nutritionalInfo: { calories: 450, protein: 35, carbs: 15, fat: 28 },
    image: '/images/dishes/yassa_poulet.jpg',
    popularity: 88,
    availability: true,
    seasonality: ['toute_annee'],
    culturalSignificance: 'Plat festif des grandes occasions'
  },
  {
    id: 'mafe',
    name: 'Mafé',
    nameLocal: 'Tigadèguèna',
    description: 'Ragoût de viande à la pâte d\'arachide, légumes et épices',
    price: 1800,
    currency: 'XOF',
    category: 'plat',
    region: 'Afrique de l\'Ouest',
    country: 'Mali',
    preparationTime: 60,
    difficulty: 'moyen',
    ingredients: ['Bœuf', 'Pâte d\'arachide', 'Tomates', 'Oignons', 'Patate douce', 'Gombo'],
    allergens: ['Arachides'],
    nutritionalInfo: { calories: 580, protein: 32, carbs: 35, fat: 35 },
    image: '/images/dishes/mafe.jpg',
    popularity: 82,
    availability: true,
    seasonality: ['toute_annee'],
    culturalSignificance: 'Plat traditionnel des griots'
  },
  {
    id: 'attieke_poisson',
    name: 'Attiéké Poisson',
    nameLocal: 'Attiéké',
    description: 'Semoule de manioc avec poisson grillé et sauce tomate pimentée',
    price: 1500,
    currency: 'XOF',
    category: 'plat',
    region: 'Afrique de l\'Ouest',
    country: 'Côte d\'Ivoire',
    preparationTime: 25,
    difficulty: 'facile',
    ingredients: ['Attiéké', 'Poisson', 'Tomates', 'Oignons', 'Piment', 'Huile de palme'],
    allergens: ['Poisson'],
    nutritionalInfo: { calories: 380, protein: 25, carbs: 45, fat: 12 },
    image: '/images/dishes/attieke.jpg',
    popularity: 75,
    availability: true,
    seasonality: ['toute_annee'],
    culturalSignificance: 'Plat quotidien des familles ivoiriennes'
  },
  {
    id: 'jollof_rice',
    name: 'Riz Jollof',
    nameLocal: 'Jollof Rice',
    description: 'Riz parfumé aux tomates, épices et légumes - fierté ouest-africaine',
    price: 1200,
    currency: 'XOF',
    category: 'plat',
    region: 'Afrique de l\'Ouest',
    country: 'Nigeria',
    preparationTime: 30,
    difficulty: 'facile',
    ingredients: ['Riz', 'Tomates', 'Poivrons', 'Oignons', 'Épices', 'Bouillon'],
    allergens: [],
    nutritionalInfo: { calories: 320, protein: 8, carbs: 58, fat: 8 },
    image: '/images/dishes/jollof.jpg',
    popularity: 90,
    availability: true,
    seasonality: ['toute_annee'],
    culturalSignificance: 'Symbole d\'unité ouest-africaine'
  },
  {
    id: 'bissap',
    name: 'Bissap',
    nameLocal: 'Bissap',
    description: 'Boisson rafraîchissante à l\'hibiscus, menthe et gingembre',
    price: 500,
    currency: 'XOF',
    category: 'boisson',
    region: 'Afrique de l\'Ouest',
    country: 'Sénégal',
    preparationTime: 10,
    difficulty: 'facile',
    ingredients: ['Fleurs d\'hibiscus', 'Menthe', 'Gingembre', 'Sucre', 'Eau'],
    allergens: [],
    nutritionalInfo: { calories: 45, protein: 0, carbs: 12, fat: 0 },
    image: '/images/dishes/bissap.jpg',
    popularity: 85,
    availability: true,
    seasonality: ['toute_annee'],
    culturalSignificance: 'Boisson d\'hospitalité traditionnelle'
  },
  {
    id: 'thiakry',
    name: 'Thiakry',
    nameLocal: 'Thiakry',
    description: 'Dessert lacté au mil, vanille et raisins secs',
    price: 800,
    currency: 'XOF',
    category: 'dessert',
    region: 'Afrique de l\'Ouest',
    country: 'Sénégal',
    preparationTime: 20,
    difficulty: 'facile',
    ingredients: ['Mil', 'Lait', 'Sucre', 'Vanille', 'Raisins secs', 'Noix de coco'],
    allergens: ['Lait', 'Fruits à coque'],
    nutritionalInfo: { calories: 280, protein: 8, carbs: 45, fat: 8 },
    image: '/images/dishes/thiakry.jpg',
    popularity: 70,
    availability: true,
    seasonality: ['toute_annee'],
    culturalSignificance: 'Dessert des fêtes religieuses'
  }
]

// Composant principal du système de restauration
export const AfricanRestaurantSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pos')
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [currentOrder, setCurrentOrder] = useState<Partial<KitchenOrder>>({
    items: [],
    tableNumber: 1,
    status: 'pending',
    notes: '',
    timestamp: new Date()
  })
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [metrics, setMetrics] = useState<RestaurantMetrics>({
    dailyRevenue: 125000,
    ordersCount: 47,
    averageOrderValue: 2660,
    popularDishes: [],
    kitchenEfficiency: 87,
    customerSatisfaction: 4.6,
    wastePercentage: 8,
    profitMargin: 32
  })

  // Simulation temps réel
  useEffect(() => {
    const interval = setInterval(() => {
      // Mettre à jour les commandes en cours
      setOrders(prev => prev.map(order => {
        if (order.status === 'preparing' && Math.random() > 0.7) {
          return { ...order, status: 'cooking' }
        }
        if (order.status === 'cooking' && Math.random() > 0.8) {
          return { ...order, status: 'ready' }
        }
        return order
      }))

      // Mettre à jour les métriques
      setMetrics(prev => ({
        ...prev,
        dailyRevenue: prev.dailyRevenue + Math.floor(Math.random() * 1000),
        ordersCount: prev.ordersCount + (Math.random() > 0.9 ? 1 : 0),
        kitchenEfficiency: Math.min(100, prev.kitchenEfficiency + (Math.random() - 0.5) * 2)
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Ajouter un plat à la commande
  const addDishToOrder = useCallback((dish: AfricanDish) => {
    setCurrentOrder(prev => ({
      ...prev,
      items: [
        ...(prev.items || []),
        {
          dish,
          quantity: 1,
          modifications: [],
          priority: 'normal'
        }
      ]
    }))
  }, [])

  // Valider la commande
  const submitOrder = useCallback(() => {
    if (!currentOrder.items?.length) return

    const newOrder: KitchenOrder = {
      id: `order-${Date.now()}`,
      tableNumber: currentOrder.tableNumber || 1,
      items: currentOrder.items,
      status: 'pending',
      estimatedTime: currentOrder.items.reduce((total, item) => 
        total + (item.dish.preparationTime * item.quantity), 0),
      assignedChef: 'Chef Amadou',
      notes: currentOrder.notes || '',
      timestamp: new Date()
    }

    setOrders(prev => [newOrder, ...prev])
    setCurrentOrder({
      items: [],
      tableNumber: (currentOrder.tableNumber || 1) + 1,
      status: 'pending',
      notes: '',
      timestamp: new Date()
    })
  }, [currentOrder])

  // Calculer le total de la commande
  const orderTotal = currentOrder.items?.reduce((total, item) => 
    total + (item.dish.price * item.quantity), 0) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* En-tête */}
      <header className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ChefHat className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">🍽️ Restaurant Africain</h1>
                <p className="text-amber-100">Système POS Authentique</p>
              </div>
            </div>
            
            {/* Métriques temps réel */}
            <div className="flex space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.dailyRevenue.toLocaleString()}</div>
                <div className="text-xs text-amber-100">XOF Aujourd'hui</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.ordersCount}</div>
                <div className="text-xs text-amber-100">Commandes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.kitchenEfficiency}%</div>
                <div className="text-xs text-amber-100">Efficacité</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-amber-200 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-amber-100">
              <TabsTrigger value="pos" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                <Utensils className="w-4 h-4 mr-2" />
                Point de Vente
              </TabsTrigger>
              <TabsTrigger value="kitchen" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                <ChefHat className="w-4 h-4 mr-2" />
                Cuisine
              </TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                <Package className="w-4 h-4 mr-2" />
                Inventaire
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                Analyses
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </nav>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Point de Vente */}
          <TabsContent value="pos" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Menu des plats */}
              <div className="lg:col-span-2">
                <Card className="border-2 border-amber-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-amber-800">
                      <Globe className="w-5 h-5 mr-2" />
                      Menu Africain Authentique
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {AFRICAN_DISHES.map(dish => (
                        <motion.div
                          key={dish.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card 
                            className="cursor-pointer border border-amber-200 hover:border-amber-400 transition-colors"
                            onClick={() => addDishToOrder(dish)}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-amber-800">{dish.name}</h3>
                                  <p className="text-sm text-amber-600 italic">{dish.nameLocal}</p>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-amber-700">
                                    {dish.price.toLocaleString()} {dish.currency}
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {dish.country}
                                  </Badge>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-3">{dish.description}</p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-500">{dish.preparationTime}min</span>
                                </div>
                                
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="text-sm text-gray-500">{dish.popularity}%</span>
                                </div>
                              </div>
                              
                              {dish.allergens.length > 0 && (
                                <div className="mt-2">
                                  <div className="flex flex-wrap gap-1">
                                    {dish.allergens.map(allergen => (
                                      <Badge key={allergen} variant="destructive" className="text-xs">
                                        {allergen}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Commande en cours */}
              <div>
                <Card className="border-2 border-green-200 sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-green-800">
                      <span className="flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Table {currentOrder.tableNumber}
                      </span>
                      <Badge variant="default" className="bg-green-600">
                        {currentOrder.items?.length || 0} plats
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Articles de la commande */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {currentOrder.items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <div className="flex-1">
                            <div className="font-medium text-green-800">{item.dish.name}</div>
                            <div className="text-sm text-green-600">Qté: {item.quantity}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-700">
                              {(item.dish.price * item.quantity).toLocaleString()} XOF
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total */}
                    <div className="border-t border-green-200 pt-4">
                      <div className="flex justify-between items-center text-lg font-bold text-green-800">
                        <span>Total:</span>
                        <span>{orderTotal.toLocaleString()} XOF</span>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label htmlFor="order-notes" className="text-green-700">Notes spéciales</Label>
                      <Input
                        id="order-notes"
                        placeholder="Instructions particulières..."
                        value={currentOrder.notes}
                        onChange={(e) => setCurrentOrder(prev => ({ ...prev, notes: e.target.value }))}
                        className="border-green-300 focus:border-green-500"
                      />
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button 
                        onClick={submitOrder}
                        disabled={!currentOrder.items?.length}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Valider la Commande
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={() => setCurrentOrder(prev => ({ ...prev, items: [] }))}
                        className="w-full border-green-300 text-green-700 hover:bg-green-50"
                      >
                        Vider la Commande
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Cuisine */}
          <TabsContent value="kitchen" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Commandes en attente */}
              <Card className="border-2 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-800">
                    <Timer className="w-5 h-5 mr-2" />
                    En Attente ({orders.filter(o => o.status === 'pending').length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {orders.filter(o => o.status === 'pending').map(order => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-orange-50 rounded-lg border border-orange-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="secondary">Table {order.tableNumber}</Badge>
                        <span className="text-sm text-orange-600">
                          {order.estimatedTime}min
                        </span>
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            {item.quantity}x {item.dish.name}
                          </div>
                        ))}
                      </div>
                      {order.notes && (
                        <div className="text-xs text-orange-600 mt-2 italic">
                          Note: {order.notes}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* En préparation */}
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <ChefHat className="w-5 h-5 mr-2" />
                    En Préparation ({orders.filter(o => ['preparing', 'cooking'].includes(o.status)).length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {orders.filter(o => ['preparing', 'cooking'].includes(o.status)).map(order => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant={order.status === 'cooking' ? 'default' : 'secondary'}>
                          Table {order.tableNumber}
                        </Badge>
                        <div className="flex items-center space-x-2">
                          <Thermometer className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-blue-600 capitalize">
                            {order.status === 'preparing' ? 'Préparation' : 'Cuisson'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            {item.quantity}x {item.dish.name}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2">
                        <Progress 
                          value={order.status === 'preparing' ? 30 : 70} 
                          className="h-2"
                        />
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>

              {/* Prêt à servir */}
              <Card className="border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800">
                    <Bell className="w-5 h-5 mr-2" />
                    Prêt à Servir ({orders.filter(o => o.status === 'ready').length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {orders.filter(o => o.status === 'ready').map(order => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="default" className="bg-green-600">
                          Table {order.tableNumber}
                        </Badge>
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          <Bell className="w-4 h-4 text-green-500" />
                        </motion.div>
                      </div>
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm font-medium">
                            {item.quantity}x {item.dish.name}
                          </div>
                        ))}
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full mt-2 bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          setOrders(prev => prev.map(o => 
                            o.id === order.id ? { ...o, status: 'served' } : o
                          ))
                        }}
                      >
                        Marquer comme Servi
                      </Button>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Statistiques cuisine */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-amber-600">{metrics.kitchenEfficiency}%</div>
                  <div className="text-sm text-gray-600">Efficacité Cuisine</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {orders.filter(o => o.status !== 'served').length}
                  </div>
                  <div className="text-sm text-gray-600">Commandes Actives</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(orders.reduce((acc, o) => acc + o.estimatedTime, 0) / orders.length || 0)}min
                  </div>
                  <div className="text-sm text-gray-600">Temps Moyen</div>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{metrics.customerSatisfaction}/5</div>
                  <div className="text-sm text-gray-600">Satisfaction Client</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inventaire */}
          <TabsContent value="inventory" className="space-y-6">
            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-800">
                  <Package className="w-5 h-5 mr-2" />
                  Gestion d'Inventaire Prédictive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-purple-800 mb-2">
                    Inventaire Intelligent en Développement
                  </h3>
                  <p className="text-purple-600 mb-4">
                    Système prédictif basé sur l'IA pour optimiser les stocks d'ingrédients africains
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="text-center">
                      <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <div className="font-medium">Prédiction IA</div>
                      <div className="text-sm text-gray-600">Anticipation des besoins</div>
                    </div>
                    <div className="text-center">
                      <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                      <div className="font-medium">Alertes Automatiques</div>
                      <div className="text-sm text-gray-600">Stock minimum atteint</div>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <div className="font-medium">Optimisation Coûts</div>
                      <div className="text-sm text-gray-600">Réduction du gaspillage</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analyses */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="text-center border-2 border-green-200">
                <CardContent className="p-4">
                  <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.dailyRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">XOF Aujourd'hui</div>
                </CardContent>
              </Card>
              
              <Card className="text-center border-2 border-blue-200">
                <CardContent className="p-4">
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{metrics.ordersCount}</div>
                  <div className="text-sm text-gray-600">Commandes</div>
                </CardContent>
              </Card>
              
              <Card className="text-center border-2 border-purple-200">
                <CardContent className="p-4">
                  <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{metrics.customerSatisfaction}/5</div>
                  <div className="text-sm text-gray-600">Satisfaction</div>
                </CardContent>
              </Card>
              
              <Card className="text-center border-2 border-orange-200">
                <CardContent className="p-4">
                  <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">{metrics.profitMargin}%</div>
                  <div className="text-sm text-gray-600">Marge Bénéficiaire</div>
                </CardContent>
              </Card>
            </div>

            {/* Plats populaires */}
            <Card className="border-2 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center text-amber-800">
                  <Award className="w-5 h-5 mr-2" />
                  Top Plats Africains
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {AFRICAN_DISHES
                    .sort((a, b) => b.popularity - a.popularity)
                    .slice(0, 5)
                    .map((dish, index) => (
                      <div key={dish.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="default" className="bg-amber-600">
                            #{index + 1}
                          </Badge>
                          <div>
                            <div className="font-medium text-amber-800">{dish.name}</div>
                            <div className="text-sm text-amber-600">{dish.country}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-amber-700">{dish.popularity}%</div>
                          <div className="text-sm text-amber-600">Popularité</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default AfricanRestaurantSystem

