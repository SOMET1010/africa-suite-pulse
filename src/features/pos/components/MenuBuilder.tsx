import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useMenus, useMenu, useCreateMenu, useCreateMenuSection } from '../hooks/useMenuBuilder';
import { usePOSProducts } from '../hooks/usePOSData';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Edit, Eye, Trash2, GripVertical, Image, Palette } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface MenuBuilderProps {
  outletId: string;
}

export function MenuBuilder({ outletId }: MenuBuilderProps) {
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);

  const { data: menus = [] } = useMenus(outletId);
  const { data: selectedMenu } = useMenu(selectedMenuId);
  const { data: products = [] } = usePOSProducts(outletId);
  
  const createMenu = useCreateMenu();
  const createSection = useCreateMenuSection();

  const [newMenu, setNewMenu] = useState({
    code: '',
    name: '',
    description: '',
    layout_config: {
      columns: 3,
      showImages: true,
      showDescriptions: true,
      theme: 'modern',
      colors: {
        primary: '#3b82f6',
        secondary: '#e5e7eb',
        accent: '#f59e0b'
      }
    }
  });

  const [newSection, setNewSection] = useState({
    name: '',
    description: '',
    section_config: {
      color: '#3b82f6',
      icon: 'utensils'
    }
  });

  const handleCreateMenu = () => {
    createMenu.mutate({
      ...newMenu,
      outlet_id: outletId,
      is_active: true,
      time_slots: []
    }, {
      onSuccess: () => {
        setIsCreateMenuOpen(false);
        setNewMenu({
          code: '',
          name: '',
          description: '',
          layout_config: {
            columns: 3,
            showImages: true,
            showDescriptions: true,
            theme: 'modern',
            colors: {
              primary: '#3b82f6',
              secondary: '#e5e7eb',
              accent: '#f59e0b'
            }
          }
        });
      }
    });
  };

  const handleCreateSection = () => {
    if (!selectedMenuId) return;

    createSection.mutate({
      menu_id: selectedMenuId,
      ...newSection,
      display_order: selectedMenu?.sections?.length || 0,
      is_visible: true
    }, {
      onSuccess: () => {
        setIsCreateSectionOpen(false);
        setNewSection({
          name: '',
          description: '',
          section_config: {
            color: '#3b82f6',
            icon: 'utensils'
          }
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Constructeur de Menus</h2>
          <p className="text-muted-foreground">
            Créez et personnalisez vos menus avec une interface drag & drop
          </p>
        </div>
        <Dialog open={isCreateMenuOpen} onOpenChange={setIsCreateMenuOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Menu
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un Nouveau Menu</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={newMenu.code}
                  onChange={(e) => setNewMenu(prev => ({ ...prev, code: e.target.value }))}
                  placeholder="Ex: LUNCH, DINNER, DRINKS"
                />
              </div>
              <div>
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={newMenu.name}
                  onChange={(e) => setNewMenu(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Menu Déjeuner"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newMenu.description}
                  onChange={(e) => setNewMenu(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du menu..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="columns">Colonnes</Label>
                  <Input
                    id="columns"
                    type="number"
                    min="1"
                    max="6"
                    value={newMenu.layout_config.columns}
                    onChange={(e) => setNewMenu(prev => ({
                      ...prev,
                      layout_config: {
                        ...prev.layout_config,
                        columns: parseInt(e.target.value) || 3
                      }
                    }))}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showImages"
                      checked={newMenu.layout_config.showImages}
                      onCheckedChange={(checked) => setNewMenu(prev => ({
                        ...prev,
                        layout_config: { ...prev.layout_config, showImages: checked }
                      }))}
                    />
                    <Label htmlFor="showImages">Afficher les images</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showDescriptions"
                      checked={newMenu.layout_config.showDescriptions}
                      onCheckedChange={(checked) => setNewMenu(prev => ({
                        ...prev,
                        layout_config: { ...prev.layout_config, showDescriptions: checked }
                      }))}
                    />
                    <Label htmlFor="showDescriptions">Afficher les descriptions</Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateMenuOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateMenu} disabled={createMenu.isPending}>
                  {createMenu.isPending ? 'Création...' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Menu List */}
        <div className="col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Menus Existants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {menus.map((menu) => (
                <Card
                  key={menu.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedMenuId === menu.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedMenuId(menu.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{menu.name}</div>
                        <div className="text-sm text-muted-foreground">{menu.code}</div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge variant={menu.is_active ? 'default' : 'secondary'}>
                          {menu.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Menu Editor */}
        <div className="col-span-8">
          {selectedMenu ? (
            <div className="space-y-6">
              {/* Menu Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedMenu.name}</CardTitle>
                      <p className="text-muted-foreground">{selectedMenu.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Aperçu
                      </Button>
                      <Button size="sm" variant="outline">
                        <Palette className="h-4 w-4 mr-2" />
                        Thème
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Menu Sections */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Sections du Menu</CardTitle>
                    <Dialog open={isCreateSectionOpen} onOpenChange={setIsCreateSectionOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter Section
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Nouvelle Section</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="sectionName">Nom de la section</Label>
                            <Input
                              id="sectionName"
                              value={newSection.name}
                              onChange={(e) => setNewSection(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Ex: Entrées, Plats, Desserts"
                            />
                          </div>
                          <div>
                            <Label htmlFor="sectionDescription">Description</Label>
                            <Textarea
                              id="sectionDescription"
                              value={newSection.description}
                              onChange={(e) => setNewSection(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Description de la section..."
                            />
                          </div>
                          <div>
                            <Label htmlFor="sectionColor">Couleur</Label>
                            <Input
                              id="sectionColor"
                              type="color"
                              value={newSection.section_config.color}
                              onChange={(e) => setNewSection(prev => ({
                                ...prev,
                                section_config: { ...prev.section_config, color: e.target.value }
                              }))}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsCreateSectionOpen(false)}>
                              Annuler
                            </Button>
                            <Button onClick={handleCreateSection} disabled={createSection.isPending}>
                              {createSection.isPending ? 'Création...' : 'Créer'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <DragDropContext onDragEnd={() => {}}>
                    <Droppable droppableId="sections">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                          {selectedMenu && Array.isArray(selectedMenu.sections) ? 
                            selectedMenu.sections.map((section: any, index: number) => (
                              <Draggable key={section.id} draggableId={section.id} index={index}>
                                {(provided) => (
                                  <Card
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className="border-l-4"
                                    style={{
                                    borderLeftColor: section.section_config?.color || '#3b82f6',
                                    ...provided.draggableProps.style
                                  }}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div {...provided.dragHandleProps}>
                                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                          <div className="font-medium">{section.name}</div>
                                          <div className="text-sm text-muted-foreground">
                                            {section.items?.length || 0} articles
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          checked={section.is_visible}
                                          onCheckedChange={() => {}}
                                        />
                                        <Button size="sm" variant="ghost">
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    {/* Section Items */}
                                    {section.items && section.items.length > 0 && (
                                      <div className="mt-4 grid grid-cols-2 gap-2">
                                        {section.items.map((item: any) => (
                                          <div key={item.id} className="flex items-center space-x-2 p-2 bg-muted rounded">
                                            <Image className="h-4 w-4" />
                                            <span className="text-sm">{item.product?.name}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                                )}
                              </Draggable>
                            )) : (
                              <div className="text-center py-8 text-muted-foreground">
                                {selectedMenu ? 'Aucune section trouvée' : 'Erreur de chargement'}
                              </div>
                            )
                          }
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  Sélectionnez un menu pour commencer l'édition
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}