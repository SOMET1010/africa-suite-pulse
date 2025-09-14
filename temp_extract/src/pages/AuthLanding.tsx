import React from "react";
import { Link } from "react-router-dom";
import { Crown, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthLanding() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-pearl">
      <div className="w-full max-w-md">
        <Card className="shadow-luxury border-0">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-accent to-brand-copper rounded-xl flex items-center justify-center shadow-luxury mx-auto mb-6">
              <Crown className="w-9 h-9 text-charcoal" />
            </div>
            
            <h1 className="text-2xl font-luxury font-bold text-charcoal mb-2">
              AfricaSuite PMS
            </h1>
            <p className="text-muted-foreground mb-8">
              Système de gestion hôtelière professionnel
            </p>
            
            <div className="space-y-3">
              <Link to="/auth" className="w-full">
                <Button className="w-full h-12 text-base font-medium">
                  <LogIn className="w-5 h-5 mr-2" />
                  Se connecter
                </Button>
              </Link>
              
              <Link to="/auth" className="w-full">
                <Button variant="outline" className="w-full h-12 text-base font-medium">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Créer un compte
                </Button>
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground mt-6">
              Version 2.0 - Plateforme sécurisée
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}