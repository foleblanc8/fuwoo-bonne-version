// src/pages/DashboardPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { JSX } from 'react';
import {
  Calendar, Clock, DollarSign, Star, TrendingUp, AlertCircle,
  CheckCircle, XCircle, User, MessageSquare, Settings, LogOut,
  Plus, Send, Bell, Lock, Trash2, ChevronRight, Camera,
  Phone, MapPin, Mail, Shield, Eye, EyeOff,
  ChevronDown, ChevronUp, Edit2, X, Briefcase, LocateFixed, FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBookings } from '../contexts/BookingContext';
import { useNotifications } from '../contexts/NotificationContext';
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

type ServiceRequest = {
  id: number;
  title: string;
  description: string;
  category: { id: number; name: string } | null;
  service_area: string;
  preferred_date: string | null;
  deadline: string | null;
  bid_count: number;
  status: 'open' | 'awarded' | 'closed' | 'cancelled';
  images: { image: string }[];
};

type Bid = {
  id: number;
  service_request: number;
  provider: { id: number; username: string; first_name: string; last_name: string; rating?: number } | null;
  price: string;
  price_unit: string;
  message: string;
  estimated_duration: number | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
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

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const typeLabel: Record<string, string> = {
    booking_request:      'Demande de réservation',
    booking_confirmed:    'Réservation confirmée',
    booking_cancelled:    'Réservation annulée',
    booking_completed:    'Service terminé',
    new_review:           'Nouvel avis',
    new_message:          'Nouveau message',
    new_service_request:  'Nouvelle demande de service',
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-coupdemain-primary hover:underline"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            Aucune notification pour l'instant.
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => { if (!n.is_read) markAsRead(n.id); }}
                className={`p-5 flex gap-4 cursor-pointer transition hover:bg-gray-50 ${!n.is_read ? 'bg-coupdemain-primary/5' : ''}`}
              >
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${!n.is_read ? 'bg-coupdemain-primary' : 'bg-transparent'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                      {typeLabel[n.type] ?? n.type}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {new Date(n.created_at).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{n.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
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
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'denied'>(
    (user as any)?.latitude ? 'success' : 'idle',
  );

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await axios.patch('profile/', {
            latitude:  pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setGeoStatus('success');
        } catch {
          setGeoStatus('denied');
        }
      },
      () => setGeoStatus('denied'),
      { timeout: 8000 },
    );
  };

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
          <div className="flex items-center justify-between mt-2">
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={geoStatus === 'loading'}
              className="flex items-center gap-1.5 text-xs text-coupdemain-primary hover:underline disabled:opacity-50"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              {geoStatus === 'loading' ? 'Localisation…' : 'Utiliser ma position GPS'}
            </button>
            {geoStatus === 'success' && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Position enregistrée
              </span>
            )}
            {geoStatus === 'denied' && (
              <span className="text-xs text-amber-600">Accès refusé par le navigateur</span>
            )}
          </div>
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

// ─── Provider Bookings Tab ────────────────────────────────────────────────────

function ProviderBookingsTab() {
  const { bookings, loading, fetchBookings, confirmBooking, cancelBooking, completeBooking } = useBookings();
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => { fetchBookings('provider'); }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const counts = {
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };
  const revenue = bookings
    .filter(b => b.status === 'completed')
    .reduce((s, b) => s + parseFloat(b.total_price || '0'), 0);

  const doAction = async (id: number, action: () => Promise<void>) => {
    setActionLoading(id);
    try { await action(); await fetchBookings(); } catch { /* silent */ }
    finally { setActionLoading(null); }
  };

  const filterOptions: { key: typeof filter; label: string; count?: number }[] = [
    { key: 'all',       label: 'Toutes',     count: bookings.length },
    { key: 'pending',   label: 'En attente', count: counts.pending },
    { key: 'confirmed', label: 'Confirmées', count: counts.confirmed },
    { key: 'completed', label: 'Terminées',  count: counts.completed },
    { key: 'cancelled', label: 'Annulées' },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        {[
          { label: 'En attente',    value: counts.pending,           icon: <AlertCircle className="w-7 h-7 text-yellow-400" /> },
          { label: 'Confirmées',    value: counts.confirmed,         icon: <CheckCircle  className="w-7 h-7 text-blue-400"   /> },
          { label: 'Terminées',     value: counts.completed,         icon: <CheckCircle  className="w-7 h-7 text-green-400"  /> },
          { label: 'Revenus total', value: `$${revenue.toFixed(0)}`, icon: <DollarSign   className="w-7 h-7 text-green-400"  /> },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{c.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p>
            </div>
            {c.icon}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm">
        {/* Filter bar */}
        <div className="p-4 border-b flex items-center gap-2 flex-wrap">
          {filterOptions.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === f.key ? 'bg-coupdemain-primary text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f.label}
              {f.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filter === f.key ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                }`}>{f.count}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="p-8 text-center text-gray-400 text-sm">Chargement…</p>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Aucune réservation</p>
            <p className="text-sm mt-1">Les nouvelles réservations apparaîtront ici.</p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map(b => {
              const clientName = b.client
                ? [b.client.first_name, b.client.last_name].filter(Boolean).join(' ') || b.client.username
                : '—';
              const serviceTitle = b.service?.title ?? '—';
              const isOpen = expanded === b.id;
              const status = b.status as BookingStatus;
              return (
                <div key={b.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <p className="font-semibold text-gray-900">{serviceTitle}</p>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}{getStatusText(status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{clientName}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(b.date).toLocaleDateString('fr-CA')}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{b.start_time?.slice(0, 5)}</span>
                        {b.service_address && (
                          <span className="flex items-center gap-1 max-w-xs truncate">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />{b.service_address}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="font-bold text-gray-900 text-sm">${parseFloat(b.total_price || '0').toFixed(0)}</p>
                      <button
                        onClick={() => setExpanded(isOpen ? null : b.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                      >
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      {b.client_notes && (
                        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-sm text-amber-900">
                          <span className="font-medium">Note du client : </span>{b.client_notes}
                        </div>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        {b.status === 'pending' && (
                          <>
                            <button
                              disabled={actionLoading === b.id}
                              onClick={() => doAction(b.id, () => confirmBooking(b.id))}
                              className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />Accepter
                            </button>
                            <button
                              disabled={actionLoading === b.id}
                              onClick={() => doAction(b.id, () => cancelBooking(b.id))}
                              className="flex items-center gap-1.5 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-100 transition disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />Refuser
                            </button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <>
                            <button
                              disabled={actionLoading === b.id}
                              onClick={() => doAction(b.id, () => completeBooking(b.id))}
                              className="flex items-center gap-1.5 bg-coupdemain-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-coupdemain-primary/90 transition disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />Marquer comme terminée
                            </button>
                            <button
                              disabled={actionLoading === b.id}
                              onClick={() => doAction(b.id, () => cancelBooking(b.id))}
                              className="flex items-center gap-1.5 text-gray-500 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />Annuler
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Provider Services Tab ────────────────────────────────────────────────────

type ProviderService = {
  id: number;
  title: string;
  description: string;
  category: { id: number; name: string; slug: string } | null;
  price: string;
  price_unit: string;
  duration: number;
  service_area: string;
  max_distance: number;
  instant_booking: boolean;
  is_active: boolean;
  rating: number;
  total_bookings: number;
};

type ServiceForm = {
  title: string; description: string; category_id: string;
  price: string; price_unit: string; duration: string;
  service_area: string; max_distance: string; instant_booking: boolean;
};

const defaultServiceForm: ServiceForm = {
  title: '', description: '', category_id: '', price: '',
  price_unit: 'par heure', duration: '60', service_area: '', max_distance: '25', instant_booking: false,
};

function ProviderServicesTab() {
  const { user } = useAuth();
  const [services, setServices]     = useState<ProviderService[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showModal, setShowModal]   = useState(false);
  const [editId, setEditId]         = useState<number | null>(null);
  const [form, setForm]             = useState<ServiceForm>(defaultServiceForm);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      axios.get(`services/?provider=${user.id}`),
      axios.get('categories/'),
    ]).then(([sRes, cRes]) => {
      const sd = sRes.data as any;
      setServices(Array.isArray(sd) ? sd : (sd.results ?? []));
      const cd = cRes.data as any;
      setCategories(Array.isArray(cd) ? cd : (cd.results ?? []));
    }).finally(() => setLoading(false));
  }, [user?.id, refreshKey]);

  const openCreate = () => { setForm(defaultServiceForm); setEditId(null); setShowModal(true); };
  const openEdit = (s: ProviderService) => {
    setForm({
      title: s.title, description: s.description,
      category_id: String(s.category?.id ?? ''),
      price: s.price, price_unit: s.price_unit,
      duration: String(s.duration), service_area: s.service_area,
      max_distance: String(s.max_distance), instant_booking: s.instant_booking,
    });
    setEditId(s.id);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title, description: form.description,
      ...(form.category_id ? { category_id: parseInt(form.category_id) } : {}),
      price: parseFloat(form.price),
      price_unit: form.price_unit,
      duration: parseInt(form.duration) || 60,
      service_area: form.service_area,
      max_distance: parseInt(form.max_distance) || 25,
      instant_booking: form.instant_booking,
    };
    try {
      if (editId) {
        await axios.patch(`services/${editId}/`, payload);
      } else {
        await axios.post('services/', payload);
      }
      setShowModal(false);
      setRefreshKey(k => k + 1);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  const toggleActive = async (s: ProviderService) => {
    await axios.patch(`services/${s.id}/`, { is_active: !s.is_active });
    setServices(prev => prev.map(x => x.id === s.id ? { ...x, is_active: !x.is_active } : x));
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce service définitivement ?')) return;
    setDeleting(id);
    try {
      await axios.delete(`services/${id}/`);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch { /* silent */ }
    finally { setDeleting(null); }
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary/40';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mes services</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {services.length} service{services.length !== 1 ? 's' : ''} créé{services.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-coupdemain-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition"
        >
          <Plus className="w-4 h-4" />Ajouter un service
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm py-12">Chargement…</p>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-700 font-semibold text-lg">Aucun service pour l'instant</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">Créez votre premier service pour recevoir des réservations.</p>
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 bg-coupdemain-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition">
            <Plus className="w-4 h-4" />Créer un service
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map(s => (
            <div key={s.id} className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-coupdemain-primary/10 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6 text-coupdemain-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-semibold text-gray-900">{s.title}</p>
                  {s.category && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{s.category.name}</span>
                  )}
                  {!s.is_active && (
                    <span className="text-xs px-2 py-0.5 bg-red-50 text-red-500 rounded-full">Inactif</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate mb-2">{s.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                  <span className="font-semibold text-gray-800">
                    ${parseFloat(s.price).toFixed(2)} <span className="font-normal">{s.price_unit}</span>
                  </span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{s.duration} min</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{s.service_area}</span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    {parseFloat(String(s.rating)).toFixed(1)}
                  </span>
                  <span>{s.total_bookings} réservation{s.total_bookings !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-medium ${s.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                    {s.is_active ? 'Actif' : 'Inactif'}
                  </span>
                  <button
                    onClick={() => toggleActive(s)}
                    className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${s.is_active ? 'bg-green-500' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${s.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <button onClick={() => openEdit(s)}
                  className="p-2 text-gray-400 hover:text-coupdemain-primary hover:bg-coupdemain-primary/5 rounded-lg transition">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900">
                {editId ? 'Modifier le service' : 'Nouveau service'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input required value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Ex: Plomberie résidentielle" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea required rows={3} value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Décrivez vos services, votre expérience…"
                  className={inputCls + ' resize-none'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select value={form.category_id}
                  onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                  className={inputCls}>
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix ($) *</label>
                  <input required type="number" min="0" step="0.01" value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="75.00" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select value={form.price_unit}
                    onChange={e => setForm(p => ({ ...p, price_unit: e.target.value }))}
                    className={inputCls}>
                    <option value="par heure">Par heure</option>
                    <option value="par visite">Par visite</option>
                    <option value="par jour">Par jour</option>
                    <option value="forfait">Forfait</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée (min)</label>
                  <input type="number" min="15" step="15" value={form.duration}
                    onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zone de service</label>
                  <input value={form.service_area}
                    onChange={e => setForm(p => ({ ...p, service_area: e.target.value }))}
                    placeholder="Montréal, Laval…" className={inputCls} />
                </div>
              </div>
              <div className="flex items-center justify-between py-3 px-4 border border-gray-100 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-900">Réservation instantanée</p>
                  <p className="text-xs text-gray-500 mt-0.5">Les clients réservent sans confirmation manuelle</p>
                </div>
                <button type="button"
                  onClick={() => setForm(p => ({ ...p, instant_booking: !p.instant_booking }))}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.instant_booking ? 'bg-coupdemain-primary' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.instant_booking ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                  Annuler
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-coupdemain-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition disabled:opacity-60">
                  {saving ? 'Enregistrement…' : editId ? 'Mettre à jour' : 'Créer le service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Provider Requests Tab ────────────────────────────────────────────────────

function ProviderRequestsTab() {
  const [requests, setRequests]       = useState<ServiceRequest[]>([]);
  const [submittedIds, setSubmittedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading]         = useState(true);
  const [bidModal, setBidModal]       = useState<ServiceRequest | null>(null);
  const [bidForm, setBidForm]         = useState({ price: '', price_unit: 'par projet', message: '', estimated_duration: '' });
  const [submitting, setSubmitting]   = useState(false);

  useEffect(() => {
    Promise.all([
      axios.get('service-requests/'),
      axios.get('bids/'),
    ]).then(([rRes, bRes]) => {
      const rd = rRes.data as any;
      setRequests(Array.isArray(rd) ? rd : (rd.results ?? []));
      const bd = bRes.data as any;
      const bids: Bid[] = Array.isArray(bd) ? bd : (bd.results ?? []);
      setSubmittedIds(new Set(bids.map(b => b.service_request)));
    }).finally(() => setLoading(false));
  }, []);

  const openBidModal = (req: ServiceRequest) => {
    setBidForm({ price: '', price_unit: 'par projet', message: '', estimated_duration: '' });
    setBidModal(req);
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidModal) return;
    setSubmitting(true);
    try {
      await axios.post('bids/', {
        service_request: bidModal.id,
        price: parseFloat(bidForm.price),
        price_unit: bidForm.price_unit,
        message: bidForm.message,
        ...(bidForm.estimated_duration ? { estimated_duration: parseInt(bidForm.estimated_duration) } : {}),
      });
      setSubmittedIds(prev => new Set(prev).add(bidModal.id));
      setBidModal(null);
    } catch { /* silent */ }
    finally { setSubmitting(false); }
  };

  const reqStatusBadge = (s: string) =>
    s === 'open' ? 'text-green-700 bg-green-100' : s === 'awarded' ? 'text-blue-700 bg-blue-100' : 'text-gray-600 bg-gray-100';
  const reqStatusLabel = (s: string) =>
    ({ open: 'Ouvert', awarded: 'Attribué', closed: 'Fermé', cancelled: 'Annulé' }[s] ?? s);

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary/40';

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Demandes ouvertes</h2>
        <p className="text-sm text-gray-500 mt-0.5">Soumissionnez sur les demandes qui correspondent à vos services.</p>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm py-12">Chargement…</p>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-700 font-semibold text-lg">Aucune demande ouverte</p>
          <p className="text-gray-400 text-sm mt-1">Les nouvelles demandes apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const alreadyBid = submittedIds.has(req.id);
            return (
              <div key={req.id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex items-start gap-4">
                  {req.images?.[0] && (
                    <img src={req.images[0].image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-gray-900">{req.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${reqStatusBadge(req.status)}`}>
                        {reqStatusLabel(req.status)}
                      </span>
                      {req.category && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{req.category.name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap mt-1">
                      {req.service_area && (
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{req.service_area}</span>
                      )}
                      {req.preferred_date && (
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Souhaité : {new Date(req.preferred_date).toLocaleDateString('fr-CA')}</span>
                      )}
                      {req.deadline && (
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Limite : {new Date(req.deadline).toLocaleDateString('fr-CA')}</span>
                      )}
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{req.bid_count} offre{req.bid_count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {alreadyBid ? (
                      <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />Offre envoyée
                      </span>
                    ) : (
                      <button
                        onClick={() => openBidModal(req)}
                        disabled={req.status !== 'open'}
                        className="flex items-center gap-2 bg-coupdemain-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition disabled:opacity-40"
                      >
                        <Send className="w-4 h-4" />Soumettre une offre
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bid Modal */}
      {bidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">Soumettre une offre</h3>
              <button onClick={() => setBidModal(null)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-b">
              <p className="text-sm font-medium text-gray-900">{bidModal.title}</p>
              {bidModal.service_area && (
                <p className="text-xs text-gray-500 mt-0.5"><MapPin className="inline w-3 h-3 mr-0.5" />{bidModal.service_area}</p>
              )}
            </div>
            <form onSubmit={handleBidSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix ($) *</label>
                  <input required type="number" min="0" step="0.01" value={bidForm.price}
                    onChange={e => setBidForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="150.00" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select value={bidForm.price_unit}
                    onChange={e => setBidForm(p => ({ ...p, price_unit: e.target.value }))}
                    className={inputCls}>
                    <option value="par projet">Par projet</option>
                    <option value="par heure">Par heure</option>
                    <option value="par jour">Par jour</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea required rows={3} value={bidForm.message}
                  onChange={e => setBidForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Décrivez votre approche, votre expérience…"
                  className={inputCls + ' resize-none'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durée estimée (heures, optionnel)</label>
                <input type="number" min="1" value={bidForm.estimated_duration}
                  onChange={e => setBidForm(p => ({ ...p, estimated_duration: e.target.value }))}
                  placeholder="Ex: 3" className={inputCls} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setBidModal(null)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                  Annuler
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-coupdemain-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition disabled:opacity-60">
                  {submitting ? 'Envoi…' : 'Envoyer mon offre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Client Requests Tab ──────────────────────────────────────────────────────

function ClientRequestsTab() {
  const [requests, setRequests]       = useState<ServiceRequest[]>([]);
  const [loading, setLoading]         = useState(true);
  const [expandedId, setExpandedId]   = useState<number | null>(null);
  const [bids, setBids]               = useState<Record<number, Bid[]>>({});
  const [bidsLoading, setBidsLoading] = useState<number | null>(null);
  const [accepting, setAccepting]     = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('service-requests/');
        const d = res.data as any;
        setRequests(Array.isArray(d) ? d : (d.results ?? []));
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  const toggleRequest = async (req: ServiceRequest) => {
    if (expandedId === req.id) { setExpandedId(null); return; }
    setExpandedId(req.id);
    if (!bids[req.id]) {
      setBidsLoading(req.id);
      try {
        const res = await axios.get(`bids/?service_request=${req.id}`);
        const d = res.data as any;
        setBids(prev => ({ ...prev, [req.id]: Array.isArray(d) ? d : (d.results ?? []) }));
      } catch { /* silent */ }
      finally { setBidsLoading(null); }
    }
  };

  const acceptBid = async (bidId: number, reqId: number) => {
    setAccepting(bidId);
    try {
      await axios.post(`bids/${bidId}/accept/`);
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'awarded' } : r));
      setBids(prev => ({
        ...prev,
        [reqId]: (prev[reqId] ?? []).map(b =>
          b.id === bidId ? { ...b, status: 'accepted' } : { ...b, status: 'rejected' }
        ),
      }));
    } catch { /* silent */ }
    finally { setAccepting(null); }
  };

  const reqStatusBadge = (s: string) =>
    ({ open: 'text-green-700 bg-green-100', awarded: 'text-blue-700 bg-blue-100', cancelled: 'text-red-600 bg-red-100' }[s] ?? 'text-gray-600 bg-gray-100');
  const reqStatusLabel = (s: string) =>
    ({ open: 'Ouvert', awarded: 'Attribué', closed: 'Fermé', cancelled: 'Annulé' }[s] ?? s);
  const bidStatusBadge = (s: string) =>
    ({ pending: 'text-yellow-700 bg-yellow-100', accepted: 'text-green-700 bg-green-100', rejected: 'text-red-600 bg-red-100' }[s] ?? 'text-gray-600 bg-gray-100');
  const bidStatusLabel = (s: string) =>
    ({ pending: 'En attente', accepted: 'Acceptée', rejected: 'Refusée' }[s] ?? s);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Mes demandes</h2>
        <p className="text-sm text-gray-500 mt-0.5">Consultez les offres reçues et acceptez celle qui vous convient.</p>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm py-12">Chargement…</p>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-700 font-semibold text-lg">Aucune demande</p>
          <p className="text-gray-400 text-sm mt-1">Vos demandes de service apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const isOpen = expandedId === req.id;
            const reqBids = bids[req.id] ?? [];
            return (
              <div key={req.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleRequest(req)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-gray-900">{req.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${reqStatusBadge(req.status)}`}>
                        {reqStatusLabel(req.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      {req.deadline && (
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Limite : {new Date(req.deadline).toLocaleDateString('fr-CA')}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />{req.bid_count} offre{req.bid_count !== 1 ? 's' : ''} reçue{req.bid_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 p-5 space-y-3">
                    {bidsLoading === req.id ? (
                      <p className="text-center text-gray-400 text-sm py-4">Chargement des offres…</p>
                    ) : reqBids.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-4">Aucune offre reçue pour l'instant.</p>
                    ) : (
                      reqBids.map(bid => {
                        const providerName = bid.provider
                          ? [bid.provider.first_name, bid.provider.last_name].filter(Boolean).join(' ') || bid.provider.username
                          : '—';
                        return (
                          <div key={bid.id} className="border border-gray-100 rounded-xl p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <p className="font-semibold text-gray-900 text-sm">{providerName}</p>
                                  {bid.provider?.rating !== undefined && (
                                    <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                      {Number(bid.provider.rating).toFixed(1)}
                                    </span>
                                  )}
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bidStatusBadge(bid.status)}`}>
                                    {bidStatusLabel(bid.status)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{bid.message}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                  <span className="font-semibold text-gray-800">
                                    ${parseFloat(bid.price).toFixed(2)} <span className="font-normal">{bid.price_unit}</span>
                                  </span>
                                  {bid.estimated_duration && (
                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{bid.estimated_duration}h estimées</span>
                                  )}
                                </div>
                              </div>
                              {req.status === 'open' && bid.status === 'pending' && (
                                <button
                                  onClick={() => acceptBid(bid.id, req.id)}
                                  disabled={accepting === bid.id}
                                  className="shrink-0 flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  {accepting === bid.id ? 'Acceptation…' : 'Accepter'}
                                </button>
                              )}
                              {bid.status === 'accepted' && (
                                <span className="shrink-0 flex items-center gap-1.5 text-green-600 text-sm font-semibold">
                                  <CheckCircle className="w-4 h-4" />Offre acceptée
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard unifié ─────────────────────────────────────────────────────────

type ProviderBookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
type ProviderBooking = { id: number; client: string; service: string; date: string; time: string; status: ProviderBookingStatus; price: number; address: string };
type Mode = 'client' | 'provider';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const [activeMode, setActiveMode] = useState<Mode>(() => {
    const saved = localStorage.getItem('dashboard_mode') as Mode | null;
    if (saved === 'provider' && user?.has_provider_profile) return 'provider';
    return 'client';
  });

  const [activeTab, setActiveTab] = useState(() =>
    activeMode === 'provider' ? 'overview' : 'bookings'
  );

  const switchMode = (mode: Mode) => {
    setActiveMode(mode);
    localStorage.setItem('dashboard_mode', mode);
    setActiveTab(mode === 'provider' ? 'overview' : 'bookings');
  };

  const isProviderMode = activeMode === 'provider' && !!user?.has_provider_profile;
  const displayName = user?.first_name || user?.username || 'Vous';

  const notifIcon = (
    <span className="relative">
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </span>
  );

  const clientNavItems = [
    { key: 'bookings',      label: 'Mes réservations', icon: <Calendar className="w-5 h-5" /> },
    { key: 'requests',      label: 'Mes demandes',     icon: <FileText className="w-5 h-5" /> },
    { key: 'messages',      label: 'Messages',          icon: <MessageSquare className="w-5 h-5" /> },
    { key: 'notifications', label: 'Notifications',    icon: notifIcon },
    { key: 'profile',       label: 'Mon profil',        icon: <User className="w-5 h-5" /> },
    { key: 'settings',      label: 'Paramètres',        icon: <Settings className="w-5 h-5" /> },
  ];

  const providerNavItems = [
    { key: 'overview',      label: "Vue d'ensemble",   icon: <TrendingUp className="w-5 h-5" /> },
    { key: 'bookings',      label: 'Réservations',     icon: <Calendar className="w-5 h-5" /> },
    { key: 'services',      label: 'Mes services',     icon: <Briefcase className="w-5 h-5" /> },
    { key: 'requests',      label: 'Demandes',         icon: <FileText className="w-5 h-5" /> },
    { key: 'messages',      label: 'Messages',          icon: <MessageSquare className="w-5 h-5" /> },
    { key: 'notifications', label: 'Notifications',    icon: notifIcon },
    { key: 'profile',       label: 'Mon profil',        icon: <User className="w-5 h-5" /> },
    { key: 'settings',      label: 'Paramètres',        icon: <Settings className="w-5 h-5" /> },
  ];

  const navItems = isProviderMode ? providerNavItems : clientNavItems;

  // Données mock — client
  const [clientBookings] = useState<Booking[]>([
    { id: 1, service: 'Plomberie — Réparation de fuite', provider: 'Jean Tremblay', date: '2026-04-15', time: '10:00', status: 'confirmed', price: 150 },
    { id: 2, service: 'Ménage résidentiel',              provider: 'Marie Côté',    date: '2026-04-10', time: '14:00', status: 'completed', price: 80 },
  ]);

  // Données mock — vue d'ensemble prestataire
  const stats = { pendingBookings: 3, todayBookings: 2, monthlyRevenue: 3450, rating: 4.8, completionRate: 95 };
  const [overviewBookings] = useState<ProviderBooking[]>([
    { id: 1, client: 'Alexandre Roy',   service: 'Plomberie — Réparation de fuite', date: '2026-04-15', time: '10:00', status: 'pending',   price: 150, address: '123 Rue Example, Montréal' },
    { id: 2, client: 'Sophie Tremblay', service: 'Installation robinet',             date: '2026-04-15', time: '14:00', status: 'confirmed', price: 200, address: '456 Avenue Test, Laval' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-sm border-r border-gray-100 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-coupdemain-primary">Coupdemain</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {isProviderMode ? 'Espace Prestataire' : 'Espace Client'}
          </p>
        </div>

        {/* Toggle Client / Prestataire */}
        {user?.has_provider_profile && (
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => switchMode('client')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                  !isProviderMode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >Client</button>
              <button
                onClick={() => switchMode('provider')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isProviderMode ? 'bg-white shadow-sm text-coupdemain-primary' : 'text-gray-500 hover:text-gray-700'
                }`}
              >Prestataire</button>
            </div>
          </div>
        )}

        <nav className="flex-1 py-4 overflow-y-auto">
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

          {/* CTA activation profil prestataire */}
          {!user?.has_provider_profile && (
            <div className="mx-4 mt-6 p-3 bg-coupdemain-primary/5 rounded-xl border border-coupdemain-primary/20">
              <p className="text-xs font-semibold text-coupdemain-primary mb-1">Vous offrez des services ?</p>
              <p className="text-xs text-gray-500 mb-2">Activez votre profil prestataire pour proposer vos compétences.</p>
              <button
                onClick={async () => {
                  try {
                    await import('axios').then(m => m.default.post('become-provider/'));
                    window.location.reload();
                  } catch { /* silent */ }
                }}
                className="w-full bg-coupdemain-primary text-white text-xs py-1.5 rounded-lg font-semibold hover:bg-coupdemain-primary/90 transition"
              >Activer le mode Pro</button>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition">
            <LogOut className="w-4 h-4" />Déconnexion
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bonjour, {displayName} 👋</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isProviderMode ? 'Tableau de bord prestataire' : 'Voici un aperçu de votre activité'}
          </p>
        </div>

        {/* ── MODE CLIENT ── */}
        {!isProviderMode && activeTab === 'bookings' && (
          <>
            <div className="grid grid-cols-4 gap-5 mb-8">
              {[
                { label: 'Réservations actives', value: clientBookings.filter(b => b.status === 'confirmed').length, icon: <Calendar className="w-7 h-7 text-blue-400" /> },
                { label: 'Services complétés',   value: clientBookings.filter(b => b.status === 'completed').length,  icon: <CheckCircle className="w-7 h-7 text-green-400" /> },
                { label: 'Total dépensé',        value: `$${clientBookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.price, 0)}`, icon: <DollarSign className="w-7 h-7 text-yellow-400" /> },
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
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Mes réservations</h2>
                <button onClick={() => navigate('/services')}
                  className="bg-coupdemain-primary text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-coupdemain-primary/90 transition">
                  <Plus className="w-4 h-4" />Nouvelle réservation
                </button>
              </div>
              <div className="divide-y">
                {clientBookings.map(b => (
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
                          {getStatusIcon(b.status)}{getStatusText(b.status)}
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
          </>
        )}
        {!isProviderMode && activeTab === 'requests'      && <ClientRequestsTab />}
        {!isProviderMode && activeTab === 'messages'      && <MessagesTab />}
        {!isProviderMode && activeTab === 'notifications' && <NotificationsTab />}
        {!isProviderMode && activeTab === 'profile'       && <ProfileTab />}
        {!isProviderMode && activeTab === 'settings'      && <SettingsTab />}

        {/* ── MODE PRESTATAIRE ── */}
        {isProviderMode && activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-5 gap-5 mb-8">
              {[
                { label: 'En attente',     value: stats.pendingBookings,      icon: <AlertCircle className="w-7 h-7 text-yellow-400" /> },
                { label: "Aujourd'hui",    value: stats.todayBookings,        icon: <Calendar className="w-7 h-7 text-blue-400" /> },
                { label: 'Revenus (mois)', value: `$${stats.monthlyRevenue}`, icon: <DollarSign className="w-7 h-7 text-green-400" /> },
                { label: 'Note moyenne',   value: `${stats.rating}/5`,        icon: <Star className="w-7 h-7 text-yellow-400" /> },
                { label: 'Taux réussite',  value: `${stats.completionRate}%`, icon: <CheckCircle className="w-7 h-7 text-purple-400" /> },
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
                {overviewBookings.map(b => (
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
        {isProviderMode && activeTab === 'bookings'      && <ProviderBookingsTab />}
        {isProviderMode && activeTab === 'services'      && <ProviderServicesTab />}
        {isProviderMode && activeTab === 'requests'      && <ProviderRequestsTab />}
        {isProviderMode && activeTab === 'messages'      && <MessagesTab />}
        {isProviderMode && activeTab === 'notifications' && <NotificationsTab />}
        {isProviderMode && activeTab === 'profile'       && <ProfileTab />}
        {isProviderMode && activeTab === 'settings'      && <SettingsTab />}
      </div>
    </div>
  );
}
