import React, { useState } from 'react';
import { 
  Home, ChevronLeft, Settings2, Package 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RoomsCatalogTab from './components/RoomsCatalogTab';
import RoomTypesTab from './components/RoomTypesTab';

export default function RoomsPage() {
  const [activeTab, setActiveTab] = useState('catalog');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/settings">
              <Button variant="ghost" size="sm" className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Retour
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">/</span>
              <Link to="/settings" className="text-sm text-muted-foreground hover:underline">
                Paramètres
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium">Chambres</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings2 className="h-8 w-8 text-primary" />
            Gestion des Chambres
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez le catalogue des chambres et configurez les types de chambres
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Catalogue
            </TabsTrigger>
            <TabsTrigger value="types" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Types
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Catalogue des Chambres</CardTitle>
              </CardHeader>
              <CardContent>
                <RoomsCatalogTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Types de Chambres</CardTitle>
              </CardHeader>
              <CardContent>
                <RoomTypesTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}