import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, AlertTriangle, Loader } from "lucide-react";

interface FNEStatusBadgeProps {
  status: 'pending' | 'submitted' | 'validated' | 'rejected' | 'error';
  className?: string;
}

export const FNEStatusBadge = ({ status, className }: FNEStatusBadgeProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          label: 'En attente',
          variant: 'secondary' as const,
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
        };
      case 'submitted':
        return {
          label: 'Soumise',
          variant: 'secondary' as const,
          icon: Loader,
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
        };
      case 'validated':
        return {
          label: 'Validée',
          variant: 'default' as const,
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 hover:bg-green-200'
        };
      case 'rejected':
        return {
          label: 'Rejetée',
          variant: 'destructive' as const,
          icon: XCircle,
          className: 'bg-red-100 text-red-800 hover:bg-red-200'
        };
      case 'error':
        return {
          label: 'Erreur',
          variant: 'destructive' as const,
          icon: AlertTriangle,
          className: 'bg-red-100 text-red-800 hover:bg-red-200'
        };
      default:
        return {
          label: 'Inconnu',
          variant: 'secondary' as const,
          icon: AlertTriangle,
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className} flex items-center gap-1`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};