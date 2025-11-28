import React, { useState } from 'react';
import { User, QRData, Transaction } from '../types';
import { Button } from '../components/Button';
import { QRScanner } from '../components/QRScanner';
import { TransactionService, AuthService } from '../services/db';
import { formatCurrency } from '../App';
import { Scan, History, User as UserIcon } from 'lucide-react';

interface BuyerViewProps {
  user: User;
  onBalanceUpdate: () => void;
}

export const BuyerView: React.FC<BuyerViewProps> = ({ user, onBalanceUpdate }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [confirmData, setConfirmData] = useState<QRData | null>(null);
  const [notification, setNotification] = useState<{type: 'success' | 'error', msg: string} | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [viewHistory, setViewHistory] = useState(false);

  const handleScanSuccess = (decodedText: string) => {
    setIsScanning(false);
    try {
      const data: QRData = JSON.parse(decodedText);
      if (data.sellerId && data.amount) {
        setConfirmData(data);
      } else {
        setNotification({ type: 'error', msg: 'Format QR Code tidak valid.' });
      }
    } catch (e) {
      setNotification({ type: 'error', msg: 'Gagal membaca data QR.' });
    }
  };

  const handlePayment = () => {
    if (!confirmData) return;

    const result = TransactionService.processPayment(user.id, confirmData.sellerId, confirmData.amount);
    
    if (result.success) {
      setNotification({ type: 'success', msg: result.message });
      onBalanceUpdate(); // Refresh user balance from storage
    } else {
      setNotification({ type: 'error', msg: result.message });
    }
    setConfirmData(null);
  };

  const loadHistory = () => {
    setHistory(TransactionService.getHistory(user.id));
    setViewHistory(true);
  };

  if (viewHistory) {
      return (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Riwayat Belanja</h2>
            <Button variant="outline" onClick={() => setViewHistory(false)} className="!py-2 !px-3">
               Kembali
            </Button>
          </div>
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada transaksi.</p>
          ) : (
            <div className="space-y-3">
              {history.map(t => (
                <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{t.sellerName}</p>
                    <p className="text-xs text-gray-500">{new Date(t.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="font-bold text-orange-600">
                    -{formatCurrency(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
  }

  return (
    <div className="p-4 max-w-lg mx-auto relative min-h-[80vh]">
      {/* Balance Card - Changed to Green Gradient */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-2xl shadow-lg p-6 text-white mb-8 relative overflow-hidden">
        {/* Decorative Circle */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
                <p className="text-green-100 text-sm font-medium">Saldo Dompet</p>
                <h2 className="text-3xl font-bold mt-1">{formatCurrency(user.balance)}</h2>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
                <UserIcon size={24} className="text-white" />
            </div>
        </div>
        <p className="text-green-50 text-xs relative z-10">Halo, {user.name}</p>
      </div>

      {/* Main Action - Changed to Orange Theme for Contrast */}
      <div className="grid gap-4">
        <Button 
            onClick={() => { setNotification(null); setIsScanning(true); }} 
            className="flex flex-col items-center justify-center py-8 text-lg gap-3 bg-white text-orange-600 border-2 border-orange-100 hover:bg-orange-50 shadow-sm transition-all"
        >
          <div className="p-4 bg-orange-100 rounded-full text-orange-600">
             <Scan size={32} />
          </div>
          <span className="font-bold">Bayar via QR</span>
        </Button>
        
        <Button variant="secondary" onClick={loadHistory} className="flex items-center justify-center gap-2 py-4">
          <History size={20} /> Riwayat Transaksi
        </Button>
      </div>

      {/* Confirmation Modal */}
      {confirmData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Konfirmasi Pembayaran</h3>
            
            <div className="bg-gray-50 p-4 rounded-xl mb-6 space-y-2 border border-gray-100">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Penerima</span>
                    <span className="font-medium text-gray-900">{confirmData.sellerName}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                    <span className="text-gray-700">Total</span>
                    <span className="text-orange-600">{formatCurrency(confirmData.amount)}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => setConfirmData(null)}>
                    Batal
                </Button>
                <Button variant="primary" onClick={handlePayment}>
                    Ya, Bayar
                </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-4 left-4 right-4 p-4 rounded-xl shadow-lg text-white text-center transform transition-all duration-500 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
            {notification.msg}
            <button onClick={() => setNotification(null)} className="absolute top-2 right-2 opacity-70 hover:opacity-100">×</button>
        </div>
      )}

      {/* Scanner Overlay */}
      {isScanning && (
        <QRScanner 
          onScanSuccess={handleScanSuccess} 
          onCancel={() => setIsScanning(false)} 
        />
      )}
    </div>
  );
};