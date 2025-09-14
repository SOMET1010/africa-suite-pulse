import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react';

const AfricanAuthPageFixed = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    country: ''
  });
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation de connexion réussie
    navigate('/');
  };

  const handleSocialAuth = (provider: string) => {
    console.log(`Authentification avec ${provider}`);
    // Simulation de connexion sociale réussie
    navigate('/');
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #FFF8DC 0%, #F5DEB3 25%, #DEB887 50%, #D2B48C 75%, #BC9A6A 100%)'
    }}>
      {/* Arrière-plan avec motifs africains authentiques */}
      <div className="absolute inset-0">
        {/* Motifs Bogolan (Mali) */}
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, #8B4513 3px, transparent 3px),
            radial-gradient(circle at 80% 80%, #D2691E 2px, transparent 2px),
            linear-gradient(45deg, transparent 45%, #8B4513 45%, #8B4513 55%, transparent 55%),
            linear-gradient(-45deg, transparent 45%, #D2691E 45%, #D2691E 55%, transparent 55%)
          `,
          backgroundSize: '80px 80px, 60px 60px, 40px 40px, 40px 40px',
          backgroundPosition: '0 0, 40px 40px, 0 0, 20px 20px'
        }} />

        {/* Bordures Kente (Ghana) */}
        <div className="absolute left-0 top-0 w-16 h-full opacity-30" style={{
          background: `repeating-linear-gradient(
            0deg,
            #FFD700 0px, #FFD700 8px,
            #8B4513 8px, #8B4513 16px,
            #D2691E 16px, #D2691E 24px,
            #228B22 24px, #228B22 32px,
            #DC143C 32px, #DC143C 40px
          )`
        }} />
        
        <div className="absolute right-0 top-0 w-16 h-full opacity-30" style={{
          background: `repeating-linear-gradient(
            0deg,
            #DC143C 0px, #DC143C 8px,
            #228B22 8px, #228B22 16px,
            #D2691E 16px, #D2691E 24px,
            #8B4513 24px, #8B4513 32px,
            #FFD700 32px, #FFD700 40px
          )`
        }} />

        {/* Motifs Adinkra décoratifs */}
        <div className="absolute top-8 left-8 text-6xl opacity-25" style={{ color: '#D2691E' }}>⚡</div>
        <div className="absolute top-16 right-16 text-5xl opacity-25" style={{ color: '#FFD700' }}>🌟</div>
        <div className="absolute bottom-16 left-16 text-4xl opacity-25" style={{ color: '#8B4513' }}>🔥</div>
        <div className="absolute bottom-8 right-8 text-6xl opacity-25" style={{ color: '#FF8C00' }}>☀️</div>
        
        {/* Symboles Adinkra supplémentaires */}
        <div className="absolute top-1/4 left-1/4 text-3xl opacity-20" style={{ color: '#8B4513' }}>◆</div>
        <div className="absolute top-3/4 right-1/4 text-3xl opacity-20" style={{ color: '#D2691E' }}>◇</div>
        <div className="absolute top-1/2 left-1/6 text-2xl opacity-20" style={{ color: '#228B22' }}>⬢</div>
        <div className="absolute top-1/3 right-1/6 text-2xl opacity-20" style={{ color: '#DC143C' }}>⬡</div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Logo et titre avec design africain */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 shadow-2xl" style={{
              background: 'linear-gradient(135deg, #FF8C00 0%, #D2691E 50%, #8B4513 100%)',
              border: '4px solid #FFD700'
            }}>
              <span className="text-4xl font-bold text-white">AS</span>
            </div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#8B4513' }}>Africa Suite Pulse</h1>
            <p className="text-lg" style={{ color: '#D2691E' }}>Votre ERP Hôtelier Africain</p>
            <div className="flex items-center justify-center mt-3 text-sm" style={{ color: '#8B4513' }}>
              <span className="mr-2 text-lg">🌍</span>
              <span className="italic font-medium">"Ubuntu - Je suis parce que nous sommes"</span>
            </div>
          </div>

          {/* Carte d'authentification avec design africain */}
          <div className="shadow-2xl border-0 rounded-2xl overflow-hidden" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '2px solid #FFD700'
          }}>
            {/* En-tête de la carte avec motif */}
            <div className="text-center p-6" style={{
              background: 'linear-gradient(135deg, #FF8C00 0%, #D2691E 100%)',
              backgroundImage: `
                radial-gradient(circle at 25% 25%, rgba(255, 215, 0, 0.3) 2px, transparent 2px),
                radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px, 15px 15px'
            }}>
              <h2 className="text-2xl font-bold text-white mb-2">
                {isLogin ? 'Akwaaba ! Bienvenue' : 'Rejoignez-nous'}
              </h2>
              <p className="text-orange-100">
                {isLogin 
                  ? 'Accédez à votre espace hôtelier' 
                  : 'Rejoignez la révolution hôtelière africaine'
                }
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Authentification sociale avec design africain */}
              <div className="space-y-3">
                <button
                  onClick={() => handleSocialAuth('Google')}
                  className="w-full h-12 border-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 hover:shadow-lg"
                  style={{
                    borderColor: '#D2691E',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#8B4513'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 140, 0, 0.1)';
                    e.currentTarget.style.borderColor = '#FF8C00';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.borderColor = '#D2691E';
                  }}
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(45deg, #EA4335, #FBBC05, #34A853, #4285F4)'
                  }}>
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <span className="font-medium">Continuer avec Google</span>
                </button>

                <button
                  onClick={() => handleSocialAuth('Facebook')}
                  className="w-full h-12 border-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 hover:shadow-lg"
                  style={{
                    borderColor: '#D2691E',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#8B4513'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 89, 152, 0.1)';
                    e.currentTarget.style.borderColor = '#3b5998';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.borderColor = '#D2691E';
                  }}
                >
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">f</span>
                  </div>
                  <span className="font-medium">Continuer avec Facebook</span>
                </button>

                <button
                  onClick={() => handleSocialAuth('Orange')}
                  className="w-full h-12 border-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 hover:shadow-lg"
                  style={{
                    borderColor: '#D2691E',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#8B4513'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 140, 0, 0.1)';
                    e.currentTarget.style.borderColor = '#FF8C00';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.borderColor = '#D2691E';
                  }}
                >
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">O</span>
                  </div>
                  <span className="font-medium">🇨🇮 Orange Money Connect</span>
                </button>

                <button
                  onClick={() => handleSocialAuth('MTN')}
                  className="w-full h-12 border-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 hover:shadow-lg"
                  style={{
                    borderColor: '#D2691E',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#8B4513'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.1)';
                    e.currentTarget.style.borderColor = '#FFD700';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.borderColor = '#D2691E';
                  }}
                >
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <span className="font-medium">🇬🇭 MTN Mobile Money</span>
                </button>

                <button
                  onClick={() => handleSocialAuth('Moov')}
                  className="w-full h-12 border-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-3 hover:shadow-lg"
                  style={{
                    borderColor: '#D2691E',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#8B4513'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(34, 139, 34, 0.1)';
                    e.currentTarget.style.borderColor = '#228B22';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.borderColor = '#D2691E';
                  }}
                >
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <span className="font-medium">🇧🇫 Moov Money</span>
                </button>
              </div>

              {/* Séparateur avec motif africain */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2" style={{ borderColor: '#D2691E' }}></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 text-sm" style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    color: '#8B4513' 
                  }}>
                    ou avec email
                  </span>
                </div>
              </div>

              {/* Formulaire classique avec design africain */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: '#8B4513' }}>
                      Nom complet
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#D2691E' }} />
                      <input
                        name="name"
                        type="text"
                        placeholder="Votre nom complet"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 h-12 border-2 rounded-lg transition-all duration-300"
                        style={{
                          borderColor: '#D2691E',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          color: '#8B4513'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#FF8C00';
                          e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#D2691E';
                          e.target.style.boxShadow = 'none';
                        }}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: '#8B4513' }}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#D2691E' }} />
                    <input
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 h-12 border-2 rounded-lg transition-all duration-300"
                      style={{
                        borderColor: '#D2691E',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: '#8B4513'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FF8C00';
                        e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#D2691E';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: '#8B4513' }}>
                        Téléphone
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#D2691E' }} />
                        <input
                          name="phone"
                          type="tel"
                          placeholder="+225 01 23 45 67 89"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 h-12 border-2 rounded-lg transition-all duration-300"
                          style={{
                            borderColor: '#D2691E',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            color: '#8B4513'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#FF8C00';
                            e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#D2691E';
                            e.target.style.boxShadow = 'none';
                          }}
                          required={!isLogin}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: '#8B4513' }}>
                        Pays
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#D2691E' }} />
                        <input
                          name="country"
                          type="text"
                          placeholder="Côte d'Ivoire"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full pl-10 h-12 border-2 rounded-lg transition-all duration-300"
                          style={{
                            borderColor: '#D2691E',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            color: '#8B4513'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#FF8C00';
                            e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#D2691E';
                            e.target.style.boxShadow = 'none';
                          }}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium" style={{ color: '#8B4513' }}>
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#D2691E' }} />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-10 h-12 border-2 rounded-lg transition-all duration-300"
                      style={{
                        borderColor: '#D2691E',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: '#8B4513'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FF8C00';
                        e.target.style.boxShadow = '0 0 0 3px rgba(255, 140, 0, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#D2691E';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                      style={{ color: '#D2691E' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#FF8C00'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#D2691E'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 text-white font-semibold rounded-lg shadow-lg transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #FF8C00 0%, #D2691E 100%)',
                    border: '2px solid #FFD700'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #FF7F00 0%, #CD5C5C 100%)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 140, 0, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #FF8C00 0%, #D2691E 100%)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                  }}
                >
                  {isLogin ? '🚀 Se connecter' : '✨ Créer mon compte'}
                </button>
              </form>

              {/* Lien de basculement */}
              <div className="text-center pt-4">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-medium transition-colors duration-200"
                  style={{ color: '#D2691E' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FF8C00'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#D2691E'}
                >
                  {isLogin 
                    ? "Pas encore de compte ? S'inscrire 📝" 
                    : "Déjà un compte ? Se connecter 🔑"
                  }
                </button>
              </div>

              {/* Proverbe africain avec design */}
              <div className="text-center pt-4 border-t-2" style={{ borderColor: '#F5DEB3' }}>
                <p className="text-sm italic font-medium" style={{ color: '#8B4513' }}>
                  🌍 "Seul on va plus vite, ensemble on va plus loin"
                </p>
                <p className="text-xs mt-1" style={{ color: '#D2691E' }}>Proverbe africain</p>
              </div>
            </div>
          </div>

          {/* Footer avec drapeaux africains */}
          <div className="text-center mt-8 text-sm" style={{ color: '#8B4513' }}>
            <p className="font-medium">© 2025 Africa Suite Pulse - Révolutionnant l'hôtellerie africaine</p>
            <div className="flex justify-center space-x-4 mt-3 text-lg">
              <span>🇨🇮 Côte d'Ivoire</span>
              <span>🇸🇳 Sénégal</span>
              <span>🇲🇱 Mali</span>
              <span>🇬🇭 Ghana</span>
              <span>🇧🇫 Burkina Faso</span>
            </div>
            <div className="mt-2 text-xs" style={{ color: '#D2691E' }}>
              <span>Conçu avec ❤️ pour l'Afrique par des Africains</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AfricanAuthPageFixed;

