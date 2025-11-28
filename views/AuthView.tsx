import React, { useState } from 'react';
import { AuthService } from '../services/db';
import { EducationLevel, UserRole } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Wallet, ArrowLeft } from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess: () => void;
  initialIsLogin?: boolean;
  onBack?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, initialIsLogin = true, onBack }) => {
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.BUYER,
    educationLevel: EducationLevel.SMA,
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const res = AuthService.login(formData.email, formData.password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.message);
      }
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        setError('Mohon lengkapi semua data.');
        return;
      }
      const res = AuthService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        educationLevel: formData.educationLevel,
      });
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-500 via-yellow-500 to-orange-500">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 border border-white/20 relative animate-fade-in-up">
        {onBack && (
            <button onClick={onBack} className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft size={24} />
            </button>
        )}
        <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-green-100 to-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-4 shadow-sm">
                <Wallet size={32} />
            </div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet-ku</h1>
          <p className="text-gray-500 text-sm mt-1">Masuk untuk memulai transaksi</p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <Input 
              label="Nama Lengkap" 
              placeholder="Contoh: Budi Santoso"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          )}

          <Input 
            label={isLogin ? "Email atau Username" : "Email"} 
            type="text" // Changed from email to text to support Username
            placeholder={isLogin ? "Email atau Username" : "nama@email.com"}
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />

          <Input 
            label="Kata Sandi" 
            type="password" 
            placeholder="••••••••"
            value={formData.password}
            onChange={e => setFormData({...formData, password: e.target.value})}
          />

          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Peran</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                >
                  <option value={UserRole.BUYER}>Pembeli</option>
                  <option value={UserRole.SELLER}>Penjual</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Pendidikan Terakhir</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.educationLevel}
                  onChange={e => setFormData({...formData, educationLevel: e.target.value as EducationLevel})}
                >
                  {Object.values(EducationLevel).map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth className="bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white shadow-lg shadow-orange-500/30">
            {isLogin ? 'Masuk' : 'Daftar'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-orange-600 font-bold hover:underline"
            >
              {isLogin ? 'Daftar Sekarang' : 'Masuk Disini'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};