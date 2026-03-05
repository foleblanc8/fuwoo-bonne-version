// src/pages/DashboardPage.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { JSX } from 'react';
import {
  Calendar, Clock, DollarSign, Star, TrendingUp, AlertCircle,
  CheckCircle, XCircle, User, MessageSquare, Settings, LogOut,
  Plus, Send, Bell, Lock, Trash2, ChevronRight, Camera,
  Phone, MapPin, Mail, Shield, Eye, EyeOff,
  ChevronDown, ChevronUp, Edit2, X, Briefcase, LocateFixed, FileText, Menu,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBookings } from '../contexts/BookingContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useToast } from '../contexts/ToastContext';
import { StatCardSkeleton, BookingCardSkeleton, ServiceCardSkeleton } from '../components/Skeleton';
import axios from 'axios';

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';


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

type ApiBooking = {
  id: number;
  service: { id: number; title: string; price: string } | null;
  provider: { id: number; first_name: string; last_name: string; username: string } | null;
  client:   { id: number; first_name: string; last_name: string; username: string } | null;
  date: string;
  start_time: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  total_price: string;
  service_address: string;
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

function MessagesTab() {
  const { user } = useAuth();
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [input, setInput]   = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await axios.get('messages/');
      const d = res.data as any;
      setAllMessages(Array.isArray(d) ? d : (d.results ?? []));
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMessages(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedUserId, allMessages]);

  // Group messages by conversation partner
  const conversations = useMemo(() => {
    const map = new Map<number, { partner: any; lastMsg: any; unread: number }>();
    allMessages.forEach(msg => {
      const isMe = msg.sender?.id === user?.id;
      const partner = isMe ? msg.receiver : msg.sender;
      if (!partner) return;
      const existing = map.get(partner.id);
      const isNewer = !existing || new Date(msg.created_at) > new Date(existing.lastMsg.created_at);
      map.set(partner.id, {
        partner,
        lastMsg: isNewer ? msg : existing!.lastMsg,
        unread: (existing?.unread ?? 0) + (!isMe && !msg.is_read ? 1 : 0),
      });
    });
    return [...map.values()].sort(
      (a, b) => new Date(b.lastMsg.created_at).getTime() - new Date(a.lastMsg.created_at).getTime()
    );
  }, [allMessages, user?.id]);

  const thread = useMemo(() =>
    allMessages
      .filter(m => m.sender?.id === selectedUserId || m.receiver?.id === selectedUserId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [allMessages, selectedUserId]
  );

  const selectedConv = conversations.find(c => c.partner.id === selectedUserId);

  const send = async () => {
    if (!input.trim() || !selectedUserId || sending) return;
    setSending(true);
    try {
      const res = await axios.post('messages/', { receiver: selectedUserId, content: input.trim() });
      setAllMessages(prev => [...prev, res.data]);
      setInput('');
    } catch { /* silent */ }
    finally { setSending(false); }
  };

  if (loading) return <p className="text-center text-gray-400 text-sm py-12">Chargement…</p>;

  const convListCls = selectedUserId
    ? 'hidden md:flex w-full md:w-72 border-r flex-col'
    : 'flex w-full md:w-72 border-r flex-col';

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 130px)' }}>
      <div className="flex h-full">
        {/* Conversation list */}
        <div className={convListCls}>
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Messages</h2>
          </div>
          <div className="overflow-y-auto flex-1">
            {conversations.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">Aucun message</p>
            ) : conversations.map(c => {
              const initials = `${c.partner.first_name?.[0] ?? ''}${c.partner.last_name?.[0] ?? c.partner.username?.[0] ?? ''}`.toUpperCase();
              const isMe = c.lastMsg.sender?.id === user?.id;
              return (
                <button
                  key={c.partner.id}
                  onClick={() => setSelectedUserId(c.partner.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left ${selectedUserId === c.partner.id ? 'bg-coupdemain-primary/5 border-r-2 border-coupdemain-primary' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-coupdemain-primary/15 flex items-center justify-center text-sm font-semibold text-coupdemain-primary shrink-0">
                    {initials || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 text-sm">
                        {c.partner.first_name} {c.partner.last_name || c.partner.username}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(c.lastMsg.created_at).toLocaleDateString('fr-CA', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {isMe ? 'Vous : ' : ''}{c.lastMsg.content}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-5 h-5 bg-coupdemain-primary text-white text-xs rounded-full flex items-center justify-center shrink-0">
                      {c.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Thread */}
        {selectedConv ? (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-4 py-3 border-b flex items-center gap-3">
              {/* Back button — mobile only */}
              <button onClick={() => setSelectedUserId(null)} className="md:hidden text-gray-500 hover:text-gray-700 mr-1">
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <div className="w-9 h-9 rounded-full bg-coupdemain-primary/15 flex items-center justify-center text-sm font-semibold text-coupdemain-primary shrink-0">
                {`${selectedConv.partner.first_name?.[0] ?? ''}${selectedConv.partner.last_name?.[0] ?? ''}`.toUpperCase() || '?'}
              </div>
              <p className="font-semibold text-gray-900 text-sm">
                {selectedConv.partner.first_name} {selectedConv.partner.last_name || selectedConv.partner.username}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-3">
              {thread.map(msg => {
                const fromMe = msg.sender?.id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] md:max-w-md px-4 py-2 rounded-2xl text-sm ${
                      fromMe ? 'bg-coupdemain-primary text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${fromMe ? 'text-white/70' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="px-4 py-3 border-t flex items-center gap-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Écrire un message…"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary/40"
              />
              <button onClick={send} disabled={!input.trim() || sending}
                className="w-9 h-9 bg-coupdemain-primary text-white rounded-xl flex items-center justify-center hover:bg-coupdemain-primary/90 transition disabled:opacity-40">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-gray-400 text-sm">
            Sélectionnez une conversation
          </div>
        )}
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
  const { showToast } = useToast();
  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name:  user?.last_name  ?? '',
    email:      user?.email      ?? '',
    phone_number: (user as any)?.phone_number ?? '',
    address:    (user as any)?.address ?? '',
    bio:        (user as any)?.bio ?? '',
  });
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState('');
  const [uploading, setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    (user as any)?.profile_picture ?? null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'denied'>(
    (user as any)?.latitude ? 'success' : 'idle',
  );

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation locale
    if (!file.type.startsWith('image/')) {
      setUploadError('Veuillez sélectionner une image (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La photo ne doit pas dépasser 5 Mo.');
      return;
    }

    // Aperçu immédiat
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setUploadError('');
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('profile_picture', file);
      const res = await axios.patch('profile/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updatedUser = res.data as any;
      // Remplacer le blob par l'URL serveur
      setPreviewUrl(updatedUser.profile_picture ?? localUrl);
      // Synchroniser localStorage
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.profile_picture = updatedUser.profile_picture;
        localStorage.setItem('user', JSON.stringify(parsed));
      }
    } catch {
      setUploadError("Échec de l'envoi. Veuillez réessayer.");
      setPreviewUrl((user as any)?.profile_picture ?? null);
    } finally {
      setUploading(false);
      // Réinitialiser l'input pour permettre de re-sélectionner le même fichier
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
      showToast('Profil mis à jour avec succès.');
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
      showToast('Erreur lors de la mise à jour du profil.', 'error');
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
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Photo de profil"
                className={`w-20 h-20 rounded-full object-cover border-2 border-gray-100 ${uploading ? 'opacity-50' : ''}`}
              />
            ) : (
              <div className={`w-20 h-20 rounded-full bg-coupdemain-primary/15 flex items-center justify-center text-2xl font-bold text-coupdemain-primary ${uploading ? 'opacity-50' : ''}`}>
                {initials}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full">
                <div className="w-5 h-5 border-2 border-coupdemain-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <button
              type="button"
              onClick={handlePhotoClick}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
            >
              <Camera className="w-3.5 h-3.5 text-gray-600" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <div>
            <p className="font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
            <p className="text-sm text-gray-500">@{user?.username}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-coupdemain-primary/10 text-coupdemain-primary font-medium capitalize">
              {user?.role === 'prestataire' ? 'Prestataire' : 'Client'}
            </span>
            <p className="text-xs text-gray-400 mt-2">JPG, PNG ou WebP — max 5 Mo</p>
            {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
            {uploading && <p className="text-xs text-coupdemain-primary mt-1">Envoi en cours…</p>}
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
  const { showToast } = useToast();
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

  const doAction = async (id: number, action: () => Promise<void>, successMsg: string) => {
    setActionLoading(id);
    try { await action(); await fetchBookings(); showToast(successMsg); }
    catch { showToast('Une erreur est survenue.', 'error'); }
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
        {loading ? (
          [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          [
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
          ))
        )}
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
          <div className="divide-y">
            {[...Array(3)].map((_, i) => <BookingCardSkeleton key={i} />)}
          </div>
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
                              onClick={() => doAction(b.id, () => confirmBooking(b.id), 'Réservation confirmée.')}
                              className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />Accepter
                            </button>
                            <button
                              disabled={actionLoading === b.id}
                              onClick={() => doAction(b.id, () => cancelBooking(b.id), 'Réservation refusée.')}
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
                              onClick={() => doAction(b.id, () => completeBooking(b.id), 'Service marqué comme terminé.')}
                              className="flex items-center gap-1.5 bg-coupdemain-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-coupdemain-primary/90 transition disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />Marquer comme terminée
                            </button>
                            <button
                              disabled={actionLoading === b.id}
                              onClick={() => doAction(b.id, () => cancelBooking(b.id), 'Réservation annulée.')}
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

type ServiceImage = { id: number; image: string; is_primary: boolean };

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
  images: ServiceImage[];
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
  const { showToast } = useToast();
  const [services, setServices]     = useState<ProviderService[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showModal, setShowModal]   = useState(false);
  const [editId, setEditId]         = useState<number | null>(null);
  const [form, setForm]             = useState<ServiceForm>(defaultServiceForm);
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState('');
  const [deleting, setDeleting]     = useState<number | null>(null);
  // Images
  const [existingImages, setExistingImages] = useState<ServiceImage[]>([]);
  const [pendingFiles, setPendingFiles]     = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const [deletingImg, setDeletingImg]       = useState<number | null>(null);
  const imgInputRef = useRef<HTMLInputElement>(null);

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

  const resetImageState = () => {
    setPendingFiles([]);
    setPendingPreviews([]);
    setExistingImages([]);
  };

  const openCreate = () => {
    setForm(defaultServiceForm);
    setEditId(null);
    setSaveError('');
    resetImageState();
    setShowModal(true);
  };

  const openEdit = (s: ProviderService) => {
    setForm({
      title: s.title, description: s.description,
      category_id: String(s.category?.id ?? ''),
      price: s.price, price_unit: s.price_unit,
      duration: String(s.duration), service_area: s.service_area,
      max_distance: String(s.max_distance), instant_booking: s.instant_booking,
    });
    setEditId(s.id);
    setSaveError('');
    setExistingImages(s.images ?? []);
    setPendingFiles([]);
    setPendingPreviews([]);
    setShowModal(true);
  };

  const handleImgSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPendingFiles(prev => [...prev, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setPendingPreviews(prev => [...prev, ...previews]);
    if (imgInputRef.current) imgInputRef.current.value = '';
  };

  const removePending = (i: number) => {
    URL.revokeObjectURL(pendingPreviews[i]);
    setPendingFiles(prev => prev.filter((_, idx) => idx !== i));
    setPendingPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleDeleteExistingImg = async (imgId: number) => {
    if (!editId) return;
    setDeletingImg(imgId);
    try {
      await axios.delete(`services/${editId}/images/${imgId}/`);
      setExistingImages(prev => prev.filter(img => img.id !== imgId));
    } catch { /* silent */ }
    finally { setDeletingImg(null); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');

    // Validation frontend
    if (!form.category_id) {
      setSaveError('Veuillez sélectionner une catégorie.');
      return;
    }
    if (!form.title.trim()) {
      setSaveError('Le titre est obligatoire.');
      return;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      setSaveError('Veuillez entrer un prix valide.');
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      category_id: parseInt(form.category_id),
      price: parseFloat(form.price),
      price_unit: form.price_unit,
      duration: parseInt(form.duration) || 60,
      service_area: form.service_area,
      max_distance: parseInt(form.max_distance) || 25,
      instant_booking: form.instant_booking,
    };
    try {
      let serviceId = editId;
      if (editId) {
        await axios.patch(`services/${editId}/`, payload);
      } else {
        const res = await axios.post('services/', payload);
        serviceId = (res.data as any).id;
      }
      // Upload des images en attente
      for (let i = 0; i < pendingFiles.length; i++) {
        const fd = new FormData();
        fd.append('image', pendingFiles[i]);
        if (i === 0 && existingImages.length === 0) fd.append('is_primary', 'true');
        await axios.post(`services/${serviceId}/upload_image/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      pendingPreviews.forEach(url => URL.revokeObjectURL(url));
      setShowModal(false);
      setRefreshKey(k => k + 1);
      showToast(editId ? 'Service modifié avec succès.' : 'Service créé avec succès.');
    } catch (err: any) {
      const data = err?.response?.data;
      if (data) {
        const msgs = Object.values(data).flat().join(' ');
        setSaveError(msgs || 'Une erreur est survenue.');
      } else {
        setSaveError('Une erreur est survenue. Veuillez réessayer.');
      }
      showToast('Une erreur est survenue.', 'error');
    } finally {
      setSaving(false);
    }
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
      showToast('Service supprimé.', 'info');
    } catch {
      showToast('Erreur lors de la suppression.', 'error');
    }
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
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => <ServiceCardSkeleton key={i} />)}
        </div>
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
          {services.map(s => {
            const primaryImg = s.images?.find(img => img.is_primary) ?? s.images?.[0];
            return (
            <div key={s.id} className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-coupdemain-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                {primaryImg ? (
                  <img src={primaryImg.image} alt={s.title} className="w-full h-full object-cover" />
                ) : (
                  <Briefcase className="w-6 h-6 text-coupdemain-primary" />
                )}
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
            );
          })}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie <span className="text-red-400">*</span>
                </label>
                <select value={form.category_id}
                  onChange={e => { setForm(p => ({ ...p, category_id: e.target.value })); setSaveError(''); }}
                  className={inputCls + (!form.category_id ? ' border-orange-300' : '')}>
                  <option value="">— Sélectionner une catégorie —</option>
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
              {/* Section images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photos du service</label>

                {/* Images existantes (mode édition) */}
                {existingImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {existingImages.map(img => (
                      <div key={img.id} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                        <img src={img.image} alt="" className="w-full h-full object-cover" />
                        {img.is_primary && (
                          <span className="absolute bottom-0 left-0 right-0 bg-coupdemain-primary text-white text-[9px] text-center py-0.5">
                            Principale
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteExistingImg(img.id)}
                          disabled={deletingImg === img.id}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover:flex transition disabled:opacity-50"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Nouvelles images en attente */}
                {pendingPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {pendingPreviews.map((url, i) => (
                      <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border-2 border-dashed border-coupdemain-primary/40">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePending(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover:flex transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => imgInputRef.current?.click()}
                  className="flex items-center gap-2 border border-dashed border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-500 hover:border-coupdemain-primary hover:text-coupdemain-primary transition w-full justify-center"
                >
                  <Camera className="w-4 h-4" />
                  Ajouter des photos
                </button>
                <input ref={imgInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImgSelect} />
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 5 Mo par image. La première image deviendra la photo principale.</p>
              </div>

              {saveError && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-100 py-2 px-3 rounded-xl">
                  {saveError}
                </p>
              )}

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

// ─── Review Modal ─────────────────────────────────────────────────────────────

function ReviewModal({ booking, onClose, onDone }: { booking: ApiBooking; onClose: () => void; onDone: () => void }) {
  const [rating, setRating]     = useState(5);
  const [comment, setComment]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await axios.post('reviews/', { booking: booking.id, rating, comment });
      onDone();
      onClose();
    } catch (e: any) {
      const data = e?.response?.data;
      setError(data ? Object.values(data).flat().join(' ') : "Erreur lors de l'envoi.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">Laisser un avis</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600 transition" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="text-sm text-gray-600 space-y-1">
            <p>Service : <span className="font-medium text-gray-900">{booking.service?.title ?? '—'}</span></p>
            <p>Prestataire : <span className="font-medium text-gray-900">{booking.provider?.first_name} {booking.provider?.last_name}</span></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setRating(n)}
                  className={`text-3xl transition ${n <= rating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`}>
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire</label>
            <textarea rows={4} value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Décrivez votre expérience…"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary/40 resize-none" />
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 py-2 px-3 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
              Annuler
            </button>
            <button onClick={handleSubmit} disabled={!comment.trim() || submitting}
              className="flex-1 bg-coupdemain-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition disabled:opacity-60">
              {submitting ? 'Envoi…' : "Publier l'avis"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Client Bookings Tab ──────────────────────────────────────────────────────

function ClientBookingsTab() {
  const { bookings, loading, fetchBookings, cancelBooking } = useBookings();
  const navigate = useNavigate();
  const [cancelling, setCancelling]   = useState<number | null>(null);
  const [reviewBooking, setReviewBooking] = useState<ApiBooking | null>(null);
  const [reviewed, setReviewed]       = useState<Set<number>>(new Set());

  useEffect(() => { fetchBookings(); }, []);

  const typed = bookings as unknown as ApiBooking[];

  const active    = typed.filter(b => ['pending', 'confirmed', 'in_progress'].includes(b.status)).length;
  const completed = typed.filter(b => b.status === 'completed').length;
  const spent     = typed.filter(b => b.status === 'completed').reduce((s, b) => s + parseFloat(b.total_price || '0'), 0);

  const handleCancel = async (id: number) => {
    if (!window.confirm('Annuler cette réservation ?')) return;
    setCancelling(id);
    try { await cancelBooking(id); } catch { /* silent */ }
    finally { setCancelling(null); }
  };

  return (
    <>
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onDone={() => setReviewed(prev => new Set([...prev, reviewBooking!.id]))}
        />
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Réservations actives', value: active,              icon: <Calendar className="w-7 h-7 text-blue-400" /> },
          { label: 'Services complétés',   value: completed,           icon: <CheckCircle className="w-7 h-7 text-green-400" /> },
          { label: 'Total dépensé',        value: `$${spent.toFixed(2)}`, icon: <DollarSign className="w-7 h-7 text-yellow-400" /> },
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

        {loading ? (
          <p className="text-center text-gray-400 text-sm py-12">Chargement…</p>
        ) : typed.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600 font-medium">Aucune réservation pour l'instant</p>
            <p className="text-gray-400 text-sm mt-1 mb-5">Explorez les services disponibles près de chez vous.</p>
            <button onClick={() => navigate('/services')}
              className="inline-flex items-center gap-2 bg-coupdemain-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition">
              <Plus className="w-4 h-4" />Trouver un service
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {typed.map(b => (
              <div key={b.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{b.service?.title ?? '—'}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 flex-wrap">
                      {b.provider && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />{b.provider.first_name} {b.provider.last_name}
                        </span>
                      )}
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(b.date).toLocaleDateString('fr-CA')}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{b.start_time?.slice(0, 5)}</span>
                      {b.service_address && (
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{b.service_address}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-semibold text-gray-900">${parseFloat(b.total_price || '0').toFixed(2)}</p>
                    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs mt-1.5 ${getStatusColor(b.status as BookingStatus)}`}>
                      {getStatusIcon(b.status as BookingStatus)}{getStatusText(b.status as BookingStatus)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-3 items-center">
                  {b.status === 'completed' && !reviewed.has(b.id) && (
                    <button onClick={() => setReviewBooking(b)}
                      className="text-xs text-coupdemain-primary font-medium hover:underline">
                      Laisser un avis
                    </button>
                  )}
                  {b.status === 'completed' && reviewed.has(b.id) && (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />Avis envoyé
                    </span>
                  )}
                  {!['completed', 'cancelled'].includes(b.status) && (
                    <>
                      <span className="text-gray-200 text-xs">•</span>
                      <button onClick={() => handleCancel(b.id)} disabled={cancelling === b.id}
                        className="text-xs text-red-500 font-medium hover:underline disabled:opacity-50">
                        {cancelling === b.id ? 'Annulation…' : 'Annuler'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Provider Overview Tab ────────────────────────────────────────────────────

function ProviderOverviewTab() {
  const { bookings, loading, fetchBookings, confirmBooking, cancelBooking } = useBookings();
  const { user } = useAuth();
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => { fetchBookings('provider'); }, []);

  const typed = bookings as unknown as ApiBooking[];

  const today      = new Date().toISOString().split('T')[0];
  const thisMonth  = new Date().toISOString().slice(0, 7);

  const pending    = typed.filter(b => b.status === 'pending').length;
  const todayCount = typed.filter(b => b.date === today).length;
  const revenue    = typed
    .filter(b => b.status === 'completed' && b.date.startsWith(thisMonth))
    .reduce((s, b) => s + parseFloat(b.total_price || '0'), 0);
  const rating     = parseFloat(String(user?.rating ?? 0)).toFixed(1);
  const doneCount  = typed.filter(b => b.status === 'completed').length;
  const notCancelled = typed.filter(b => b.status !== 'cancelled').length;
  const completionRate = notCancelled > 0 ? Math.round((doneCount / notCancelled) * 100) : 0;

  const recent = [...typed]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const doAction = async (id: number, action: () => Promise<void>) => {
    setActionLoading(id);
    try { await action(); } catch { /* silent */ }
    finally { setActionLoading(null); }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-5 mb-8">
        {[
          { label: 'En attente',     value: pending,                   icon: <AlertCircle className="w-7 h-7 text-yellow-400" /> },
          { label: "Aujourd'hui",    value: todayCount,                icon: <Calendar className="w-7 h-7 text-blue-400" /> },
          { label: 'Revenus (mois)', value: `$${revenue.toFixed(2)}`,  icon: <DollarSign className="w-7 h-7 text-green-400" /> },
          { label: 'Note moyenne',   value: `${rating}/5`,             icon: <Star className="w-7 h-7 text-yellow-400" /> },
          { label: 'Taux réussite',  value: `${completionRate}%`,      icon: <CheckCircle className="w-7 h-7 text-purple-400" /> },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between">
            <div><p className="text-xs text-gray-500">{c.label}</p><p className="text-2xl font-bold text-gray-900 mt-1">{c.value}</p></div>
            {c.icon}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-6 border-b"><h2 className="font-semibold text-gray-900">Réservations récentes</h2></div>
        {loading ? (
          <p className="text-center text-gray-400 text-sm py-12">Chargement…</p>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-600 font-medium">Aucune réservation pour l'instant</p>
            <p className="text-gray-400 text-sm mt-1">Vos prochaines réservations apparaîtront ici.</p>
          </div>
        ) : (
          <div className="divide-y">
            {recent.map(b => (
              <div key={b.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{b.service?.title ?? '—'}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 flex-wrap">
                      {b.client && (
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{b.client.first_name} {b.client.last_name}</span>
                      )}
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(b.date).toLocaleDateString('fr-CA')}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{b.start_time?.slice(0, 5)}</span>
                    </div>
                    {b.service_address && <p className="text-xs text-gray-400 mt-1">{b.service_address}</p>}
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-semibold text-gray-900">${parseFloat(b.total_price || '0').toFixed(2)}</p>
                    {b.status === 'pending' ? (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => doAction(b.id, () => confirmBooking(b.id))} disabled={actionLoading === b.id}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700 transition disabled:opacity-50">
                          Accepter
                        </button>
                        <button onClick={() => doAction(b.id, () => cancelBooking(b.id))} disabled={actionLoading === b.id}
                          className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs hover:bg-red-200 transition disabled:opacity-50">
                          Refuser
                        </button>
                      </div>
                    ) : (
                      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs mt-1.5 ${getStatusColor(b.status as BookingStatus)}`}>
                        {getStatusText(b.status as BookingStatus)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Provider Onboarding Modal ────────────────────────────────────────────────

function ProviderOnboardingModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1 — profil
  const [bio, setBio]       = useState(user?.bio || '');
  const [phone, setPhone]   = useState(user?.phone_number || '');
  const [address, setAddress] = useState(user?.address || '');

  // Step 2 — premier service
  const [skipService, setSkipService] = useState(false);
  const [svcForm, setSvcForm] = useState({
    category_id: '', title: '', description: '',
    price: '', price_unit: 'par heure',
    duration: '60', service_area: '', max_distance: '25',
  });

  useEffect(() => {
    axios.get('categories/').then(r => {
      const d = r.data as any;
      setCategories(Array.isArray(d) ? d : (d.results ?? []));
    }).catch(() => {});
  }, []);

  const goToStep3 = () => {
    setSkipService(false);
    setStep(3);
  };

  const skipToStep3 = () => {
    setSkipService(true);
    setStep(3);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await axios.post('become-provider/');
      localStorage.setItem('user', JSON.stringify(res.data));

      if (bio || phone || address) {
        await axios.patch('profile/', {
          ...(bio    ? { bio }                    : {}),
          ...(phone  ? { phone_number: phone }    : {}),
          ...(address ? { address }               : {}),
        });
      }

      if (!skipService && svcForm.title && svcForm.price && svcForm.service_area) {
        const payload: Record<string, any> = {
          title: svcForm.title,
          description: svcForm.description,
          price: svcForm.price,
          price_unit: svcForm.price_unit,
          duration: parseInt(svcForm.duration) || 60,
          service_area: svcForm.service_area,
          max_distance: parseInt(svcForm.max_distance) || 25,
        };
        if (svcForm.category_id) payload.category_id = parseInt(svcForm.category_id);
        await axios.post('services/', payload);
      }

      window.location.reload();
    } catch (e: any) {
      const data = e?.response?.data;
      const msgs = data ? Object.values(data).flat().join(' ') : '';
      setError(msgs || 'Une erreur est survenue. Veuillez réessayer.');
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary/40';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Activer le mode Pro</h3>
            <p className="text-xs text-gray-400 mt-0.5">Étape {step} sur 3</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div className="h-1 bg-coupdemain-primary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        <div className="p-6">
          {/* ── Step 1 : Profil ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="mb-2">
                <p className="font-semibold text-gray-900 text-base">Votre profil prestataire</p>
                <p className="text-sm text-gray-500 mt-0.5">Ces informations seront visibles par vos futurs clients.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biographie / Présentation <span className="text-red-400">*</span></label>
                <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)}
                  placeholder="Décrivez votre expérience, vos compétences, ce qui vous distingue…"
                  className={inputCls + ' resize-none'} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="514 555-1234" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville / Adresse principale</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="Montréal, QC" className={inputCls} />
              </div>
              <div className="flex justify-end pt-2">
                <button disabled={!bio.trim()} onClick={() => setStep(2)}
                  className="bg-coupdemain-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition disabled:opacity-40">
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2 : Premier service ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="mb-2">
                <p className="font-semibold text-gray-900 text-base">Votre premier service</p>
                <p className="text-sm text-gray-500 mt-0.5">Créez votre premier service pour apparaître dans les recherches.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select value={svcForm.category_id} onChange={e => setSvcForm(p => ({ ...p, category_id: e.target.value }))} className={inputCls}>
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre du service <span className="text-red-400">*</span></label>
                <input value={svcForm.title} onChange={e => setSvcForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Ex: Plomberie résidentielle" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={svcForm.description} onChange={e => setSvcForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Décrivez ce que vous offrez, votre méthode de travail…"
                  className={inputCls + ' resize-none'} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix ($) <span className="text-red-400">*</span></label>
                  <input type="number" min="0" step="0.01" value={svcForm.price}
                    onChange={e => setSvcForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="75.00" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
                  <select value={svcForm.price_unit} onChange={e => setSvcForm(p => ({ ...p, price_unit: e.target.value }))} className={inputCls}>
                    <option value="par heure">Par heure</option>
                    <option value="par projet">Par projet</option>
                    <option value="par jour">Par jour</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée estimée (min)</label>
                  <input type="number" min="15" step="15" value={svcForm.duration}
                    onChange={e => setSvcForm(p => ({ ...p, duration: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Distance max (km)</label>
                  <input type="number" min="1" value={svcForm.max_distance}
                    onChange={e => setSvcForm(p => ({ ...p, max_distance: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zone de service <span className="text-red-400">*</span></label>
                <input value={svcForm.service_area} onChange={e => setSvcForm(p => ({ ...p, service_area: e.target.value }))}
                  placeholder="Montréal et environs" className={inputCls} />
              </div>
              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStep(1)} className="text-gray-500 text-sm hover:text-gray-700 transition">← Retour</button>
                <div className="flex gap-3">
                  <button onClick={skipToStep3}
                    className="text-gray-500 text-sm border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition">
                    Passer
                  </button>
                  <button onClick={goToStep3}
                    disabled={!svcForm.title.trim() || !svcForm.price || !svcForm.service_area.trim()}
                    className="bg-coupdemain-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition disabled:opacity-40">
                    Suivant →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3 : Confirmation ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-coupdemain-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-coupdemain-primary" />
                </div>
                <p className="font-bold text-gray-900 text-xl">Tout est prêt !</p>
                <p className="text-gray-500 text-sm mt-2">Voici un résumé de votre profil prestataire.</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                {bio     && <div className="flex gap-2"><span className="text-gray-400 w-24 shrink-0">Biographie</span><span className="text-gray-700 line-clamp-2">{bio}</span></div>}
                {phone   && <div className="flex gap-2"><span className="text-gray-400 w-24 shrink-0">Téléphone</span><span className="text-gray-700">{phone}</span></div>}
                {address && <div className="flex gap-2"><span className="text-gray-400 w-24 shrink-0">Ville</span><span className="text-gray-700">{address}</span></div>}
                {!skipService && svcForm.title && (
                  <div className="border-t pt-3 mt-2 space-y-1.5">
                    <div className="flex gap-2"><span className="text-gray-400 w-24 shrink-0">Service</span><span className="text-gray-700 font-medium">{svcForm.title}</span></div>
                    <div className="flex gap-2"><span className="text-gray-400 w-24 shrink-0">Prix</span><span className="text-gray-700">${svcForm.price} {svcForm.price_unit}</span></div>
                    <div className="flex gap-2"><span className="text-gray-400 w-24 shrink-0">Zone</span><span className="text-gray-700">{svcForm.service_area}</span></div>
                  </div>
                )}
                {skipService && (
                  <p className="text-gray-400 text-xs italic pt-1">Aucun service créé — vous pourrez en ajouter depuis votre tableau de bord.</p>
                )}
              </div>

              {error && (
                <p className="text-red-600 text-sm text-center bg-red-50 py-2 px-3 rounded-lg">{error}</p>
              )}

              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStep(2)} className="text-gray-500 text-sm hover:text-gray-700 transition">← Retour</button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="bg-coupdemain-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition disabled:opacity-60">
                  {submitting ? 'Activation…' : 'Activer mon profil Pro'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard unifié ─────────────────────────────────────────────────────────

type Mode = 'client' | 'provider';

export default function DashboardPage() {
  const { user, logout, resendVerification } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const locationTab = (location.state as any)?.tab as string | undefined;

  const [activeMode, setActiveMode] = useState<Mode>(() => {
    // If navigated with tab=services, switch to provider mode if possible
    if (locationTab === 'services' && user?.has_provider_profile) return 'provider';
    const saved = localStorage.getItem('dashboard_mode') as Mode | null;
    if (saved === 'provider' && user?.has_provider_profile) return 'provider';
    return 'client';
  });

  const [activeTab, setActiveTab] = useState(() => {
    if (locationTab) return locationTab;
    return activeMode === 'provider' ? 'overview' : 'bookings';
  });

  const switchMode = (mode: Mode) => {
    setActiveMode(mode);
    localStorage.setItem('dashboard_mode', mode);
    setActiveTab(mode === 'provider' ? 'overview' : 'bookings');
  };

  // Suppression des états mock (remplacés par ClientBookingsTab / ProviderOverviewTab)

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


  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 flex items-center justify-between px-4 h-14">
        <button onClick={() => setSidebarOpen(true)} className="text-gray-600 p-1">
          <Menu className="w-6 h-6" />
        </button>
        <span className="text-base font-bold text-coupdemain-primary">Coupdemain</span>
        <span className="w-8" /> {/* spacer */}
      </div>

      {/* ── Sidebar backdrop (mobile) ── */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-sm border-r border-gray-100 flex flex-col z-50 transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-coupdemain-primary">Coupdemain</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isProviderMode ? 'Espace Prestataire' : 'Espace Client'}
            </p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
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
            <button key={item.key} onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
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
                onClick={() => { setShowOnboarding(true); setSidebarOpen(false); }}
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

      {/* ── Contenu principal ── */}
      <div className="md:ml-64 pt-14 md:pt-0 p-4 md:p-8">
        {/* Bannière vérification email */}
        {user && !user.email_verified && (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Vérifiez votre adresse courriel pour sécuriser votre compte.
            </div>
            <button
              onClick={async () => {
                try {
                  await resendVerification();
                  showToast('Email de vérification envoyé.', 'info');
                } catch {
                  showToast('Erreur lors de l\'envoi. Réessayez.', 'error');
                }
              }}
              className="text-xs font-semibold text-amber-700 hover:underline whitespace-nowrap"
            >
              Renvoyer l'email
            </button>
          </div>
        )}

        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Bonjour, {displayName} 👋</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isProviderMode ? 'Tableau de bord prestataire' : 'Voici un aperçu de votre activité'}
          </p>
        </div>

        {/* ── MODE CLIENT ── */}
        {!isProviderMode && activeTab === 'bookings'      && <ClientBookingsTab />}
        {!isProviderMode && activeTab === 'requests'      && <ClientRequestsTab />}
        {!isProviderMode && activeTab === 'messages'      && <MessagesTab />}
        {!isProviderMode && activeTab === 'notifications' && <NotificationsTab />}
        {!isProviderMode && activeTab === 'profile'       && <ProfileTab />}
        {!isProviderMode && activeTab === 'settings'      && <SettingsTab />}

        {/* ── MODE PRESTATAIRE ── */}
        {isProviderMode && activeTab === 'overview'       && <ProviderOverviewTab />}
        {isProviderMode && activeTab === 'bookings'      && <ProviderBookingsTab />}
        {isProviderMode && activeTab === 'services'      && <ProviderServicesTab />}
        {isProviderMode && activeTab === 'requests'      && <ProviderRequestsTab />}
        {isProviderMode && activeTab === 'messages'      && <MessagesTab />}
        {isProviderMode && activeTab === 'notifications' && <NotificationsTab />}
        {isProviderMode && activeTab === 'profile'       && <ProfileTab />}
        {isProviderMode && activeTab === 'settings'      && <SettingsTab />}
      </div>

      {showOnboarding && <ProviderOnboardingModal onClose={() => setShowOnboarding(false)} />}
    </div>
  );
}
