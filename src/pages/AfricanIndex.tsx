import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleAuthDemo from './SimpleAuthDemo';

const AfricanIndex = () => {
  const navigate = useNavigate();

  // Rediriger vers l'authentification africaine si pas connecté
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      // Afficher directement l'écran d'authentification africain
      return;
    }
  }, [navigate]);

  // Si pas authentifié, afficher l'écran d'authentification africain
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  if (!isAuthenticated) {
    return <SimpleAuthDemo />;
  }

  // Si authentifié, afficher le dashboard africain
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-wheat to-burlywood">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-terracotta mb-4">
            🌍 Bienvenue dans Africa Suite Pulse
          </h1>
          <p className="text-xl text-baobab mb-6">
            Votre ERP Hôtelier Africain Authentique
          </p>
          <div className="bg-white/90 rounded-xl p-6 border-2 border-gold shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-terracotta mb-4">
              🎨 Design Africain Authentique
            </h2>
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <h3 className="font-semibold text-baobab">🌍 Motifs Traditionnels</h3>
                <ul className="text-sm text-terracotta">
                  <li>• Bogolan (Mali)</li>
                  <li>• Kente (Ghana)</li>
                  <li>• Adinkra (Ghana)</li>
                  <li>• Mudcloth (Mali)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-baobab">🤝 Philosophies</h3>
                <ul className="text-sm text-terracotta">
                  <li>• Ubuntu (Afrique du Sud)</li>
                  <li>• Teranga (Sénégal)</li>
                  <li>• Harambee (Kenya)</li>
                  <li>• Sankofa (Ghana)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/90 rounded-xl p-6 border-2 border-gold shadow-lg">
            <h3 className="text-xl font-semibold text-terracotta mb-3">🏨 Gestion Hôtelière</h3>
            <p className="text-baobab">
              Système complet avec design africain authentique
            </p>
          </div>
          
          <div className="bg-white/90 rounded-xl p-6 border-2 border-gold shadow-lg">
            <h3 className="text-xl font-semibold text-terracotta mb-3">🤖 IA "Aya"</h3>
            <p className="text-baobab">
              Assistant culturel africain intelligent
            </p>
          </div>
          
          <div className="bg-white/90 rounded-xl p-6 border-2 border-gold shadow-lg">
            <h3 className="text-xl font-semibold text-terracotta mb-3">💳 FinTech Africain</h3>
            <p className="text-baobab">
              Mobile Money, crypto, banking BCEAO/BEAC
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/auth-demo')}
            className="bg-gradient-to-r from-orange to-baobab text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            🚀 Accéder au Système Complet
          </button>
        </div>
      </div>
    </div>
  );
};

export default AfricanIndex;

