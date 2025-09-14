import React, { useState } from 'react';
import AfricanDashboardEnhanced from '@/components/ui/african/african-dashboard-enhanced';
import AfricanPOSTerminalEnhanced from '@/features/pos/components/AfricanPOSTerminalEnhanced';
import SimpleAuthDemo from '@/pages/SimpleAuthDemo';

const AfricanDesignShowcasePage = () => {
  const [activeDemo, setActiveDemo] = useState('dashboard');

  const demos = [
    { id: 'dashboard', label: '🏨 Dashboard Hôtelier', icon: '📊' },
    { id: 'pos', label: '🍽️ Terminal POS', icon: '💳' },
    { id: 'auth', label: '🔐 Authentification', icon: '🌍' },
    { id: 'components', label: '🎨 Composants UI', icon: '🎭' }
  ];

  const renderComponentsDemo = () => (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #F5DEB3 25%, #DEB887 50%, #D2B48C 75%, #BC9A6A 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#8B4513',
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          🎨 Showcase des Composants UI Africains
        </h1>

        {/* Boutons africains */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '2px solid #FFD700',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#8B4513', marginBottom: '20px' }}>🔘 Boutons Africains</h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button className="african-button">Bouton Principal</button>
            <button className="african-button-secondary">Bouton Secondaire</button>
            <button className="african-button african-pulse">Bouton Animé</button>
          </div>
        </div>

        {/* Cartes africaines */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '2px solid #FFD700',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#8B4513', marginBottom: '20px' }}>📄 Cartes Africaines</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="african-card african-slide-in">
              <div className="african-card-header">
                <h3>🌍 Carte Ubuntu</h3>
              </div>
              <div className="african-card-content">
                <p>Cette carte utilise la philosophie Ubuntu : "Je suis parce que nous sommes"</p>
              </div>
              <div className="african-card-footer">
                <button className="african-button">Action Ubuntu</button>
              </div>
            </div>

            <div className="african-card african-slide-in">
              <div className="african-card-header">
                <h3>🤗 Carte Teranga</h3>
              </div>
              <div className="african-card-content">
                <p>Inspirée de l'hospitalité sénégalaise et de la philosophie Teranga</p>
              </div>
              <div className="african-card-footer">
                <button className="african-button">Action Teranga</button>
              </div>
            </div>
          </div>
        </div>

        {/* Inputs africains */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '2px solid #FFD700',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#8B4513', marginBottom: '20px' }}>📝 Champs de Saisie Africains</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <label className="african-label">Nom Ubuntu</label>
              <input className="african-input" placeholder="Entrez votre nom..." />
            </div>
            <div>
              <label className="african-label">Email Teranga</label>
              <input className="african-input" type="email" placeholder="votre@email.com" />
            </div>
          </div>
        </div>

        {/* Alertes africaines */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '2px solid #FFD700',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#8B4513', marginBottom: '20px' }}>🔔 Alertes Africaines</h2>
          <div className="african-alert african-alert-success">
            ✅ Succès Ubuntu : Votre action a été réalisée avec succès !
          </div>
          <div className="african-alert african-alert-warning">
            ⚠️ Attention Teranga : Vérifiez vos informations avant de continuer.
          </div>
          <div className="african-alert african-alert-error">
            ❌ Erreur Harambee : Une erreur s'est produite, travaillons ensemble pour la résoudre.
          </div>
          <div className="african-alert african-alert-info">
            ℹ️ Information Sankofa : Regardons en arrière pour mieux avancer.
          </div>
        </div>

        {/* Badges africains */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '2px solid #FFD700',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#8B4513', marginBottom: '20px' }}>🏷️ Badges Africains</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span className="african-badge">Ubuntu</span>
            <span className="african-badge-gold">Teranga</span>
            <span className="african-badge-success">Harambee</span>
            <span className="african-badge-warning">Sankofa</span>
            <span className="african-badge-error">Urgent</span>
          </div>
        </div>

        {/* Tableau africain */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '2px solid #FFD700',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px'
        }}>
          <h2 style={{ color: '#8B4513', marginBottom: '20px' }}>📊 Tableau Africain</h2>
          <table className="african-table">
            <thead>
              <tr>
                <th>🌍 Pays</th>
                <th>🏨 Hôtels</th>
                <th>💰 Revenus</th>
                <th>🤝 Philosophie</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>🇨🇮 Côte d'Ivoire</td>
                <td>12</td>
                <td>2.8M F CFA</td>
                <td>Ubuntu</td>
              </tr>
              <tr>
                <td>🇸🇳 Sénégal</td>
                <td>8</td>
                <td>2.1M F CFA</td>
                <td>Teranga</td>
              </tr>
              <tr>
                <td>🇬🇭 Ghana</td>
                <td>6</td>
                <td>1.9M F CFA</td>
                <td>Sankofa</td>
              </tr>
              <tr>
                <td>🇧🇫 Burkina Faso</td>
                <td>4</td>
                <td>1.2M F CFA</td>
                <td>Harambee</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Citation africaine */}
        <div className="african-quote">
          "Seul on va plus vite, ensemble on va plus loin"
          <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '14px' }}>
            — Proverbe africain
          </div>
        </div>

        {/* Séparateur décoratif */}
        <div className="african-divider"></div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          padding: '30px',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '2px solid #FFD700',
          borderRadius: '20px',
          marginTop: '30px'
        }}>
          <h3 style={{ color: '#8B4513', marginBottom: '15px' }}>
            🌍 Africa Suite Pulse - Design System Africain
          </h3>
          <p style={{ color: '#D2691E', marginBottom: '15px' }}>
            Tous les composants UI intègrent les philosophies africaines authentiques
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <span>🤝 Ubuntu</span>
            <span>🤗 Teranga</span>
            <span>💪 Harambee</span>
            <span>🔄 Sankofa</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Navigation des démos */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        right: '20px',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        border: '2px solid #FFD700',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 8px 25px rgba(139, 69, 19, 0.15)'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {demos.map((demo) => (
            <button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id)}
              style={{
                background: activeDemo === demo.id 
                  ? 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)' 
                  : 'rgba(255, 255, 255, 0.9)',
                border: '2px solid #D2691E',
                borderRadius: '12px',
                padding: '8px 16px',
                color: activeDemo === demo.id ? 'white' : '#8B4513',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => {
                if (activeDemo !== demo.id) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = 'rgba(255, 140, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeDemo !== demo.id) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                }
              }}
            >
              <span style={{ marginRight: '6px' }}>{demo.icon}</span>
              {demo.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu des démos */}
      <div style={{ paddingTop: '100px' }}>
        {activeDemo === 'dashboard' && <AfricanDashboardEnhanced />}
        {activeDemo === 'pos' && <AfricanPOSTerminalEnhanced />}
        {activeDemo === 'auth' && <SimpleAuthDemo />}
        {activeDemo === 'components' && renderComponentsDemo()}
      </div>
    </div>
  );
};

export default AfricanDesignShowcasePage;

