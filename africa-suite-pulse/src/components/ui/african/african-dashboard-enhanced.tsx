import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const AfricanDashboardEnhanced = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Données de démonstration avec thème africain
  const hotelData = [
    { name: 'Lun', occupancy: 85, revenue: 2400, philosophy: 'Ubuntu' },
    { name: 'Mar', occupancy: 92, revenue: 2800, philosophy: 'Teranga' },
    { name: 'Mer', occupancy: 78, revenue: 2200, philosophy: 'Harambee' },
    { name: 'Jeu', occupancy: 88, revenue: 2600, philosophy: 'Sankofa' },
    { name: 'Ven', occupancy: 95, revenue: 3200, philosophy: 'Ubuntu' },
    { name: 'Sam', occupancy: 98, revenue: 3800, philosophy: 'Teranga' },
    { name: 'Dim', occupancy: 82, revenue: 2500, philosophy: 'Harambee' }
  ];

  const regionData = [
    { name: 'Côte d\'Ivoire', value: 35, color: '#FF8C00' },
    { name: 'Sénégal', value: 25, color: '#8B4513' },
    { name: 'Mali', value: 20, color: '#FFD700' },
    { name: 'Ghana', value: 15, color: '#228B22' },
    { name: 'Burkina Faso', value: 5, color: '#DC143C' }
  ];

  const philosophyQuotes = [
    { philosophy: 'Ubuntu', quote: 'Je suis parce que nous sommes', origin: 'Afrique du Sud' },
    { philosophy: 'Teranga', quote: 'L\'hospitalité est notre force', origin: 'Sénégal' },
    { philosophy: 'Harambee', quote: 'Travaillons ensemble', origin: 'Kenya' },
    { philosophy: 'Sankofa', quote: 'Regarder en arrière pour avancer', origin: 'Ghana' }
  ];

  const africanPatterns = {
    bogolan: 'radial-gradient(circle at 20% 20%, #8B4513 3px, transparent 3px), radial-gradient(circle at 80% 80%, #D2691E 2px, transparent 2px)',
    kente: 'repeating-linear-gradient(0deg, #FFD700 0px, #FFD700 8px, #8B4513 8px, #8B4513 16px, #D2691E 16px, #D2691E 24px, #228B22 24px, #228B22 32px)',
    mudcloth: 'radial-gradient(circle at 25% 25%, #8B4513 2px, transparent 2px), radial-gradient(circle at 75% 75%, #D2691E 1px, transparent 1px)'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #F5DEB3 25%, #DEB887 50%, #D2B48C 75%, #BC9A6A 100%)',
      position: 'relative'
    }}>
      {/* Motifs africains en arrière-plan */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: africanPatterns.bogolan,
        backgroundSize: '80px 80px, 60px 60px',
        backgroundPosition: '0 0, 40px 40px',
        opacity: 0.05,
        pointerEvents: 'none'
      }} />

      {/* Bordures Kente */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '12px',
        height: '100%',
        background: africanPatterns.kente,
        opacity: 0.4
      }} />
      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: '12px',
        height: '100%',
        background: africanPatterns.kente,
        opacity: 0.4
      }} />

      {/* Contenu principal */}
      <div style={{ position: 'relative', zIndex: 10, padding: '20px' }}>
        {/* En-tête avec identité africaine */}
        <div style={{
          background: 'linear-gradient(135deg, #FF8C00 0%, #D2691E 100%)',
          borderRadius: '20px',
          padding: '30px',
          marginBottom: '30px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 35px rgba(139, 69, 19, 0.2)'
        }}>
          {/* Motifs décoratifs dans l'en-tête */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: africanPatterns.mudcloth,
            backgroundSize: '40px 40px, 30px 30px',
            backgroundPosition: '0 0, 20px 20px',
            opacity: 0.2
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                  🌍 Africa Suite Pulse
                </h1>
                <p style={{ fontSize: '18px', margin: '0 0 15px 0', opacity: 0.9 }}>
                  Tableau de Bord Hôtelier Africain Authentique
                </p>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>🤝</span>
                    <span style={{ fontWeight: '500' }}>Ubuntu</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>🤗</span>
                    <span style={{ fontWeight: '500' }}>Teranga</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>💪</span>
                    <span style={{ fontWeight: '500' }}>Harambee</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                  {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div style={{ fontSize: '16px', opacity: 0.9 }}>
                  🇨🇮 Abidjan • 🇸🇳 Dakar • 🇲🇱 Bamako • 🇬🇭 Accra
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets africains */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'overview', label: '🏨 Vue d\'ensemble', icon: '🌍' },
              { id: 'analytics', label: '📊 Analytics Ubuntu', icon: '🤝' },
              { id: 'regions', label: '🗺️ Régions Africaines', icon: '🌍' },
              { id: 'philosophy', label: '💭 Sagesse Africaine', icon: '🧠' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id 
                    ? 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)' 
                    : 'rgba(255, 255, 255, 0.9)',
                  border: '2px solid #D2691E',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  color: activeTab === tab.id ? 'white' : '#8B4513',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: activeTab === tab.id ? '0 8px 25px rgba(255, 215, 0, 0.3)' : '0 4px 15px rgba(139, 69, 19, 0.1)'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.background = 'rgba(255, 140, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                  }
                }}
              >
                <span style={{ marginRight: '8px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* KPI Cards avec design africain */}
            {[
              { title: 'Taux d\'Occupation Ubuntu', value: '89%', change: '+5%', icon: '🤝', color: '#FF8C00' },
              { title: 'Revenus Teranga', value: '2.8M F CFA', change: '+12%', icon: '🤗', color: '#8B4513' },
              { title: 'Satisfaction Harambee', value: '4.8/5', change: '+0.3', icon: '💪', color: '#FFD700' },
              { title: 'Équipes Sankofa', value: '156', change: '+8', icon: '🔄', color: '#228B22' }
            ].map((kpi, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid #FFD700',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 8px 25px rgba(139, 69, 19, 0.15)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Bordure décorative */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '6px',
                  background: `linear-gradient(135deg, ${kpi.color} 0%, #D2691E 100%)`
                }} />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${kpi.color} 0%, #D2691E 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    {kpi.icon}
                  </div>
                  <div style={{
                    background: kpi.change.startsWith('+') ? '#228B22' : '#DC143C',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {kpi.change}
                  </div>
                </div>

                <h3 style={{ color: '#8B4513', fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0' }}>
                  {kpi.title}
                </h3>
                <div style={{ color: '#D2691E', fontSize: '28px', fontWeight: 'bold' }}>
                  {kpi.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {/* Graphique d'occupation */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid #FFD700',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 8px 25px rgba(139, 69, 19, 0.15)'
            }}>
              <h3 style={{ color: '#8B4513', marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
                📊 Occupation Hebdomadaire Ubuntu
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hotelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D2B48C" />
                  <XAxis dataKey="name" stroke="#8B4513" />
                  <YAxis stroke="#8B4513" />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '2px solid #FFD700',
                      borderRadius: '12px',
                      color: '#8B4513'
                    }}
                  />
                  <Bar dataKey="occupancy" fill="url(#africanGradient)" />
                  <defs>
                    <linearGradient id="africanGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF8C00" />
                      <stop offset="100%" stopColor="#D2691E" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Graphique de revenus */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid #FFD700',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 8px 25px rgba(139, 69, 19, 0.15)'
            }}>
              <h3 style={{ color: '#8B4513', marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
                💰 Revenus Teranga (K F CFA)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hotelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D2B48C" />
                  <XAxis dataKey="name" stroke="#8B4513" />
                  <YAxis stroke="#8B4513" />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '2px solid #FFD700',
                      borderRadius: '12px',
                      color: '#8B4513'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#FFD700" 
                    strokeWidth={3}
                    dot={{ fill: '#FF8C00', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'regions' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {/* Graphique en secteurs des régions */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid #FFD700',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 8px 25px rgba(139, 69, 19, 0.15)'
            }}>
              <h3 style={{ color: '#8B4513', marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
                🗺️ Répartition par Pays Africains
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Liste des régions avec drapeaux */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid #FFD700',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 8px 25px rgba(139, 69, 19, 0.15)'
            }}>
              <h3 style={{ color: '#8B4513', marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>
                🌍 Présence Panafricaine
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { country: 'Côte d\'Ivoire', flag: '🇨🇮', capital: 'Abidjan', hotels: 12 },
                  { country: 'Sénégal', flag: '🇸🇳', capital: 'Dakar', hotels: 8 },
                  { country: 'Mali', flag: '🇲🇱', capital: 'Bamako', hotels: 6 },
                  { country: 'Ghana', flag: '🇬🇭', capital: 'Accra', hotels: 5 },
                  { country: 'Burkina Faso', flag: '🇧🇫', capital: 'Ouagadougou', hotels: 3 }
                ].map((region, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: 'rgba(255, 140, 0, 0.05)',
                    border: '1px solid #D2B48C',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{region.flag}</span>
                      <div>
                        <div style={{ fontWeight: '600', color: '#8B4513' }}>{region.country}</div>
                        <div style={{ fontSize: '14px', color: '#D2691E' }}>{region.capital}</div>
                      </div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #FF8C00 0%, #D2691E 100%)',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {region.hotels} hôtels
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'philosophy' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            {philosophyQuotes.map((item, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid #FFD700',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 8px 25px rgba(139, 69, 19, 0.15)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Motif décoratif */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '6px',
                  background: 'linear-gradient(135deg, #FF8C00 0%, #D2691E 100%)'
                }} />

                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ 
                    color: '#8B4513', 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    marginBottom: '16px' 
                  }}>
                    {item.philosophy}
                  </h3>
                  
                  <div style={{
                    fontSize: '48px',
                    color: '#FFD700',
                    marginBottom: '16px'
                  }}>
                    "
                  </div>
                  
                  <p style={{
                    fontSize: '18px',
                    fontStyle: 'italic',
                    color: '#D2691E',
                    marginBottom: '20px',
                    lineHeight: '1.6'
                  }}>
                    {item.quote}
                  </p>
                  
                  <div style={{
                    background: 'linear-gradient(135deg, #FF8C00 0%, #D2691E 100%)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'inline-block'
                  }}>
                    🌍 {item.origin}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer avec proverbe africain */}
        <div style={{
          marginTop: '40px',
          textAlign: 'center',
          padding: '30px',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '2px solid #FFD700',
          borderRadius: '20px',
          boxShadow: '0 8px 25px rgba(139, 69, 19, 0.15)'
        }}>
          <div style={{
            fontSize: '20px',
            fontStyle: 'italic',
            fontWeight: '600',
            color: '#8B4513',
            marginBottom: '10px'
          }}>
            🌍 "Seul on va plus vite, ensemble on va plus loin"
          </div>
          <div style={{
            fontSize: '14px',
            color: '#D2691E'
          }}>
            Proverbe africain • Africa Suite Pulse • Révolutionnant l'hôtellerie africaine
          </div>
        </div>
      </div>
    </div>
  );
};

export default AfricanDashboardEnhanced;

