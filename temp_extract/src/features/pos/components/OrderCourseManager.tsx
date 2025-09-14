import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Clock, 
  ChefHat, 
  Utensils, 
  Coffee, 
  ArrowRight,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CartItem } from "../types";

interface Course {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  items: CartItem[];
  status: 'pending' | 'sent' | 'preparing' | 'ready' | 'served';
  sentAt?: Date;
  estimatedTime?: number;
}

interface OrderCourseManagerProps {
  cartItems: CartItem[];
  onUpdateItemCourse: (itemId: string, courseId: string) => void;
  onSendCourse: (courseId: string) => void;
  onServeCourse: (courseId: string) => void;
}

export function OrderCourseManager({ 
  cartItems, 
  onUpdateItemCourse, 
  onSendCourse,
  onServeCourse 
}: OrderCourseManagerProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  const courseTypes = [
    { id: 'appetizer', name: 'Entrées', icon: Utensils, color: 'blue' },
    { id: 'main', name: 'Plats', icon: ChefHat, color: 'green' },
    { id: 'dessert', name: 'Desserts', icon: Coffee, color: 'purple' },
    { id: 'beverage', name: 'Boissons', icon: Coffee, color: 'orange' }
  ];

  // Group items by course
  const courses: Course[] = courseTypes.map(type => {
    const items = cartItems.filter(item => {
      // Auto-categorize based on product name/category
      // In real app, this would be based on product category
      const productName = item.product_name.toLowerCase();
      
      if (type.id === 'appetizer') {
        return productName.includes('entrée') || productName.includes('salade') || productName.includes('soupe');
      }
      if (type.id === 'main') {
        return productName.includes('plat') || productName.includes('viande') || productName.includes('poisson');
      }
      if (type.id === 'dessert') {
        return productName.includes('dessert') || productName.includes('gâteau') || productName.includes('glace');
      }
      if (type.id === 'beverage') {
        return productName.includes('boisson') || productName.includes('jus') || productName.includes('café');
      }
      
      // Default to main course
      return type.id === 'main';
    });

    return {
      id: type.id,
      name: type.name,
      icon: type.icon,
      color: type.color,
      items,
      status: 'pending' as const,
      estimatedTime: items.reduce((acc, item) => acc + (item.product.preparation_time || 15), 0)
    };
  }).filter(course => course.items.length > 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'sent': return <Play className="h-4 w-4" />;
      case 'preparing': return <ChefHat className="h-4 w-4" />;
      case 'ready': return <CheckCircle2 className="h-4 w-4" />;
      case 'served': return <CheckCircle2 className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-500';
      case 'sent': return 'text-blue-500';
      case 'preparing': return 'text-yellow-500';
      case 'ready': return 'text-green-500';
      case 'served': return 'text-green-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'sent': return 'Envoyé';
      case 'preparing': return 'En préparation';
      case 'ready': return 'Prêt';
      case 'served': return 'Servi';
      default: return status;
    }
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ChefHat className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Aucun article dans la commande</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gestion des services</h3>
        <Button variant="outline" size="sm" onClick={() => setIsManagerOpen(true)}>
          Gérer les services
        </Button>
      </div>

      {/* Course Timeline */}
      <div className="space-y-3">
        {courses.map((course, index) => {
          const Icon = course.icon;
          
          return (
            <Card key={course.id} className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      `bg-${course.color}-100 text-${course.color}-600`
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{course.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{course.items.length} article{course.items.length !== 1 ? 's' : ''}</span>
                        {course.estimatedTime && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {course.estimatedTime} min
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={cn("flex items-center gap-2", getStatusColor(course.status))}>
                      {getStatusIcon(course.status)}
                      <span className="text-sm font-medium">{getStatusText(course.status)}</span>
                    </div>

                    {course.status === 'pending' && (
                      <Button size="sm" onClick={() => onSendCourse(course.id)}>
                        Envoyer
                      </Button>
                    )}

                    {course.status === 'ready' && (
                      <Button size="sm" variant="default" onClick={() => onServeCourse(course.id)}>
                        Servir
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-2">
                  {course.items.map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{item.product_name}</span>
                        <Badge variant="outline" className="text-xs">
                          x{item.quantity}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.total_price.toLocaleString()} FCFA
                      </span>
                    </div>
                  ))}
                </div>

                {index < courses.length - 1 && (
                  <div className="flex items-center justify-center mt-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="h-px bg-border flex-1" />
                      <ArrowRight className="h-4 w-4" />
                      <div className="h-px bg-border flex-1" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Course Management Dialog */}
      <Dialog open={isManagerOpen} onOpenChange={setIsManagerOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestionnaire des services</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Available Items */}
            <div className="space-y-4">
              <h4 className="font-medium">Articles de la commande</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {cartItems.map((item) => (
                  <Card key={item.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
                      </div>
                      <div className="flex gap-1">
                        {courseTypes.map((type) => (
                          <Button
                            key={type.id}
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateItemCourse(item.id, type.id)}
                            className="text-xs"
                          >
                            {type.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Course Preview */}
            <div className="space-y-4">
              <h4 className="font-medium">Aperçu des services</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {courses.map((course) => {
                  const Icon = course.icon;
                  return (
                    <Card key={course.id} className="p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{course.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {course.items.length} articles
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {course.items.map(item => item.product_name).join(', ')}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}