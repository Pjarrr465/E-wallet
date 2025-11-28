import React, { useState } from 'react';
import { Wallet, Menu, X, HelpCircle, UserPlus, Settings, LogIn, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { AuthService } from '../services/db';

interface LandingViewProps {
  onStart: () => void;
  onRegister: () => void;
  onLoginSuccess: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onStart, onRegister, onLoginSuccess }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Admin Login State
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    
    // Use the AuthService login which handles the 'admin'/'123' check
    const res = AuthService.login(adminUser, adminPass);
    if (res.success && res.user?.role === 'Administrator') {
        onLoginSuccess();
    } else {
        setAdminError('Akses ditolak. Kredensial salah.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-500 via-yellow-500 to-orange-500 flex flex-col items-center justify-center text-white">
      
      {/* Top Left Menu Button */}
      <button 
        onClick={toggleMenu}
        className="absolute top-6 left-6 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all z-20"
      >
        <Menu size={24} className="text-white" />
      </button>

      {/* Top Right Admin Button (Secure Access) */}
      <button 
        onClick={() => setShowAdminLogin(true)}
        className="absolute top-6 right-6 p-2 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all z-20 text-white/50 hover:text-white"
        title="Admin Access"
      >
        <Lock size={20} />
      </button>

      {/* Main Content */}
      <div className="text-center animate-fade-in-up px-6">
        <div className="w-24 h-24 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-300">
          <Wallet size={48} className="text-green-600" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 drop-shadow-md">Wallet-ku</h1>
        <p className="text-white/90 text-lg font-medium mb-12">Simulasi Transaksi Digital untuk Riset</p>
        
        <button 
            onClick={onStart}
            className="bg-white text-orange-600 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95"
        >
            Mulai Sekarang
        </button>
      </div>

      {/* Sidebar Menu / Settings Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 w-64 bg-white text-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
            <h2 className="font-bold text-lg flex items-center gap-2">
                <Settings size={20} className="text-gray-500" />
                Pengaturan
            </h2>
            <button onClick={toggleMenu} className="text-gray-500 hover:text-red-500">
                <X size={24} />
            </button>
        </div>
        
        <div className="p-4 space-y-2">
            <button 
                onClick={() => { setShowHelp(true); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-left font-medium"
            >
                {/* Changed Blue to Green to match harmony */}
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <HelpCircle size={20} />
                </div>
                <div>
                    <span className="block text-gray-900">Bantuan (Help)</span>
                    <span className="text-xs text-gray-500">Informasi aplikasi</span>
                </div>
            </button>

            <button 
                onClick={() => { onRegister(); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-left font-medium"
            >
                {/* Kept Orange */}
                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                    <UserPlus size={20} />
                </div>
                <div>
                    <span className="block text-gray-900">Daftar Akun</span>
                    <span className="text-xs text-gray-500">Buat akun baru</span>
                </div>
            </button>

            <button 
                onClick={() => { onStart(); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-left font-medium"
            >
                {/* Yellow/Gold for harmony */}
                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                    <LogIn size={20} />
                </div>
                <div>
                    <span className="block text-gray-900">Masuk</span>
                    <span className="text-xs text-gray-500">Sudah punya akun</span>
                </div>
            </button>
        </div>

        <div className="absolute bottom-0 w-full p-6 text-center text-xs text-gray-400">
            v1.0.0 Research Prototype
        </div>
      </div>

      {/* Overlay for Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm" onClick={toggleMenu}></div>
      )}

      {/* Simple Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <div className="flex items-center gap-3 mb-4 text-green-600">
                    <HelpCircle size={28} />
                    <h3 className="font-bold text-xl">Tentang Wallet-ku</h3>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                    Aplikasi ini adalah prototipe penelitian untuk simulasi transaksi menggunakan QR Code.
                    <br/><br/>
                    Gunakan <strong>Email</strong> sebagai ID dan buat password bebas untuk simulasi.
                    <br/><br/>
                    Tidak ada uang asli yang digunakan.
                </p>
                <Button onClick={() => setShowHelp(false)} fullWidth>Mengerti</Button>
            </div>
        </div>
      )}

      {/* Secure Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/90 backdrop-blur-md animate-fade-in">
             <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden relative">
                <button 
                    onClick={() => { setShowAdminLogin(false); setAdminError(''); }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>
                
                <div className="bg-gray-100 p-6 border-b flex items-center gap-3">
                    <div className="p-2 bg-gray-800 text-white rounded-lg">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">Admin Control</h3>
                        <p className="text-xs text-gray-500">Secure Access Only</p>
                    </div>
                </div>

                <form onSubmit={handleAdminLogin} className="p-6">
                    <div className="space-y-4">
                        <Input 
                            label="Admin ID" 
                            placeholder="admin" 
                            value={adminUser}
                            onChange={e => setAdminUser(e.target.value)}
                        />
                        <Input 
                            label="Passphrase" 
                            type="password"
                            placeholder="•••" 
                            value={adminPass}
                            onChange={e => setAdminPass(e.target.value)}
                        />
                    </div>

                    {adminError && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg flex items-center gap-2">
                             <X size={14} /> {adminError}
                        </div>
                    )}

                    <div className="mt-6">
                        <Button type="submit" fullWidth variant="secondary">
                            Unlock Panel
                        </Button>
                    </div>
                </form>
             </div>
        </div>
      )}

    </div>
  );
};