import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Smartphone, 
  Mail, 
  MessageSquare,
  Send,
  Users,
  Clock,
  Target,
  TrendingUp,
  Gift,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export function CustomerNotifications() {
  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: true,
    smsEnabled: true,
    emailEnabled: true,
    orderUpdates: true,
    promotions: true,
    loyalty: true,
    events: false
  });

  const [newCampaign, setNewCampaign] = useState({
    title: '',
    message: '',
    type: 'promotion',
    channel: 'push',
    audience: 'all',
    scheduledTime: ''
  });

  const campaigns = [
    {
      id: 1,
      title: 'Offre Spéciale Weekend',
      message: '🎉 20% de réduction sur tous nos plats ce weekend !',
      type: 'promotion',
      channel: 'push',
      status: 'sent',
      sent: 1247,
      opened: 856,
      clicked: 234,
      date: '2024-01-15'
    },
    {
      id: 2,
      title: 'Nouveau Menu Printemps',
      message: '🌸 Découvrez notre nouvelle carte de saison avec des saveurs fraîches !',
      type: 'product',
      channel: 'email',
      status: 'scheduled',
      sent: 0,
      opened: 0,
      clicked: 0,
      date: '2024-01-20'
    },
    {
      id: 3,
      title: 'Commande Prête',
      message: 'Votre commande #12345 est prête à être récupérée !',
      type: 'order',
      channel: 'sms',
      status: 'sent',
      sent: 1,
      opened: 1,
      clicked: 0,
      date: '2024-01-14'
    }
  ];

  const notificationTypes = [
    {
      type: 'order',
      name: 'Commandes',
      description: 'Confirmations, préparation, prêt à récupérer',
      icon: CheckCircle2,
      color: 'text-success'
    },
    {
      type: 'promotion',
      name: 'Promotions',
      description: 'Offres spéciales, réductions, événements',
      icon: Gift,
      color: 'text-warning'
    },
    {
      type: 'loyalty',
      name: 'Fidélité',
      description: 'Points gagnés, récompenses disponibles, niveaux',
      icon: Target,
      color: 'text-primary'
    },
    {
      type: 'product',
      name: 'Nouveautés',
      description: 'Nouveaux plats, cartes saisonnières',
      icon: TrendingUp,
      color: 'text-info'
    }
  ];

  const metrics = [
    { label: 'Messages envoyés', value: '12,847', trend: '+8%', icon: Send },
    { label: 'Taux d\'ouverture', value: '68.5%', trend: '+2.3%', icon: Mail },
    { label: 'Taux de clic', value: '18.7%', trend: '+5.1%', icon: MessageSquare },
    { label: 'Désabonnements', value: '0.8%', trend: '-0.2%', icon: AlertCircle }
  ];

  return (
    <div className="space-y-6">
      {/* Métriques des notifications */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-sm text-success font-medium">{metric.trend}</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <metric.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nouvelle campagne */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Nouvelle Campagne
            </CardTitle>
            <CardDescription>
              Créez et programmez vos notifications clients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Titre de la campagne</label>
              <Input 
                value={newCampaign.title}
                onChange={(e) => setNewCampaign({...newCampaign, title: e.target.value})}
                placeholder="Ex: Offre spéciale du jour"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea 
                value={newCampaign.message}
                onChange={(e) => setNewCampaign({...newCampaign, message: e.target.value})}
                placeholder="Rédigez votre message..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {newCampaign.message.length}/160 caractères
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={newCampaign.type} onValueChange={(value) => setNewCampaign({...newCampaign, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="product">Nouveauté</SelectItem>
                    <SelectItem value="loyalty">Fidélité</SelectItem>
                    <SelectItem value="event">Événement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Canal</label>
                <Select value={newCampaign.channel} onValueChange={(value) => setNewCampaign({...newCampaign, channel: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="all">Tous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Audience cible</label>
              <Select value={newCampaign.audience} onValueChange={(value) => setNewCampaign({...newCampaign, audience: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les clients</SelectItem>
                  <SelectItem value="vip">Clients VIP</SelectItem>
                  <SelectItem value="new">Nouveaux clients</SelectItem>
                  <SelectItem value="inactive">Clients inactifs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Programmation</label>
              <Input 
                type="datetime-local"
                value={newCampaign.scheduledTime}
                onChange={(e) => setNewCampaign({...newCampaign, scheduledTime: e.target.value})}
              />
            </div>

            <div className="flex gap-2">
              <Button className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                Envoyer maintenant
              </Button>
              <Button variant="outline" className="flex-1">
                <Clock className="w-4 h-4 mr-2" />
                Programmer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuration des notifications */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Configuration Notifications
            </CardTitle>
            <CardDescription>
              Paramètres généraux des notifications clients
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium">Canaux de communication</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-muted-foreground" />
                    <label className="text-sm font-medium">Notifications Push</label>
                  </div>
                  <Switch 
                    checked={notificationSettings.pushEnabled}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushEnabled: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <label className="text-sm font-medium">SMS</label>
                  </div>
                  <Switch 
                    checked={notificationSettings.smsEnabled}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsEnabled: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <label className="text-sm font-medium">Email</label>
                  </div>
                  <Switch 
                    checked={notificationSettings.emailEnabled}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailEnabled: checked})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <h4 className="font-medium">Types de notifications</h4>
              {notificationTypes.map((type, index) => (
                <div key={index} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <type.icon className={`w-4 h-4 ${type.color}`} />
                      <span className="font-medium">{type.name}</span>
                    </div>
                    <Switch 
                      checked={notificationSettings[type.type as keyof typeof notificationSettings]}
                      onCheckedChange={() => {}}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historique des campagnes */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Historique des Campagnes</CardTitle>
          <CardDescription>
            Aperçu des performances de vos campagnes de notification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign, index) => (
              <div key={index} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{campaign.title}</h4>
                    <p className="text-sm text-muted-foreground">{campaign.message}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      campaign.status === 'sent' ? 'default' : 
                      campaign.status === 'scheduled' ? 'secondary' : 'outline'
                    }>
                      {campaign.status === 'sent' ? 'Envoyé' : 
                       campaign.status === 'scheduled' ? 'Programmé' : 'Brouillon'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{campaign.date}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Canal</p>
                    <div className="flex items-center gap-1 mt-1">
                      {campaign.channel === 'push' && <Smartphone className="w-3 h-3" />}
                      {campaign.channel === 'sms' && <MessageSquare className="w-3 h-3" />}
                      {campaign.channel === 'email' && <Mail className="w-3 h-3" />}
                      <span className="capitalize">{campaign.channel}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Envoyés</p>
                    <p className="font-medium mt-1">{campaign.sent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ouvertures</p>
                    <p className="font-medium mt-1">
                      {campaign.opened.toLocaleString()}
                      {campaign.sent > 0 && (
                        <span className="text-xs ml-1 text-muted-foreground">
                          ({Math.round((campaign.opened / campaign.sent) * 100)}%)
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Clics</p>
                    <p className="font-medium mt-1">
                      {campaign.clicked.toLocaleString()}
                      {campaign.opened > 0 && (
                        <span className="text-xs ml-1 text-muted-foreground">
                          ({Math.round((campaign.clicked / campaign.opened) * 100)}%)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}