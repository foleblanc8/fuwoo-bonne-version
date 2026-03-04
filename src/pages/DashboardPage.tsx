// src/pages/DashboardPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { JSX } from 'react';
import {
  Calendar, Clock, DollarSign, Star, TrendingUp, AlertCircle,
  CheckCircle, XCircle, User, MessageSquare, Settings, LogOut,
  Plus, Send, Bell, Lock, Trash2, ChevronRight, Camera,
  Phone, MapPin, Mail, Shield, Eye, EyeOff,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

type Booking = {
  id: number;
  service: string;
  provider: string;
  date: string;
  time: string;
  status: BookingStatus;
  price: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusColor(status: BookingStatus): string {
  switch (status) {
    case 'pending':   return 'text-yellow-600 bg-yellow-100';
    case 'confirmed': return 'text-blue-600 bg-blue-100';
    case 'completed': return 'text-green-600 bg-green-100';
    case 'cancelled': return 'text-red-600 bg-red-100';
    default:          return 'text-gray-600 bg-gray-100';
  }
}
function getStatusText(status: BookingStatus): string {
  switch (status) {
    case 'pending':   return 'En attente';
    case 'confirmed': return 'Confirmée';
    case 'completed': return 'Terminée';
    case 'cancelled': return 'Annulée';
    default:          return status;
  }
}
function getStatusIcon(status: BookingStatus): JSX.Element | null {
  switch (status) {
    case 'pending':   return <AlertCircle className="w-4 h-4" />;
    case 'confirmed': return <CheckCircle className="w-4 h-4" />;
    case 'completed': return <CheckCircle className="w-4 h-4" />;
    case 'cancelled': return <XCircle className="w-4 h-4" />;
    default:          return null;
  }
}

// ─── Messages Tab ─────────────────────────────────────────────────────────────

const mockConversations = [
  { id: 1, name: 'Jean Tremblay', avatar: 'JT', service: 'Plomberie', lastMsg: 'Je serai là à 10h demain.', time: '10:32', unread: 2 },
  { id: 2, name: 'Marie Côté',    avatar: 'MC', service: 'Ménage',    lastMsg: 'Merci pour votre confiance!', time: 'Hier', unread: 0 },
  { id: 3, name: 'Luc Gagnon',   avatar: 'LG', service: 'Déneigement', lastMsg: 'Rendez-vous confirmé.', time: 'Lun', unread: 0 },
];

type Message = { id: number; from: 'me' | 'them'; text: string; time: string };

const mockMessages: Record<number, Message[]> = {
  1: [
    { id: 1, from: 'them', text: 'Bonjour! Je confirme notre rendez-vous pour la plomberie.', time: '10:15' },
    { id: 2, from: 'me',   text: 'Parfait, merci! L\'adresse est bien 45 rue des Érables?', time: '10:20' },
    { id: 3, from: 'them', text: 'Oui, exactement. Je serai là à 10h demain.', time: '10:32' },
  ],
  2: [
    { id: 1, from: 'me',   text: 'Bonjour Marie, le ménage était impeccable!', time: 'Hier 14:00' },
    { id: 2, from: 'them', text: 'Merci pour votre confiance!', time: 'Hier 14:10' },
  ],
  3: [
    { id: 1, from: 'them', text: 'Rendez-vous confirmé pour lundi matin.', time: 'Lun 09:00' },
  ],
};

function MessagesTab() {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Record<number, Message[]>>(mockMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedId, messages]);

  const send = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => ({
      ...prev,
      [selectedId]: [
        ...(prev[selectedId] ?? []),
        { id: Date.now(), from: 'me', text: input.trim(), time: now },
      ],
    }));
    setInput('');
  };

  const conv = mockConversations.find(c => c.id === selectedId)!;
  const thread = messages[selectedId] ?? [];

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ height: '72vh' }}>
      <div className="flex h-full">
        {/* Conversation list */}
        <div className="w-72 border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Messages</h2>
          </div>
          <div className="overflow-y-auto flex-1">
            {mockConversations.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left ${selectedId === c.id ? 'bg-coupdemain-primary/5 border-r-2 border-coupdemain-primary' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-coupdemain-primary/15 flex items-center justify-center text-sm font-semibold text-coupdemain-primary shrink-0">
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 text-sm">{c.name}</span>
                    <span className="text-xs text-gray-400">{c.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{c.lastMsg}</p>
                  <p className="text-xs text-coupdemain-primary">{c.service}</p>
                </div>
                {c.unread > 0 && (
                  <span className="w-5 h-5 bg-coupdemain-primary text-white text-xs rounded-full flex items-center justify-center shrink-0">
                    {c.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Thread */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-coupdemain-primary/15 flex items-center justify-center text-sm font-semibold text-coupdemain-primary">
              {conv.avatar}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{conv.name}</p>
              <p className="text-xs text-gray-500">{conv.service}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {thread.map(msg => (
              <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                  msg.from === 'me'
                    ? 'bg-coupdemain-primary text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  <p>{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.from === 'me' ? 'text-white/70' : 'text-gray-400'}`}>{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t flex items-center gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Écrire un message…"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary/40"
            />
            <button
              onClick={send}
              disabled={!input.trim()}
              className="w-9 h-9 bg-coupdemain-primary text-white rounded-xl flex items-center justify-center hover:bg-coupdemain-primary/90 transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name:  user?.last_name  ?? '',
    email:      user?.email      ?? '',
    phone_number: (user as any)?.phone_number ?? '',
    address:    (user as any)?.address ?? '',
    bio:        (user as any)?.bio ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await axios.patch('profile/', form);
      setSaved(true);
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  const initials = [user?.first_name?.[0], user?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || user?.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Photo de profil</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-coupdemain-primary/15 flex items-center justify-center text-2xl font-bold text-coupdemain-primary">
              {initials}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition">
              <Camera className="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
          <div>
            <p className="font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
            <p className="text-sm text-gray-500">@{user?.username}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-coupdemain-primary/10 text-coupdemain-primary font-medium capitalize">
              {user?.role === 'prestataire' ? 'Prestataire' : 'Client'}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <input name="first_name" value={form.first_name} onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <input name="last_name" value={form.last_name} onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary/40" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Mail className="inline w-3.5 h-3.5 mr-1 text-gray-400" />Adresse courriel
          </label>
          <input name="email" type="email" value={form.email} onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary/40" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Phone className="inline w-3.5 h-3.5 mr-1 text-gray-400" />Téléphone
          </label>
          <input name="phone_number" value={form.phone_number} onChange={handleChange}
            placeholder="514-555-0000"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary/40" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="inline w-3.5 h-3.5 mr-1 text-gray-400" />Adresse
          </label>
          <input name="address" value={form.address} onChange={handleChange}
            placeholder="123 Rue des Érables, Montréal"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary/40" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
            placeholder="Quelques mots sur vous…"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary/40 resize-none" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-600">Profil mis à jour avec succès.</p>}

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving}
            className="bg-coupdemain-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition disabled:opacity-60">
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [notifs, setNotifs] = useState({
    email_bookings:  true,
    email_messages:  true,
    email_marketing: false,
    push_reminders:  true,
  });

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext]       = useState(false);
  const [pwSaving, setPwSaving]       = useState(false);
  const [pwMsg, setPwMsg]             = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const toggleNotif = (key: keyof typeof notifs) =>
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      setPwMsg({ type: 'err', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    if (passwords.next.length < 8) {
      setPwMsg({ type: 'err', text: 'Le mot de passe doit contenir au moins 8 caractères.' });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await axios.post('auth/change-password/', {
        old_password: passwords.current,
        new_password: passwords.next,
      });
      setPwMsg({ type: 'ok', text: 'Mot de passe modifié avec succès.' });
      setPasswords({ current: '', next: '', confirm: '' });
    } catch {
      setPwMsg({ type: 'err', text: 'Mot de passe actuel incorrect ou erreur serveur.' });
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-2xl space-y-6">

      {/* Notifications */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        </div>
        <div className="space-y-4">
          {([
            ['email_bookings',  'Réservations par courriel',   'Confirmations et mises à jour de vos réservations'],
            ['email_messages',  'Messages par courriel',        'Nouveaux messages de vos prestataires'],
            ['email_marketing', 'Offres et nouveautés',         'Promotions et nouvelles fonctionnalités'],
            ['push_reminders',  'Rappels de rendez-vous',       'Notification 24h avant chaque prestation'],
          ] as [keyof typeof notifs, string, string][]).map(([key, label, desc]) => (
            <div key={key} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <button
                onClick={() => toggleNotif(key)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${notifs[key] ? 'bg-coupdemain-primary' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notifs[key] ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Sécurité</h2>
        </div>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={passwords.current}
                onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary/40"
                required
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <div className="relative">
              <input
                type={showNext ? 'text' : 'password'}
                value={passwords.next}
                onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary/40"
                required
              />
              <button type="button" onClick={() => setShowNext(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary/40"
              required
            />
          </div>
          {pwMsg && (
            <p className={`text-sm ${pwMsg.type === 'ok' ? 'text-green-600' : 'text-red-600'}`}>{pwMsg.text}</p>
          )}
          <div className="flex justify-end">
            <button type="submit" disabled={pwSaving}
              className="bg-coupdemain-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition disabled:opacity-60">
              {pwSaving ? 'Modification…' : 'Changer le mot de passe'}
            </button>
          </div>
        </form>
      </div>

      {/* Account */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Compte</h2>
        </div>
        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-left"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Se déconnecter</p>
                <p className="text-xs text-gray-500">Fermer votre session sur cet appareil</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <div className="border-t pt-3">
            <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-red-100 hover:bg-red-50 transition text-left">
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-600">Supprimer mon compte</p>
                  <p className="text-xs text-red-400">Cette action est irréversible</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-red-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Client Dashboard ─────────────────────────────────────────────────────────

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings] = useState<Booking[]>([
    { id: 1, service: 'Plomberie — Réparation de fuite', provider: 'Jean Tremblay', date: '2026-04-15', time: '10:00', status: 'confirmed', price: 150 },
    { id: 2, service: 'Ménage résidentiel',              provider: 'Marie Côté',    date: '2026-04-10', time: '14:00', status: 'completed', price: 80 },
  ]);

  const displayName = user?.first_name || user?.username || 'Vous';

  const navItems = [
    { key: 'bookings', label: 'Mes réservations', icon: <Calendar className="w-5 h-5" /> },
    { key: 'messages', label: 'Messages',          icon: <MessageSquare className="w-5 h-5" /> },
    { key: 'profile',  label: 'Mon profil',        icon: <User className="w-5 h-5" /> },
    { key: 'settings', label: 'Paramètres',        icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-sm border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-coupdemain-primary">Coupdemain</h2>
          <p className="text-xs text-gray-500 mt-0.5">Espace Client</p>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm text-left transition ${
                activeTab === item.key
                  ? 'bg-coupdemain-primary/10 text-coupdemain-primary border-r-4 border-coupdemain-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {displayName} 👋</h1>
          <p className="text-gray-500 mt-1 text-sm">Voici un aperçu de votre activité</p>
        </div>

        {/* Stats */}
        {activeTab === 'bookings' && (
          <div className="grid grid-cols-4 gap-5 mb-8">
            {[
              { label: 'Réservations actives', value: bookings.filter(b => b.status === 'confirmed').length, icon: <Calendar className="w-7 h-7 text-blue-400" /> },
              { label: 'Services complétés',   value: bookings.filter(b => b.status === 'completed').length,  icon: <CheckCircle className="w-7 h-7 text-green-400" /> },
              { label: 'Total dépensé',        value: `$${bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.price, 0)}`, icon: <DollarSign className="w-7 h-7 text-yellow-400" /> },
              { label: 'Prestataires favoris', value: 3, icon: <Star className="w-7 h-7 text-purple-400" /> },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
                {card.icon}
              </div>
            ))}
          </div>
        )}

        {/* Bookings tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Mes réservations</h2>
              <button onClick={() => navigate('/services')}
                className="bg-coupdemain-primary text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-coupdemain-primary/90 transition">
                <Plus className="w-4 h-4" />
                Nouvelle réservation
              </button>
            </div>
            <div className="divide-y">
              {bookings.map(b => (
                <div key={b.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{b.service}</p>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{b.provider}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(b.date).toLocaleDateString('fr-CA')}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{b.time}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${b.price}</p>
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs mt-1.5 ${getStatusColor(b.status)}`}>
                        {getStatusIcon(b.status)}
                        {getStatusText(b.status)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-3">
                    {b.status === 'completed' && <button className="text-xs text-coupdemain-primary font-medium hover:underline">Laisser un avis</button>}
                    {b.status === 'completed' && <span className="text-gray-200">•</span>}
                    <button className="text-xs text-coupdemain-primary font-medium hover:underline">Voir les détails</button>
                    {b.status !== 'completed' && b.status !== 'cancelled' && (
                      <><span className="text-gray-200">•</span><button className="text-xs text-red-500 font-medium hover:underline">Annuler</button></>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && <MessagesTab />}
        {activeTab === 'profile'  && <ProfileTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};

// ─── Provider Dashboard (unchanged) ──────────────────────────────────────────

type ProviderBookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
type ProviderBooking = { id: number; client: string; service: string; date: string; time: string; status: ProviderBookingStatus; price: number; address: string };

const ProviderDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings] = useState<ProviderBooking[]>([
    { id: 1, client: 'Alexandre Roy',    service: 'Plomberie — Réparation de fuite', date: '2026-04-15', time: '10:00', status: 'pending',   price: 150, address: '123 Rue Example, Montréal' },
    { id: 2, client: 'Sophie Tremblay', service: 'Installation robinet',             date: '2026-04-15', time: '14:00', status: 'confirmed', price: 200, address: '456 Avenue Test, Laval' },
  ]);
  const stats = { pendingBookings: 3, todayBookings: 2, monthlyRevenue: 3450, rating: 4.8, completionRate: 95 };

  const navItems = [
    { key: 'overview',  label: "Vue d'ensemble", icon: <TrendingUp className="w-5 h-5" /> },
    { key: 'bookings',  label: 'Réservations',   icon: <Calendar className="w-5 h-5" /> },
    { key: 'services',  label: 'Mes services',   icon: <Settings className="w-5 h-5" /> },
    { key: 'messages',  label: 'Messages',       icon: <MessageSquare className="w-5 h-5" /> },
    { key: 'profile',   label: 'Mon profil',     icon: <User className="w-5 h-5" /> },
    { key: 'settings',  label: 'Paramètres',     icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-sm border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-coupdemain-primary">Coupdemain Pro</h2>
          <p className="text-xs text-gray-500 mt-0.5">Espace Prestataire</p>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm text-left transition ${
                activeTab === item.key
                  ? 'bg-coupdemain-primary/10 text-coupdemain-primary border-r-4 border-coupdemain-primary font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {item.icon}{item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition">
            <LogOut className="w-4 h-4" />Déconnexion
          </button>
        </div>
      </div>

      <div className="ml-64 p-8">
        {activeTab === 'overview' && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
              <p className="text-gray-500 mt-1 text-sm">Bonjour, {user?.first_name || user?.username} 👋</p>
            </div>
            <div className="grid grid-cols-5 gap-5 mb-8">
              {[
                { label: 'En attente',    value: stats.pendingBookings,              icon: <AlertCircle className="w-7 h-7 text-yellow-400" /> },
                { label: "Aujourd'hui",   value: stats.todayBookings,                icon: <Calendar className="w-7 h-7 text-blue-400" /> },
                { label: 'Revenus (mois)',value: `$${stats.monthlyRevenue}`,          icon: <DollarSign className="w-7 h-7 text-green-400" /> },
                { label: 'Note moyenne',  value: `${stats.rating}/5`,                icon: <Star className="w-7 h-7 text-yellow-400" /> },
                { label: 'Taux réussite', value: `${stats.completionRate}%`,         icon: <CheckCircle className="w-7 h-7 text-purple-400" /> },
              ].map(c => (
                <div key={c.label} className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between">
                  <div><p className="text-xs text-gray-500">{c.label}</p><p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p></div>
                  {c.icon}
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b"><h2 className="font-semibold text-gray-900">Réservations récentes</h2></div>
              <div className="divide-y">
                {bookings.map(b => (
                  <div key={b.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{b.service}</p>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{b.client}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(b.date).toLocaleDateString('fr-CA')}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{b.time}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{b.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${b.price}</p>
                        {b.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <button className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700 transition">Accepter</button>
                            <button className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs hover:bg-red-200 transition">Refuser</button>
                          </div>
                        )}
                        {b.status === 'confirmed' && <span className="text-blue-600 text-xs">Confirmée</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        {activeTab === 'messages' && <MessagesTab />}
        {activeTab === 'profile'  && <ProfileTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {(activeTab === 'bookings' || activeTab === 'services') && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-400">
            <p className="text-lg font-medium">Section à venir</p>
            <p className="text-sm mt-1">Cette section est en cours de développement.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Export ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  return user?.role === 'prestataire' ? <ProviderDashboard /> : <ClientDashboard />;
}
