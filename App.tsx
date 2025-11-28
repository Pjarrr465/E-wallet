import React, { useEffect, useState } from 'react';
import { AuthService, MessageService } from './services/db';
import { User, UserRole } from './types';
import { AuthView } from './views/AuthView';
import { BuyerView } from './views/BuyerView';
import { SellerView } from './views/SellerView';
import { LandingView } from './views/LandingView'; 
import { AdminView } from './views/AdminView'; 
import { LogOut, User as UserIcon, ShieldCheck, MessageSquare, Send, X } from 'lucide-react';
import { Button } from './components/Button';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation & UI State
  const [viewState, setViewState] = useState<'landing' | 'auth' | 'app'>('landing');
  const [authInitialMode, setAuthInitialMode] = useState<boolean>(true); 
  
  // Message Modal State
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [msgSentStatus, setMsgSentStatus] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setViewState('app');
    } else {
      setViewState('landing');
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setViewState('app');
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setViewState('landing'); 
  };

  const refreshUser = () => {
    if (user) {
        const updated = AuthService.refreshUser(user.id);
        setUser(updated);
    }
  }

  const handleSendMessage = () => {
    if (user && messageContent.trim()) {
        MessageService.sendMessage(user.id, user.name, messageContent);
        setMsgSentStatus(true);
        setTimeout(() => {
            setMsgSentStatus(false);
            setMessageContent('');
            setShowMessageModal(false);
        }, 1500);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

  // View Routing Logic
  if (viewState === 'landing') {
    return (
        <LandingView 
            onStart={() => {
                setAuthInitialMode(true);
                setViewState('auth');
            }}
            onRegister={() => {
                setAuthInitialMode(false);
                setViewState('auth');
            }}
            onLoginSuccess={handleLoginSuccess}
        />
    );
  }

  if (viewState === 'auth') {
      return (
          <AuthView 
            onLoginSuccess={handleLoginSuccess} 
            initialIsLogin={authInitialMode}
            onBack={() => setViewState('landing')}
          />
      );
  }

  if (!user) return null; 

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.BUYER: return 'bg-green-600 text-white';
      case UserRole.SELLER: return 'bg-orange-600 text-white';
      case UserRole.ADMIN: return 'bg-indigo-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-yellow-500 to-orange-500 font-sans flex justify-center">
        <div className="w-full max-w-md min-h-screen bg-transparent shadow-2xl overflow-hidden flex flex-col relative">
          
          {/* Header */}
          <header className="bg-white/20 backdrop-blur-md border-b border-white/20 sticky top-0 z-10 px-6 py-6 flex justify-between items-center shadow-lg">
            <div className="flex flex-col">
                <h1 className="font-bold text-2xl text-white tracking-tight drop-shadow-md">Wallet-ku</h1>
                <div className="flex items-center gap-1 text-white/90 text-sm font-medium mt-1">
                    {user.role === UserRole.ADMIN ? <ShieldCheck size={14} /> : <UserIcon size={14} />}
                    <span>Hai, {user.name.split(' ')[0]}</span>
                </div>
            </div>
            
            <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-2">
                    {/* Role Badge */}
                    <div className={`px-4 py-1.5 rounded-full font-bold text-sm shadow-md border border-white/30 ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                    </div>
                    
                    {/* Message Button (Only for Non-Admin) */}
                    {user.role !== UserRole.ADMIN && (
                        <button 
                            onClick={() => setShowMessageModal(true)}
                            className="bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full backdrop-blur-sm border border-white/20 transition-all"
                            title="Kirim Pesan ke Admin"
                        >
                            <MessageSquare size={18} />
                        </button>
                    )}
                </div>
                
                <button 
                    onClick={handleLogout} 
                    className="text-white/80 hover:text-white hover:bg-white/10 transition-colors text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/20"
                >
                    <LogOut size={14} /> Keluar
                </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto no-scrollbar p-0">
            <div className="min-h-full">
                {user.role === UserRole.BUYER && <BuyerView user={user} onBalanceUpdate={refreshUser} />}
                {user.role === UserRole.SELLER && <SellerView user={user} />}
                {user.role === UserRole.ADMIN && <AdminView />}
            </div>
          </main>

          {/* User Message Modal */}
          {showMessageModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                  <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
                      <button 
                          onClick={() => setShowMessageModal(false)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                      >
                          <X size={24} />
                      </button>
                      
                      <div className="flex items-center gap-3 mb-4 text-orange-600">
                          <MessageSquare size={24} />
                          <h3 className="font-bold text-lg text-gray-800">Hubungi Admin</h3>
                      </div>

                      {msgSentStatus ? (
                          <div className="py-8 text-center text-green-600 animate-fade-in">
                              <p className="font-bold text-lg">Pesan Terkirim!</p>
                              <p className="text-sm">Terima kasih atas masukan Anda.</p>
                          </div>
                      ) : (
                          <>
                            <p className="text-sm text-gray-500 mb-4">
                                Punya masalah dengan saldo atau transaksi? Kirim pesan ke admin.
                            </p>
                            <textarea 
                                className="w-full h-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none bg-gray-50"
                                placeholder="Tulis pesan Anda di sini..."
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                            ></textarea>
                            <div className="mt-4">
                                <Button fullWidth onClick={handleSendMessage} disabled={!messageContent.trim()}>
                                    <span className="flex items-center justify-center gap-2">
                                        Kirim Pesan <Send size={16} />
                                    </span>
                                </Button>
                            </div>
                          </>
                      )}
                  </div>
              </div>
          )}
        </div>
    </div>
  );
};

export default App;