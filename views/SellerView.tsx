import React, { useState } from 'react';
import { User, QRData, Transaction } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '../App';
import { TransactionService } from '../services/db';
import { History, RefreshCcw } from 'lucide-react';

interface SellerViewProps {
  user: User;
}

export const SellerView: React.FC<SellerViewProps> = ({ user }) => {
  const [amount, setAmount] = useState('');
  const [qrString, setQrString] = useState<string | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [viewHistory, setViewHistory] = useState(false);

  const handleGenerate = () => {
    if (!amount || parseInt(amount) <= 0) return;
    
    const data: QRData = {
      sellerId: user.id,
      sellerName: user.name,
      amount: parseInt(amount),
    };
    
    setQrString(JSON.stringify(data));
  };

  const handleReset = () => {
    setAmount('');
    setQrString(null);
  };

  const loadHistory = () => {
    setHistory(TransactionService.getHistory(user.id));
    setViewHistory(true);
  };

  if (viewHistory) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Riwayat Transaksi</h2>
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
                  <p className="font-semibold text-gray-800">{t.buyerName}</p>
                  <p className="text-xs text-gray-500">{new Date(t.timestamp).toLocaleString()}</p>
                </div>
                <div className="font-bold text-green-600">
                  +{formatCurrency(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 text-center">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Pendapatan</h2>
        <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(user.balance)}</p>
      </div>

      {!qrString ? (
        <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Buat Tagihan Baru</h3>
          <Input
            label="Nominal Pembayaran (Rp)"
            type="number"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="text-lg font-semibold"
          />
          <Button onClick={handleGenerate} fullWidth disabled={!amount}>
            Buat Kode QR
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center animate-fade-in">
          <div className="mb-4 text-center">
            <p className="text-gray-500 text-sm">Tunjukkan QR ini kepada Pembeli</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(parseInt(amount))}</p>
          </div>
          
          <div className="p-4 bg-white border-2 border-gray-100 rounded-xl mb-6">
            <QRCodeSVG value={qrString} size={200} level="H" />
          </div>

          <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={handleReset} fullWidth className="flex items-center justify-center gap-2">
                <RefreshCcw size={18} /> Buat Baru
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8">
        <Button variant="secondary" fullWidth onClick={loadHistory} className="flex items-center justify-center gap-2">
          <History size={20} /> Lihat Riwayat Transaksi
        </Button>
      </div>
    </div>
  );
};