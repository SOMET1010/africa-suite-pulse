import React from "react";
import { User, Settings, LogOut, Shield, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UserMenuProps {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const navigate = useNavigate();
  // Mock user data - in real app, this would come from auth context
  const currentUser = user || {
    name: "Administrateur",
    email: "admin@africasuite.com",
    role: "Directeur",
    avatar: undefined
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'directeur':
      case 'manager':
        return 'default';
      case 'réceptionniste':
        return 'secondary';
      case 'maintenance':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 h-auto p-2 hover:bg-soft-primary transition-elegant"
        >
          <Avatar className="w-8 h-8 border border-accent-gold/30">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback className="bg-brand-accent text-charcoal font-semibold text-xs">
              {getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start min-w-0 hidden sm:block">
            <span className="text-sm font-medium text-charcoal truncate max-w-24">
              {currentUser.name}
            </span>
            <Badge 
              variant={getRoleBadgeVariant(currentUser.role)} 
              className="text-xs h-4 px-1.5"
            >
              {currentUser.role}
            </Badge>
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-64 glass-card border-accent-gold/20 shadow-luxury"
      >
        <DropdownMenuLabel className="pb-2">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-accent-gold/30">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback className="bg-brand-accent text-charcoal font-semibold">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-charcoal">{currentUser.name}</span>
              <span className="text-sm text-muted-foreground truncate">
                {currentUser.email}
              </span>
              <Badge 
                variant={getRoleBadgeVariant(currentUser.role)} 
                className="text-xs h-5 mt-1 self-start"
              >
                <Shield className="w-3 h-3 mr-1" />
                {currentUser.role}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-accent-gold/20" />
        
        <DropdownMenuItem 
          onClick={() => navigate('/settings/users')}
          className="hover:bg-soft-primary transition-elegant"
        >
          <UserCircle className="w-4 h-4 mr-2" />
          Mon profil
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => navigate('/settings')}
          className="hover:bg-soft-primary transition-elegant"
        >
          <Settings className="w-4 h-4 mr-2" />
          Préférences
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-accent-gold/20" />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="text-danger hover:bg-soft-danger hover:text-danger focus:bg-soft-danger focus:text-danger transition-elegant"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}