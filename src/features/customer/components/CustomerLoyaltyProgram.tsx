import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Gift, 
  Star, 
  Users, 
  Crown, 
  Percent,
  TrendingUp,
  Award,
  Smartphone,
  QrCode,
  Mail
} from 'lucide-react';

export function CustomerLoyaltyProgram() {
  const [programSettings, setProgramSettings] = useState({
    pointsPerEuro: 1,
    welcomeBonus: 50,
    birthdayBonus: 100,
    referralBonus: 200,
    autoEnrollment: true,
    smsNotifications: true,
    emailNotifications: true
  });

  const loyaltyTiers = [
    {
      name: 'Bronze',
      minPoints: 0,
      benefits: ['1 point par euro', 'Offres exclusives'],
      members: 1247,
      color: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    {
      name: 'Argent',
      minPoints: 500,
      benefits: ['1.5 points par euro', 'Livraison gratuite', 'Support prioritaire'],
      members: 423,
      color: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    {
      name: 'Or',
      minPoints: 1500,
      benefits: ['2 points par euro', 'Accès VIP', 'Cadeaux anniversaire'],
      members: 156,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    },
    {
      name: 'Platine',
      minPoints: 3000,
      benefits: ['3 points par euro', 'Service concierge', 'Événements privés'],
      members: 34,
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    }
  ];

  const recentActivities = [
    {
      customer: 'Marie Dubois',
      action: 'Échange de points',
      points: -150,
      reward: 'Dessert gratuit',
      date: '5 min'
    },
    {
      customer: 'Pierre Martin',
      action: 'Commande',
      points: +25,
      reward: null,
      date: '12 min'
    },
    {
      customer: 'Sophie Laurent',
      action: 'Parrainage',
      points: +200,
      reward: 'Bonus parrainage',
      date: '1h'
    },
    {
      customer: 'Jean Moreau',
      action: 'Anniversaire',
      points: +100,
      reward: 'Bonus anniversaire',
      date: '2h'
    }
  ];

  const rewards = [
    { name: 'Café gratuit', points: 50, category: 'Boisson', active: true },
    { name: 'Dessert gratuit', points: 150, category: 'Dessert', active: true },
    { name: 'Entrée gratuite', points: 200, category: 'Entrée', active: true },
    { name: 'Plat principal -50%', points: 300, category: 'Plat', active: true },
    { name: 'Menu complet gratuit', points: 800, category: 'Menu', active: false },
    { name: 'Bouteille de vin', points: 500, category: 'Boisson', active: true }
  ];

  return (
    <div className="space-y-6">
      {/* Métriques du programme */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">1,860</p>
            <p className="text-sm text-muted-foreground">Membres actifs</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">+23%</p>
            <p className="text-sm text-muted-foreground">Croissance mensuelle</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <Gift className="w-8 h-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold">342</p>
            <p className="text-sm text-muted-foreground">Récompenses utilisées</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <Percent className="w-8 h-8 text-info mx-auto mb-2" />
            <p className="text-2xl font-bold">68%</p>
            <p className="text-sm text-muted-foreground">Taux de fidélisation</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration du programme */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Configuration du Programme
            </CardTitle>
            <CardDescription>
              Paramètres de votre système de fidélité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Points par euro dépensé</label>
              <Input 
                type="number"
                value={programSettings.pointsPerEuro}
                onChange={(e) => setProgramSettings({...programSettings, pointsPerEuro: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Bonus de bienvenue</label>
              <Input 
                type="number"
                value={programSettings.welcomeBonus}
                onChange={(e) => setProgramSettings({...programSettings, welcomeBonus: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Bonus anniversaire</label>
              <Input 
                type="number"
                value={programSettings.birthdayBonus}
                onChange={(e) => setProgramSettings({...programSettings, birthdayBonus: parseInt(e.target.value)})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Bonus parrainage</label>
              <Input 
                type="number"
                value={programSettings.referralBonus}
                onChange={(e) => setProgramSettings({...programSettings, referralBonus: parseInt(e.target.value)})}
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Inscription automatique</label>
                <Switch 
                  checked={programSettings.autoEnrollment}
                  onCheckedChange={(checked) => setProgramSettings({...programSettings, autoEnrollment: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Notifications SMS</label>
                <Switch 
                  checked={programSettings.smsNotifications}
                  onCheckedChange={(checked) => setProgramSettings({...programSettings, smsNotifications: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Notifications Email</label>
                <Switch 
                  checked={programSettings.emailNotifications}
                  onCheckedChange={(checked) => setProgramSettings({...programSettings, emailNotifications: checked})}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Niveaux de fidélité */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Niveaux de Fidélité
            </CardTitle>
            <CardDescription>
              Structure des niveaux et avantages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loyaltyTiers.map((tier, index) => (
                <div key={index} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className={tier.color}>{tier.name}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {tier.minPoints}+ points
                      </span>
                    </div>
                    <span className="text-sm font-medium">{tier.members} membres</span>
                  </div>
                  
                  <ul className="text-sm space-y-1">
                    {tier.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Récompenses disponibles */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Catalogue de Récompenses
          </CardTitle>
          <CardDescription>
            Gérez les récompenses disponibles à l'échange
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{reward.name}</h4>
                  <Switch checked={reward.active} onCheckedChange={() => {}} />
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{reward.category}</Badge>
                  <span className="text-sm font-bold text-primary">{reward.points} pts</span>
                </div>
              </div>
            ))}
          </div>
          
          <Button className="w-full mt-4" variant="outline">
            <Gift className="w-4 h-4 mr-2" />
            Ajouter une récompense
          </Button>
        </CardContent>
      </Card>

      {/* Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>
              Dernières actions des membres du programme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium">{activity.customer}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                    {activity.reward && (
                      <p className="text-xs text-success">{activity.reward}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${activity.points > 0 ? 'text-success' : 'text-warning'}`}>
                      {activity.points > 0 ? '+' : ''}{activity.points} pts
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Outils marketing */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Outils Marketing</CardTitle>
            <CardDescription>
              Promouvoir votre programme de fidélité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <QrCode className="w-4 h-4 mr-2" />
              Générer QR Code d'inscription
            </Button>
            
            <Button className="w-full justify-start" variant="outline">
              <Smartphone className="w-4 h-4 mr-2" />
              Créer campagne SMS
            </Button>
            
            <Button className="w-full justify-start" variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Lancer campagne email
            </Button>
            
            <Button className="w-full justify-start" variant="outline">
              <Award className="w-4 h-4 mr-2" />
              Créer promotion spéciale
            </Button>

            <div className="pt-4 border-t border-border">
              <h4 className="font-medium mb-2">Progression actuelle</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Objectif mensuel</span>
                  <span>1,647 / 2,000</span>
                </div>
                <Progress value={82} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}