import React, { useEffect, useState } from 'react';
import { User, UserRole, Message } from '../types';
import { AdminService, MessageService } from '../services/db';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Trash2, Edit2, Shield, Search, X, Mail, Users, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../App';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'messages'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editRole, setEditRole] = useState<UserRole>(UserRole.BUYER);

  const refreshData = () => {
    setUsers(AdminService.getAllUsers());
    setMessages(MessageService.getAllMessages());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pengguna "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      AdminService.deleteUser(id);
      refreshData();
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditAmount(user.balance.toString());
    setEditRole(user.role);
  };

  const handleSaveUser = () => {
    if (editingUser) {
        // Update Balance
        if (editAmount) {
            AdminService.updateUserBalance(editingUser.id, parseInt(editAmount));
        }
        // Update Role
        if (editRole !== editingUser.role) {
            AdminService.updateUserRole(editingUser.id, editRole);
        }
        
        setEditingUser(null);
        refreshData();
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
                    <Shield size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Panel Admin</h2>
                    <p className="text-sm text-gray-500">Super User Access</p>
                </div>
            </div>
            <button onClick={refreshData} className="p-2 text-gray-400 hover:text-indigo-600">
                <RefreshCw size={20} />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
            <button 
                onClick={() => setActiveTab('users')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'users' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <Users size={16} /> Pengguna
            </button>
            <button 
                onClick={() => setActiveTab('messages')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    activeTab === 'messages' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <Mail size={16} /> Kotak Masuk
            </button>
        </div>

        {activeTab === 'users' && (
            <div className="relative">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Cari nama atau email..." 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            </div>
        )}
      </div>

      {activeTab === 'users' ? (
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
            <div className="text-center py-10 text-white/80">
                Tidak ada pengguna ditemukan.
            </div>
            ) : (
            filteredUsers.map(user => (
                <div key={user.id} className="bg-white rounded-xl p-4 shadow-md border-l-4 border-l-transparent hover:border-l-indigo-500 transition-all flex flex-col gap-3 animate-fade-in">
                <div className="flex justify-between items-start">
                    <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{user.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        user.role === UserRole.BUYER ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                        {user.role}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-1">{user.educationLevel}</p>
                    </div>
                    
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Saldo</p>
                        <p className={`font-bold ${user.role === UserRole.BUYER ? 'text-green-600' : 'text-orange-600'}`}>
                            {formatCurrency(user.balance)}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100 mt-1">
                    <button 
                        onClick={() => openEditModal(user)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                        <Edit2 size={16} /> Edit Data
                    </button>
                    <button 
                        onClick={() => handleDelete(user.id, user.name)}
                        className="flex-none px-4 flex items-center justify-center gap-1 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
                </div>
            ))
            )}
        </div>
      ) : (
          <div className="space-y-3">
              {messages.length === 0 ? (
                  <div className="text-center py-10 text-white/80">Belum ada pesan masuk.</div>
              ) : (
                  messages.map(msg => (
                      <div key={msg.id} className="bg-white rounded-xl p-4 shadow-sm animate-fade-in">
                          <div className="flex justify-between items-start mb-2">
                              <div>
                                  <p className="font-bold text-gray-900">{msg.senderName}</p>
                                  <p className="text-xs text-indigo-500">User ID: {msg.senderId}</p>
                              </div>
                              <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg text-gray-700 text-sm">
                              {msg.content}
                          </div>
                      </div>
                  ))
              )}
          </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
                <button 
                    onClick={() => setEditingUser(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1">Edit Pengguna</h3>
                <p className="text-sm text-gray-500 mb-6">Ubah data untuk {editingUser.name}</p>

                <div className="space-y-4">
                    <Input 
                        label="Jumlah Saldo (Rp)"
                        type="number"
                        value={editAmount}
                        onChange={e => setEditAmount(e.target.value)}
                    />

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">Peran Akun</label>
                        <select 
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                            value={editRole}
                            onChange={e => setEditRole(e.target.value as UserRole)}
                        >
                            <option value={UserRole.BUYER}>Pembeli</option>
                            <option value={UserRole.SELLER}>Penjual</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                    <Button variant="outline" onClick={() => setEditingUser(null)}>Batal</Button>
                    <Button onClick={handleSaveUser}>Simpan</Button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};