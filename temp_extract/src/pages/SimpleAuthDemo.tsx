import React, { useState } from 'react';

const SimpleAuthDemo = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSocialAuth = (provider: string) => {
    alert(`Connexion avec ${provider} simulée !`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8DC 0%, #F5DEB3 25%, #DEB887 50%, #D2B48C 75%, #BC9A6A 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Motifs africains en arrière-plan */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        backgroundImage: `
          radial-gradient(circle at 20% 20%, #8B4513 3px, transparent 3px),
          radial-gradient(circle at 80% 80%, #D2691E 2px, transparent 2px)
        `,
        backgroundSize: '80px 80px, 60px 60px',
        backgroundPosition: '0 0, 40px 40px'
      }} />

      {/* Bordures Kente */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '60px',
        height: '100%',
        background: `repeating-linear-gradient(
          0deg,
          #FFD700 0px, #FFD700 8px,
          #8B4513 8px, #8B4513 16px,
          #D2691E 16px, #D2691E 24px,
          #228B22 24px, #228B22 32px
        )`,
        opacity: 0.3
      }} />

      <div style={{
        position: 'absolute',
        right: 0,
        top: 0,
        width: '60px',
        height: '100%',
        background: `repeating-linear-gradient(
          0deg,
          #228B22 0px, #228B22 8px,
          #D2691E 8px, #D2691E 16px,
          #8B4513 16px, #8B4513 24px,
          #FFD700 24px, #FFD700 32px
        )`,
        opacity: 0.3
      }} />

      {/* Contenu principal */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* Logo et titre */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF8C00 0%, #D2691E 50%, #8B4513 100%)',
              border: '4px solid #FFD700',
              marginBottom: '20px',
              boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
            }}>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>AS</span>
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#8B4513', margin: '0 0 10px 0' }}>
              Africa Suite Pulse
            </h1>
            <p style={{ fontSize: '18px', color: '#D2691E', margin: '0 0 15px 0' }}>
              Votre ERP Hôtelier Africain
            </p>
            <div style={{ color: '#8B4513', fontSize: '14px' }}>
              <span style={{ marginRight: '8px', fontSize: '18px' }}>🌍</span>
              <span style={{ fontStyle: 'italic', fontWeight: '500' }}>
                "Ubuntu - Je suis parce que nous sommes"
              </span>
            </div>
          </div>

          {/* Carte d'authentification */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            border: '2px solid #FFD700',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {/* En-tête */}
            <div style={{
              background: 'linear-gradient(135deg, #FF8C00 0%, #D2691E 100%)',
              padding: '30px',
              textAlign: 'center',
              color: 'white'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                {isLogin ? 'Akwaaba ! Bienvenue' : 'Rejoignez-nous'}
              </h2>
              <p style={{ margin: 0, opacity: 0.9 }}>
                {isLogin 
                  ? 'Accédez à votre espace hôtelier' 
                  : 'Rejoignez la révolution hôtelière africaine'
                }
              </p>
            </div>

            {/* Contenu */}
            <div style={{ padding: '30px' }}>
              {/* Authentification sociale */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#8B4513', 
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  🌍 Connexion Sociale Africaine
                </h3>
                
                {[
                  { name: 'Google', color: '#EA4335', flag: '🌐', desc: 'Connexion universelle' },
                  { name: 'Facebook', color: '#1877F2', flag: '📘', desc: 'Réseau social' },
                  { name: 'Orange Money', color: '#FF8C00', flag: '🇨🇮', desc: 'Côte d\'Ivoire' },
                  { name: 'MTN Money', color: '#FFD700', flag: '🇬🇭', desc: 'Ghana' },
                  { name: 'Moov Money', color: '#228B22', flag: '🇧🇫', desc: 'Burkina Faso' }
                ].map((provider, index) => (
                  <button
                    key={index}
                    onClick={() => handleSocialAuth(provider.name)}
                    style={{
                      width: '100%',
                      height: '50px',
                      border: '2px solid #D2691E',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#8B4513',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = provider.color;
                      e.currentTarget.style.background = `${provider.color}15`;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#D2691E';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: provider.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {provider.name.charAt(0)}
                    </div>
                    <span>{provider.flag} {provider.name}</span>
                    <span style={{ fontSize: '12px', opacity: 0.7 }}>({provider.desc})</span>
                  </button>
                ))}
              </div>

              {/* Séparateur */}
              <div style={{
                position: 'relative',
                margin: '30px 0',
                textAlign: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: '#D2691E'
                }} />
                <span style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '0 20px',
                  color: '#8B4513',
                  fontSize: '14px',
                  position: 'relative'
                }}>
                  ou avec email
                </span>
              </div>

              {/* Formulaire email */}
              <div style={{ marginBottom: '20px' }}>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  style={{
                    width: '100%',
                    height: '50px',
                    border: '2px solid #D2691E',
                    borderRadius: '10px',
                    padding: '0 15px',
                    fontSize: '16px',
                    marginBottom: '15px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#8B4513'
                  }}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    height: '50px',
                    border: '2px solid #D2691E',
                    borderRadius: '10px',
                    padding: '0 15px',
                    fontSize: '16px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#8B4513'
                  }}
                />
              </div>

              {/* Bouton principal */}
              <button
                style={{
                  width: '100%',
                  height: '50px',
                  background: 'linear-gradient(135deg, #FF8C00 0%, #D2691E 100%)',
                  border: '2px solid #FFD700',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '20px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 140, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isLogin ? '🚀 Se connecter' : '✨ Créer mon compte'}
              </button>

              {/* Basculement */}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#D2691E',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {isLogin 
                    ? "Pas encore de compte ? S'inscrire 📝" 
                    : "Déjà un compte ? Se connecter 🔑"
                  }
                </button>
              </div>

              {/* Proverbe */}
              <div style={{
                textAlign: 'center',
                marginTop: '30px',
                paddingTop: '20px',
                borderTop: '2px solid #F5DEB3'
              }}>
                <p style={{
                  fontSize: '14px',
                  fontStyle: 'italic',
                  fontWeight: '500',
                  color: '#8B4513',
                  margin: '0 0 5px 0'
                }}>
                  🌍 "Seul on va plus vite, ensemble on va plus loin"
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#D2691E',
                  margin: 0
                }}>
                  Proverbe africain
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            marginTop: '30px',
            color: '#8B4513',
            fontSize: '14px'
          }}>
            <p style={{ fontWeight: '500', margin: '0 0 15px 0' }}>
              © 2025 Africa Suite Pulse - Révolutionnant l'hôtellerie africaine
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px',
              fontSize: '16px',
              marginBottom: '10px'
            }}>
              <span>🇨🇮 Côte d'Ivoire</span>
              <span>🇸🇳 Sénégal</span>
              <span>🇲🇱 Mali</span>
              <span>🇬🇭 Ghana</span>
              <span>🇧🇫 Burkina Faso</span>
            </div>
            <div style={{
              fontSize: '12px',
              color: '#D2691E'
            }}>
              <span>Conçu avec ❤️ pour l'Afrique par des Africains</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAuthDemo;

