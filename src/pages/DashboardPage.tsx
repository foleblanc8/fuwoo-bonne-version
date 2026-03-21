// src/pages/DashboardPage.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { JSX } from 'react';
import {
  Calendar, Clock, DollarSign, Star, TrendingUp, AlertCircle, BarChart2,
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
import { getCategoryImage } from '../data/serviceImages';
import { getCategoryStyle } from '../data/categoryStyles';
import axios from 'axios';

// ─── Safety Data ──────────────────────────────────────────────────────────────

const SAFETY_BY_SLUG: Record<string, { title: string; tip: string }[]> = {
  toiture: [
    { title: 'Harnais obligatoire', tip: 'Portez un harnais de sécurité certifié et utilisez des points d\'ancrage solides. Ne travaillez jamais seul en toiture.' },
    { title: 'Conditions météo', tip: 'Évitez toute intervention sur un toit mouillé, glacé ou par vents forts. Vérifiez la météo avant de monter.' },
  ],
  'nettoyage-gouttieres': [
    { title: 'Échelle sécurisée', tip: 'Utilisez une échelle stable posée sur une surface plane. Faites-la tenir par quelqu\'un. Ne vous penchez jamais hors des montants.' },
  ],
  'lavage-vitres': [
    { title: 'Travail en hauteur', tip: 'Pour les fenêtres en hauteur, utilisez un équipement adapté et une corde de sécurité si nécessaire. Jamais seul.' },
  ],
  'elagage-arbres': [
    { title: 'Tronçonneuse et hauteur', tip: 'Portez casque, lunettes, jambières anti-coupures et chaussures à embout d\'acier. L\'élagage en hauteur requiert un harnais.' },
  ],
  'clotures-terrasses': [
    { title: 'Stabilité des structures', tip: 'Vérifiez la solidité du sol et des ancrages avant de monter. Portez des gants et lunettes lors de la coupe et l\'assemblage.' },
  ],
  peinture: [
    { title: 'Ventilation et EPI', tip: 'Masque N95, gants nitrile et lunettes sont requis avec les peintures à solvant. Aérez pendant et après l\'application.' },
    { title: 'Travail en hauteur', tip: 'Vérifiez la stabilité des échelles et échafaudages. Descendez toujours pour les déplacer. Ne vous penchez pas à l\'extérieur.' },
  ],
  electricite: [
    { title: 'Licence RBQ obligatoire', tip: 'Les travaux d\'électricité sont réglementés au Québec. Assurez-vous de détenir une licence RBQ valide avant toute intervention.' },
    { title: 'Coupure de courant', tip: 'Coupez le courant au panneau et vérifiez avec un testeur de tension avant de toucher un fil. Ne supposez jamais qu\'un circuit est hors tension.' },
  ],
  plomberie: [
    { title: 'Coupure d\'eau', tip: 'Localisez et fermez le robinet d\'arrêt principal avant tout travail. Ayez des serviettes et un seau à portée.' },
    { title: 'Licence RBQ', tip: 'Les raccordements sanitaires requièrent une licence RBQ. Vérifiez votre accréditation avant l\'intervention.' },
  ],
  demenagement: [
    { title: 'Manutention sécuritaire', tip: 'Pliez les genoux, gardez le dos droit et la charge proche du corps. Pour les objets très lourds, utilisez un diable ou demandez de l\'aide.' },
    { title: 'Chaussures de sécurité', tip: 'Portez des chaussures à embout d\'acier. Les risques de chute d\'objets lourds sont élevés lors des déménagements.' },
  ],
  'tonte-pelouse': [
    { title: 'Zone dégagée', tip: 'Retirez cailloux, branches et jouets avant de tondre. Portez des lunettes et des chaussures fermées. Ne tondez jamais en présence d\'enfants.' },
  ],
  'taille-haies': [
    { title: 'Outil tranchant', tip: 'Portez gants anti-coupures, lunettes et pantalons résistants. Vérifiez que la lame est arrêtée avant d\'ajuster votre position.' },
  ],
  deneigement: [
    { title: 'Habillement par couches', tip: 'Portez plusieurs couches, protégez vos extrémités et votre visage. Faites des pauses régulières pour éviter l\'hypothermie.' },
    { title: 'Souffleuse', tip: 'N\'insérez jamais les mains dans la souffleuse. Éteignez-la avant tout dégagement d\'obstruction. Gardez les pieds à distance.' },
  ],
  extermination: [
    { title: 'Produits chimiques', tip: 'Portez une combinaison de protection, des gants nitrile et un masque respiratoire homologué. Lisez les fiches de sécurité avant utilisation.' },
  ],
  menuiserie: [
    { title: 'Outils tranchants', tip: 'Portez lunettes et gants résistants aux coupures. Ne désactivez jamais les gardes de sécurité des scies ou toupies.' },
    { title: 'Poussière de bois', tip: 'Portez un masque P100 lors du ponçage ou de la découpe. La poussière de certains bois est cancérigène.' },
  ],
  'pose-planchers': [
    { title: 'Genoux et posture', tip: 'Utilisez des genouillères pour le travail au sol. Alternez les positions pour éviter les blessures au dos.' },
    { title: 'Découpe', tip: 'Portez lunettes et masque lors de la découpe. Les éclats de plancher peuvent causer des blessures oculaires graves.' },
  ],
  'pose-ceramique': [
    { title: 'Coupe de carreaux', tip: 'Portez des lunettes lors de la coupe. Les éclats de céramique sont tranchants et peuvent causer des coupures profondes.' },
    { title: 'Adhésifs et coulis', tip: 'Ces produits sont irritants pour la peau. Portez des gants et lavez-vous les mains fréquemment.' },
  ],
  impermeabilisation: [
    { title: 'Produits irritants', tip: 'Les membranes et produits d\'étanchéité contiennent souvent des solvants. Portez un masque à cartouche, des gants et travaillez en zone ventilée.' },
  ],
  'menage-residentiel': [
    { title: 'Produits ménagers', tip: 'Ne mélangez jamais l\'eau de Javel avec l\'ammoniaque ou le vinaigre. Lisez les étiquettes, portez des gants et aérez la pièce.' },
  ],
  'nettoyage-profondeur': [
    { title: 'Produits chimiques concentrés', tip: 'Portez gants nitrile et lunettes. Diluez correctement les produits et assurez une bonne ventilation dans les espaces clos.' },
  ],
};

const GENERAL_SAFETY_TIPS = [
  { title: 'Informez un proche', tip: 'Avant toute intervention, informez un proche de votre lieu de travail et de l\'heure de retour prévue.' },
  { title: 'Trousse de premiers soins', tip: 'Apportez toujours une trousse de premiers soins et gardez votre téléphone chargé à portée de main.' },
  { title: 'Inspectez les lieux avant de commencer', tip: 'Identifiez les risques présents (sol glissant, matières dangereuses, instabilité). Signalez au client tout problème avant de débuter.' },
  { title: 'Assurance responsabilité en vigueur', tip: 'Assurez-vous d\'avoir une assurance responsabilité civile professionnelle valide. En tant que travailleur autonome, vous êtes seul responsable en cas d\'accident.' },
];

// ─── Safety Tips Content ───────────────────────────────────────────────────────

function SafetyTipsContent({ selectedSlugs }: { selectedSlugs?: string[] }) {
  const specificTips = useMemo(() => {
    if (!selectedSlugs || selectedSlugs.length === 0) return [];
    const tips: { title: string; tip: string }[] = [];
    for (const slug of selectedSlugs) {
      const slugTips = SAFETY_BY_SLUG[slug];
      if (slugTips) tips.push(...slugTips);
    }
    return tips;
  }, [selectedSlugs]);

  return (
    <div className="space-y-3">
      {specificTips.length > 0 && (
        <>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Conseils spécifiques à vos services</p>
          {specificTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{tip.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{tip.tip}</p>
              </div>
            </div>
          ))}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest pt-2">Conseils généraux</p>
        </>
      )}
      {GENERAL_SAFETY_TIPS.map((tip, i) => (
        <div key={i} className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
          <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">{tip.title}</p>
            <p className="text-xs text-gray-600 mt-0.5">{tip.tip}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Safety Tab ────────────────────────────────────────────────────────────────

function SafetyTab() {
  const { user } = useAuth();
  const [activeSlugs, setActiveSlugs] = useState<string[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      axios.get('categories/'),
      axios.get(`services/?provider=${user.id}&page_size=100`),
    ]).then(([catRes, svcRes]) => {
      const catsArr: any[] = (() => { const d = catRes.data as any; return Array.isArray(d) ? d : (d.results ?? []); })();
      const svcsArr: any[] = (() => { const d = svcRes.data as any; return Array.isArray(d) ? d : (d.results ?? []); })();
      const activeIds = svcsArr.filter((s: any) => s.is_active).map((s: any) => s.category?.id);
      setActiveSlugs(catsArr.filter((c: any) => activeIds.includes(c.id)).map((c: any) => c.slug));
    }).catch(() => {});
  }, [user?.id]);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Sécurité au travail</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Conseils adaptés à vos services actifs. En tant que travailleur autonome, votre sécurité est votre responsabilité.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Rappel :</strong> En tant que travailleur autonome, vous êtes seul responsable de votre couverture CNESST
          et de vos assurances. En cas d'accident lors d'une prestation, Coupdemain ne peut être tenu responsable.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        {activeSlugs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Activez des services dans l'onglet « Mes services » pour voir les conseils spécifiques.
          </p>
        ) : (
          <SafetyTipsContent selectedSlugs={activeSlugs} />
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Ressources officielles</h3>
        <div className="space-y-3">
          <a href="https://www.cnesst.gouv.qc.ca" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            <div>
              <p className="text-sm font-medium text-gray-900">CNESST</p>
              <p className="text-xs text-gray-500 mt-0.5">Droits, obligations et couverture des travailleurs autonomes au Québec</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 ml-3" />
          </a>
          <a href="https://www.rbq.gouv.qc.ca/verifier-une-licence" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
            <div>
              <p className="text-sm font-medium text-gray-900">RBQ — Vérifier une licence</p>
              <p className="text-xs text-gray-500 mt-0.5">Licences requises pour les travaux réglementés (électricité, plomberie, construction)</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 ml-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';


type ServiceRequest = {
  id: number;
  title: string;
  description: string;
  category: { id: number; name: string } | null;
  service_area: string;
  address: string | null;
  preferred_dates: string;
  submission_deadline: string | null;
  bid_count: number;
  status: 'open' | 'awarded' | 'completed' | 'closed' | 'cancelled';
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
  has_review?: boolean;
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

  const fetchMessages = async (silent = false) => {
    try {
      const res = await axios.get('messages/');
      const d = res.data as any;
      setAllMessages(Array.isArray(d) ? d : (d.results ?? []));
    } catch { /* silent */ }
    finally { if (!silent) setLoading(false); }
  };

  // Initial load
  useEffect(() => { fetchMessages(); }, []);

  // Poll every 5 seconds for new messages
  useEffect(() => {
    const interval = setInterval(() => fetchMessages(true), 5000);
    return () => clearInterval(interval);
  }, []);

  // Listen for external "open-messages" events (from bid cards)
  useEffect(() => {
    const handler = (e: Event) => {
      const partnerId = (e as CustomEvent).detail?.partnerId;
      if (partnerId) setSelectedUserId(partnerId);
    };
    window.addEventListener('open-messages', handler);
    return () => window.removeEventListener('open-messages', handler);
  }, []);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (!selectedUserId) return;
    axios.post('messages/mark_read/', { partner_id: selectedUserId }).catch(() => {});
    setAllMessages(prev => prev.map(m =>
      m.sender?.id === selectedUserId ? { ...m, is_read: true } : m
    ));
  }, [selectedUserId]);

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

      {/* Section vérification d'identité — prestataires seulement */}
      {(user as any)?.has_provider_profile && (
        <IdentityVerificationSection />
      )}
    </div>
  );
}

// ─── Identity Verification Section ───────────────────────────────────────────

function IdentityVerificationSection() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const identityStatus = (user as any)?.identity_status ?? 'not_submitted';
  const rejectionReason = (user as any)?.identity_rejection_reason ?? '';
  const [uploading, setUploading] = useState(false);
  const [localStatus, setLocalStatus] = useState(identityStatus);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    not_submitted: { label: 'Non soumis',        color: 'text-gray-600',   bg: 'bg-gray-100' },
    pending:       { label: 'En cours de révision', color: 'text-amber-700',  bg: 'bg-amber-100' },
    verified:      { label: 'Identité vérifiée', color: 'text-green-700',  bg: 'bg-green-100' },
    rejected:      { label: 'Document rejeté',   color: 'text-red-700',    bg: 'bg-red-100' },
  };
  const cfg = statusConfig[localStatus] ?? statusConfig.not_submitted;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      showToast('Format accepté : JPG, PNG, WebP ou PDF.', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('Le fichier ne doit pas dépasser 10 Mo.', 'error');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('identity_document', file);
      await axios.post('auth/submit-identity/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLocalStatus('pending');
      // Mettre à jour le localStorage
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.identity_status = 'pending';
        localStorage.setItem('user', JSON.stringify(parsed));
      }
      showToast('Document soumis ! Nous l\'examinerons sous 24–48h.', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.detail ?? 'Erreur lors de l\'envoi.', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Vérification d'identité</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Le badge <span className="text-green-700 font-medium">✓ Vérifié</span> augmente la confiance des clients.
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {localStatus === 'verified' && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-sm text-green-800 font-medium">
            Votre identité a été vérifiée. Le badge apparaît sur votre profil public.
          </p>
        </div>
      )}

      {localStatus === 'pending' && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            Document reçu — révision en cours (24–48h). Vous serez notifié par email.
          </p>
        </div>
      )}

      {localStatus === 'rejected' && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-4">
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800 font-medium">Document rejeté</p>
              {rejectionReason && (
                <p className="text-sm text-red-700 mt-0.5">{rejectionReason}</p>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600">Veuillez soumettre un nouveau document :</p>
        </div>
      )}

      {(localStatus === 'not_submitted' || localStatus === 'rejected') && (
        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-coupdemain-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition disabled:opacity-60"
          >
            <Shield className="w-4 h-4" />
            {uploading ? 'Envoi en cours…' : 'Soumettre une pièce d\'identité'}
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Passeport, permis de conduire ou carte d'identité — JPG, PNG ou PDF, max 10 Mo
          </p>
        </div>
      )}
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

type AvailableCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
};

type ProviderServiceRecord = {
  id: number;
  is_active: boolean;
  category: { id: number; name: string; slug: string } | null;
  service_area: string;
};

function ProviderServicesTab() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [categories, setCategories]           = useState<AvailableCategory[]>([]);
  const [providerServices, setProviderServices] = useState<ProviderServiceRecord[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [toggling, setToggling]               = useState<number | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      axios.get('categories/'),
      axios.get(`services/?provider=${user.id}&page_size=100`),
    ]).then(([catRes, svcRes]) => {
      const cats = catRes.data as any;
      setCategories(Array.isArray(cats) ? cats : (cats.results ?? []));
      const svcs = svcRes.data as any;
      setProviderServices(Array.isArray(svcs) ? svcs : (svcs.results ?? []));
    }).finally(() => setLoading(false));
  }, [user?.id]);

  const toggleService = async (cat: AvailableCategory) => {
    if (toggling !== null) return;
    setToggling(cat.id);
    const existing = providerServices.find(s => s.category?.id === cat.id);
    try {
      if (existing?.is_active) {
        await axios.patch(`services/${existing.id}/`, { is_active: false });
        setProviderServices(prev => prev.map(s => s.id === existing.id ? { ...s, is_active: false } : s));
        showToast(`${cat.name} retiré de vos services.`, 'info');
      } else if (existing) {
        await axios.patch(`services/${existing.id}/`, { is_active: true });
        setProviderServices(prev => prev.map(s => s.id === existing.id ? { ...s, is_active: true } : s));
        showToast(`${cat.name} ajouté à vos services.`);
      } else {
        const res = await axios.post('services/', { category_id: cat.id, title: cat.name });
        setProviderServices(prev => [...prev, res.data as ProviderServiceRecord]);
        showToast(`${cat.name} ajouté à vos services.`);
      }
    } catch {
      showToast('Une erreur est survenue.', 'error');
    } finally {
      setToggling(null);
    }
  };

  const activeCount = providerServices.filter(s => s.is_active).length;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Mes services</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {activeCount} service{activeCount !== 1 ? 's' : ''} actif{activeCount !== 1 ? 's' : ''} — activez les services pour lesquels vous acceptez des demandes de soumission.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
          {[...Array(6)].map((_, i) => <ServiceCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
          {categories.map(cat => {
            const svc = providerServices.find(s => s.category?.id === cat.id);
            const isActive = svc?.is_active ?? false;
            const isToggling = toggling === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => toggleService(cat)}
                disabled={isToggling}
                className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm border-2 transition-all duration-200 text-left
                  ${isActive ? 'border-coupdemain-primary shadow-coupdemain-primary/10' : 'border-gray-100 hover:border-gray-300 hover:shadow-md'}
                  ${isToggling ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={getCategoryImage(cat.slug)}
                    alt={cat.name}
                    className={`w-full h-full object-cover transition-transform duration-500 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-coupdemain-primary/20 flex items-center justify-center">
                      <div className="w-10 h-10 bg-coupdemain-primary rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-gray-900 text-sm leading-snug">{cat.name}</p>
                  <p className={`text-xs mt-0.5 font-medium ${isActive ? 'text-coupdemain-primary' : 'text-gray-400'}`}>
                    {isToggling ? '…' : isActive ? 'Actif — vous recevez des demandes' : 'Inactif'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Portfolio Tab ────────────────────────────────────────────────────────────

type PortfolioPhoto = { id: number; image: string; caption: string };
const MAX_PORTFOLIO = 10;

function PortfolioTab() {
  const { showToast } = useToast();
  const [photos, setPhotos]     = useState<PortfolioPhoto[]>([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [editCaption, setEditCaption] = useState<{ id: number; value: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await axios.get('portfolio/');
        const d = r.data as any;
        setPhotos(Array.isArray(d) ? d : (d.results ?? []));
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_PORTFOLIO - photos.length;
    const toUpload = Array.from(files).slice(0, remaining);
    if (toUpload.length === 0) {
      showToast(`Maximum ${MAX_PORTFOLIO} photos atteint.`, 'warning');
      return;
    }
    setUploading(true);
    for (const file of toUpload) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 8 * 1024 * 1024) { showToast('Max 8 Mo par image.', 'error'); continue; }
      try {
        const fd = new FormData();
        fd.append('image', file);
        const res = await axios.post('portfolio/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setPhotos(prev => [...prev, res.data as PortfolioPhoto]);
      } catch { showToast('Erreur lors de l\'upload.', 'error'); }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const deletePhoto = async (id: number) => {
    setDeleting(id);
    try {
      await axios.delete(`portfolio/${id}/`);
      setPhotos(prev => prev.filter(p => p.id !== id));
    } catch { showToast('Erreur lors de la suppression.', 'error'); }
    finally { setDeleting(null); }
  };

  const saveCaption = async (id: number, caption: string) => {
    try {
      await axios.patch(`portfolio/${id}/`, { caption });
      setPhotos(prev => prev.map(p => p.id === id ? { ...p, caption } : p));
      setEditCaption(null);
    } catch { showToast('Erreur lors de la mise à jour.', 'error'); }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Portfolio</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Montrez vos réalisations passées aux clients. {photos.length}/{MAX_PORTFOLIO} photos.
          </p>
        </div>
        {photos.length < MAX_PORTFOLIO && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-coupdemain-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition disabled:opacity-60"
          >
            <Plus className="w-4 h-4" />
            {uploading ? 'Envoi…' : 'Ajouter des photos'}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm py-12">Chargement…</p>
      ) : photos.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-16 text-center cursor-pointer hover:border-coupdemain-primary/40 hover:bg-coupdemain-primary/5 transition"
        >
          <Camera className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-700 font-semibold">Aucune photo pour l'instant</p>
          <p className="text-gray-400 text-sm mt-1">Cliquez pour ajouter vos premières réalisations</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map(photo => (
            <div key={photo.id} className="group relative bg-white rounded-2xl shadow-sm overflow-hidden">
              <img
                src={photo.image}
                alt={photo.caption || 'Portfolio'}
                className="w-full aspect-square object-cover"
              />
              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => setEditCaption({ id: photo.id, value: photo.caption })}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-100 transition"
                  title="Modifier la légende"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deletePhoto(photo.id)}
                  disabled={deleting === photo.id}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition disabled:opacity-50"
                  title="Supprimer"
                >
                  {deleting === photo.id
                    ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />
                  }
                </button>
              </div>
              {/* Légende */}
              {photo.caption && (
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-600 truncate">{photo.caption}</p>
                </div>
              )}
            </div>
          ))}

          {/* Bouton ajout inline */}
          {photos.length < MAX_PORTFOLIO && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-coupdemain-primary/40 hover:text-coupdemain-primary hover:bg-coupdemain-primary/5 transition"
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs font-medium">Ajouter</span>
            </button>
          )}
        </div>
      )}

      {/* Modal légende */}
      {editCaption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Modifier la légende</h3>
            <input
              autoFocus
              value={editCaption.value}
              onChange={e => setEditCaption(p => p ? { ...p, value: e.target.value } : null)}
              onKeyDown={e => e.key === 'Enter' && saveCaption(editCaption.id, editCaption.value)}
              placeholder="Ex : Cuisine rénovée à Montréal"
              maxLength={200}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary/40"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditCaption(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 transition">
                Annuler
              </button>
              <button onClick={() => saveCaption(editCaption.id, editCaption.value)}
                className="flex-1 bg-coupdemain-primary text-white py-2 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── Provider Requests Tab ────────────────────────────────────────────────────

function ProviderRequestsTab() {
  const [requests, setRequests]       = useState<ServiceRequest[]>([]);
  const [myBids, setMyBids]           = useState<Bid[]>([]);
  const [loading, setLoading]         = useState(true);
  const [bidModal, setBidModal]       = useState<ServiceRequest | null>(null);
  const [bidForm, setBidForm]         = useState({ price: '', price_unit: 'par projet', message: '', estimated_duration: '' });
  const [submitting, setSubmitting]   = useState(false);

  const submittedIds = new Set(myBids.map(b => b.service_request));

  useEffect(() => {
    Promise.all([
      axios.get('service-requests/?as=provider'),
      axios.get('bids/?as=provider'),
    ]).then(([rRes, bRes]) => {
      const rd = rRes.data as any;
      setRequests(Array.isArray(rd) ? rd : (rd.results ?? []));
      const bd = bRes.data as any;
      setMyBids(Array.isArray(bd) ? bd : (bd.results ?? []));
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
      const res = await axios.post('bids/', {
        service_request: bidModal.id,
        price: parseFloat(bidForm.price),
        price_unit: bidForm.price_unit,
        message: bidForm.message,
        ...(bidForm.estimated_duration ? { estimated_duration: parseInt(bidForm.estimated_duration) } : {}),
      });
      setMyBids(prev => [...prev, res.data as Bid]);
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
                      {(() => {
                        const bid = myBids.find(b => b.service_request === req.id);
                        if (req.address) {
                          return (
                            <span className="flex items-center gap-1 text-green-700 font-medium">
                              <Lock className="w-3.5 h-3.5" />{req.address}
                            </span>
                          );
                        }
                        if (bid?.status !== 'accepted') {
                          return (
                            <span className="flex items-center gap-1 text-gray-400 italic">
                              <Lock className="w-3.5 h-3.5" />Adresse partagée si retenu
                            </span>
                          );
                        }
                        return null;
                      })()}
                      {req.preferred_dates && (
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Souhaité : {req.preferred_dates}</span>
                      )}
                      {req.submission_deadline && (
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Limite : {new Date(req.submission_deadline).toLocaleDateString('fr-CA')}</span>
                      )}
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{req.bid_count} offre{req.bid_count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {(() => {
                      const bid = myBids.find(b => b.service_request === req.id);
                      if (!bid) return (
                        <button
                          onClick={() => openBidModal(req)}
                          disabled={req.status !== 'open'}
                          className="flex items-center gap-2 bg-coupdemain-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition disabled:opacity-40"
                        >
                          <Send className="w-4 h-4" />Soumettre une offre
                        </button>
                      );
                      if (bid.status === 'accepted') return (
                        <div className="flex flex-col items-end gap-2">
                          <span className="flex items-center gap-1.5 text-green-600 text-sm font-semibold">
                            <CheckCircle className="w-4 h-4" />Offre acceptée !
                          </span>
                          <a
                            href={`/api/contracts/${bid.id}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 border border-indigo-200 text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-50 transition"
                          >
                            <FileText className="w-4 h-4" />Contrat PDF
                          </a>
                          {(bid as any).service_request_detail?.client && (
                            <button
                              onClick={() => {
                                const clientId = (bid as any).service_request_detail.client.id;
                                window.dispatchEvent(new CustomEvent('open-messages', { detail: { partnerId: clientId } }));
                                window.dispatchEvent(new CustomEvent('switch-tab', { detail: { tab: 'messages' } }));
                              }}
                              className="flex items-center gap-1.5 border border-coupdemain-primary/30 text-coupdemain-primary bg-coupdemain-primary/5 px-4 py-2 rounded-xl text-sm font-medium hover:bg-coupdemain-primary/10 transition"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Contacter le client
                            </button>
                          )}
                        </div>
                      );
                      return (
                        <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />Offre envoyée
                        </span>
                      );
                    })()}
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
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                <Lock className="w-3 h-3" />L'adresse exacte sera partagée si votre offre est retenue.
              </p>
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

// ─── Edit Request Modal ────────────────────────────────────────────────────────

function EditRequestModal({ req, onClose, onSave }: {
  req: ServiceRequest;
  onClose: () => void;
  onSave: (updated: Partial<ServiceRequest>) => void;
}) {
  const [description, setDescription] = useState(req.description);
  const [serviceArea, setServiceArea]  = useState(req.service_area);
  const [preferredDates, setPreferredDates] = useState(req.preferred_dates);
  const [submitting, setSubmitting]    = useState(false);
  const [error, setError]              = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await axios.patch(`service-requests/${req.id}/`, {
        description, service_area: serviceArea, preferred_dates: preferredDates,
      });
      onSave(res.data as Partial<ServiceRequest>);
      onClose();
    } catch {
      setError('Impossible de modifier la demande. Veuillez réessayer.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Modifier la demande</h3>
            <p className="text-sm text-gray-400 mt-0.5">{req.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description du projet</label>
            <textarea
              rows={4} value={description} onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary/40 resize-none"
              placeholder="Décrivez votre projet en détail..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Zone de service</label>
            <input type="text" value={serviceArea} onChange={e => setServiceArea(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary/40"
              placeholder="Ville, quartier..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date souhaitée</label>
            <input type="text" value={preferredDates} onChange={e => setPreferredDates(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coupdemain-primary/40"
              placeholder="Ex: 2026-05-15 à 10:00" />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 transition">
              Annuler
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-coupdemain-primary text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-coupdemain-primary/90 transition disabled:opacity-50">
              {submitting ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Client Projects Tab (Mes projets) ────────────────────────────────────────

function ClientProjectsTab() {
  const [requests, setRequests]       = useState<ServiceRequest[]>([]);
  const [loading, setLoading]         = useState(true);
  const [expandedId, setExpandedId]   = useState<number | null>(null);
  const [bids, setBids]               = useState<Record<number, Bid[]>>({});
  const [bidsLoading, setBidsLoading] = useState<number | null>(null);
  const [accepting, setAccepting]     = useState<number | null>(null);
  const [completing, setCompleting]   = useState<number | null>(null);
  const [paying, setPaying]           = useState<number | null>(null);
  const [editingReq, setEditingReq]   = useState<ServiceRequest | null>(null);
  const [reviewBid, setReviewBid]     = useState<{ bid: Bid; providerName: string } | null>(null);
  const [reviewedBidIds, setReviewedBidIds] = useState<Set<number>>(new Set());
  const { showToast } = useToast();
  const navigate = useNavigate();

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
      showToast('Offre acceptée ! Vous pouvez maintenant procéder au paiement.', 'success');
    } catch { showToast('Impossible d\'accepter l\'offre.', 'error'); }
    finally { setAccepting(null); }
  };

  const payBid = async (bidId: number) => {
    setPaying(bidId);
    try {
      const res = await axios.post('payments/create-checkout/', { bid_id: bidId });
      window.location.href = (res.data as any).checkout_url;
    } catch (e: any) {
      showToast(e?.response?.data?.detail ?? 'Erreur lors du paiement.', 'error');
      setPaying(null);
    }
  };

  const completeRequest = async (reqId: number) => {
    setCompleting(reqId);
    try {
      await axios.post(`service-requests/${reqId}/complete/`);
      setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'completed' } : r));
      showToast('Service marqué comme terminé !', 'success');
    } catch { showToast('Impossible de marquer comme terminé.', 'error'); }
    finally { setCompleting(null); }
  };

  const commissionRate = (price: string) => {
    const p = parseFloat(price);
    if (p <= 500) return 15;
    if (p <= 2000) return 12;
    return 10;
  };

  // Helpers visuels par statut de la demande
  const projectSteps = (req: ServiceRequest) => {
    const reqBids = bids[req.id] ?? [];
    const hasBids = req.bid_count > 0 || reqBids.length > 0;
    const steps = [
      { label: 'Demande envoyée', done: true },
      { label: req.bid_count > 0 ? `${req.bid_count} offre${req.bid_count > 1 ? 's' : ''} reçue${req.bid_count > 1 ? 's' : ''}` : 'Offres reçues', done: hasBids },
      { label: 'Pro sélectionné', done: req.status === 'awarded' || req.status === 'completed' },
      { label: 'Terminé',         done: req.status === 'completed' },
    ];
    return steps;
  };

  const statusConfig = (req: ServiceRequest) => {
    if (req.status === 'cancelled') return { label: 'Annulée', color: 'text-red-600 bg-red-50 border-red-100' };
    if (req.status === 'completed') return { label: 'Terminé', color: 'text-emerald-700 bg-emerald-50 border-emerald-100' };
    if (req.status === 'awarded')   return { label: 'Pro sélectionné', color: 'text-blue-700 bg-blue-50 border-blue-100' };
    if (req.bid_count > 0)          return { label: `${req.bid_count} offre${req.bid_count > 1 ? 's' : ''} reçue${req.bid_count > 1 ? 's' : ''}`, color: 'text-yellow-700 bg-yellow-50 border-yellow-100' };
    return { label: 'En attente de pros', color: 'text-gray-600 bg-gray-50 border-gray-200' };
  };

  const bidStatusBadge = (s: string) =>
    ({ pending: 'text-yellow-700 bg-yellow-100', accepted: 'text-green-700 bg-green-100', rejected: 'text-red-600 bg-red-100' }[s] ?? 'text-gray-600 bg-gray-100');
  const bidStatusLabel = (s: string) =>
    ({ pending: 'En attente', accepted: 'Acceptée', rejected: 'Refusée' }[s] ?? s);

  // Stats rapides
  const total     = requests.length;
  const active    = requests.filter(r => r.status === 'open').length;
  const awarded   = requests.filter(r => r.status === 'awarded').length;
  const completed = requests.filter(r => r.status === 'completed').length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mes projets</h2>
          <p className="text-sm text-gray-500 mt-0.5">Suivez vos demandes et gérez vos pros.</p>
        </div>
        <button onClick={() => navigate('/services')}
          className="flex items-center gap-2 bg-coupdemain-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition shadow-sm">
          <Plus className="w-4 h-4" />Nouveau projet
        </button>
      </div>

      {/* Carte sécurité client — visible si au moins un projet actif */}
      {requests.some(r => r.status === 'awarded') && (
        <div className="mb-5 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Préparez un espace de travail sécuritaire</p>
            <ul className="text-xs text-gray-600 mt-1.5 space-y-1 list-disc list-inside">
              <li>Dégagez la zone d'intervention et sécurisez enfants et animaux</li>
              <li>Signalez au prestataire tout risque connu (amiante, plomb, instabilité)</li>
              <li>Assurez l'accès à l'eau, l'électricité et les sorties d'urgence</li>
              <li>Vérifiez la licence RBQ du prestataire pour les travaux réglementés</li>
            </ul>
          </div>
        </div>
      )}

      {/* Stat cards */}
      {total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total',           value: total,     color: 'text-gray-900',    bg: 'bg-gray-50'     },
            { label: 'En attente',      value: active,    color: 'text-blue-700',    bg: 'bg-blue-50'     },
            { label: 'Pro sélectionné', value: awarded,   color: 'text-yellow-700',  bg: 'bg-yellow-50'   },
            { label: 'Terminés',        value: completed, color: 'text-emerald-700', bg: 'bg-emerald-50'  },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Liste des projets */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-coupdemain-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-coupdemain-primary" />
          </div>
          <p className="text-gray-800 font-bold text-lg">Aucun projet pour l'instant</p>
          <p className="text-gray-400 text-sm mt-1.5 mb-6">Publiez une demande et recevez des offres de pros vérifiés.</p>
          <button onClick={() => navigate('/services')}
            className="inline-flex items-center gap-2 bg-coupdemain-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-coupdemain-primary/90 transition">
            <Plus className="w-4 h-4" />Publier ma première demande
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const isExpanded  = expandedId === req.id;
            const reqBids     = bids[req.id] ?? [];
            const sc          = statusConfig(req);
            const steps       = projectSteps(req);
            const canEdit     = req.status === 'open';
            const currentStep = steps.filter(s => s.done).length - 1;

            return (
              <div key={req.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 transition-all ${isExpanded ? 'border-coupdemain-primary/20' : 'border-transparent'}`}>

                {/* Card header — cliquable pour expand */}
                <button onClick={() => toggleRequest(req)} className="w-full p-5 text-left hover:bg-gray-50/60 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${sc.color}`}>
                          {sc.label}
                        </span>
                        {req.category && (
                          <span className="text-xs text-gray-400">{req.category.name}</span>
                        )}
                      </div>
                      <p className="font-bold text-gray-900 text-base leading-snug">{req.title}</p>
                      {req.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{req.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 flex-wrap">
                        {req.service_area && (
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{req.service_area}</span>
                        )}
                        {req.preferred_dates && (
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{req.preferred_dates}</span>
                        )}
                        {req.submission_deadline && (
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Limite : {new Date(req.submission_deadline).toLocaleDateString('fr-CA')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {canEdit && (
                        <button
                          onClick={e => { e.stopPropagation(); setEditingReq(req); }}
                          className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {isExpanded
                        ? <ChevronUp className="w-5 h-5 text-gray-400" />
                        : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </div>
                  </div>

                  {/* Progress steps */}
                  {req.status !== 'cancelled' && (
                    <div className="flex items-center gap-0 mt-4">
                      {steps.map((step, i) => (
                        <React.Fragment key={i}>
                          <div className="flex flex-col items-center">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                              step.done
                                ? 'bg-coupdemain-primary border-coupdemain-primary'
                                : i === currentStep + 1
                                ? 'border-coupdemain-primary/40 bg-white'
                                : 'border-gray-200 bg-white'
                            }`}>
                              {step.done && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                            <p className={`text-[10px] mt-1 text-center leading-tight max-w-[60px] ${
                              step.done ? 'text-coupdemain-primary font-medium' : 'text-gray-400'
                            }`}>{step.label}</p>
                          </div>
                          {i < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mb-4 mx-1 transition-all ${step.done ? 'bg-coupdemain-primary' : 'bg-gray-200'}`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </button>

                {/* Expanded: offres reçues */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-5 space-y-3">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      {reqBids.length === 0 && bidsLoading !== req.id ? 'Offres reçues' : `${reqBids.length} offre${reqBids.length > 1 ? 's' : ''} reçue${reqBids.length > 1 ? 's' : ''}`}
                    </p>

                    {bidsLoading === req.id ? (
                      <div className="space-y-2">
                        {[...Array(2)].map((_, i) => (
                          <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                            <div className="h-3 bg-gray-100 rounded w-1/3 mb-2" />
                            <div className="h-3 bg-gray-100 rounded w-full" />
                          </div>
                        ))}
                      </div>
                    ) : reqBids.length === 0 ? (
                      <div className="bg-white rounded-xl p-6 text-center">
                        <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm text-gray-500">Aucune offre reçue pour l'instant.</p>
                        <p className="text-xs text-gray-400 mt-1">Les prestataires de votre région ont été notifiés.</p>
                      </div>
                    ) : (
                      reqBids.map(bid => {
                        const providerName = bid.provider
                          ? [bid.provider.first_name, bid.provider.last_name].filter(Boolean).join(' ') || bid.provider.username
                          : '—';
                        return (
                          <div key={bid.id} className={`bg-white rounded-xl p-4 border-2 transition-all ${bid.status === 'accepted' ? 'border-coupdemain-primary/30' : 'border-transparent'}`}>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <p className="font-semibold text-gray-900 text-sm">{providerName}</p>
                                  {(bid.provider as any)?.is_verified && (
                                    <span className="flex items-center gap-0.5 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                      <Shield className="w-3 h-3" />Vérifié
                                    </span>
                                  )}
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
                                <p className="text-sm text-gray-600 mb-2 line-clamp-3">{bid.message}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                                  <span className="font-bold text-gray-800 text-sm">
                                    ${parseFloat(bid.price).toFixed(2)} <span className="font-normal text-xs">{bid.price_unit}</span>
                                  </span>
                                  {bid.estimated_duration && (
                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{bid.estimated_duration}h estimées</span>
                                  )}
                                </div>
                              </div>

                              {/* Actions sur l'offre */}
                              <div className="shrink-0 flex flex-col gap-2 items-end">
                                {req.status === 'open' && bid.status === 'pending' && (
                                  <button onClick={() => acceptBid(bid.id, req.id)} disabled={accepting === bid.id}
                                    className="flex items-center gap-1.5 bg-coupdemain-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition disabled:opacity-50">
                                    <CheckCircle className="w-4 h-4" />
                                    {accepting === bid.id ? 'Acceptation…' : 'Choisir ce pro'}
                                  </button>
                                )}

                                {bid.status === 'accepted' && (
                                  <>
                                    <p className="text-xs text-gray-400 text-right">Commission Coupdemain {commissionRate(bid.price)}% incluse</p>
                                    <button onClick={() => payBid(bid.id)} disabled={paying === bid.id}
                                      className="flex items-center gap-1.5 bg-coupdemain-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition disabled:opacity-50">
                                      <DollarSign className="w-4 h-4" />
                                      {paying === bid.id ? 'Redirection…' : `Payer $${parseFloat(bid.price).toFixed(2)}`}
                                    </button>
                                    <a href={`/api/contracts/${bid.id}/`} target="_blank" rel="noopener noreferrer"
                                      className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                                      <FileText className="w-4 h-4" />Contrat PDF
                                    </a>
                                    {bid.provider && (
                                      <button onClick={() => {
                                        window.dispatchEvent(new CustomEvent('open-messages', { detail: { partnerId: bid.provider!.id } }));
                                        window.dispatchEvent(new CustomEvent('switch-tab', { detail: { tab: 'messages' } }));
                                      }}
                                        className="flex items-center gap-1.5 border border-coupdemain-primary/30 text-coupdemain-primary bg-coupdemain-primary/5 px-4 py-2 rounded-xl text-sm font-medium hover:bg-coupdemain-primary/10 transition">
                                        <MessageSquare className="w-4 h-4" />Contacter
                                      </button>
                                    )}
                                    {req.status === 'awarded' && (
                                      <button onClick={() => completeRequest(req.id)} disabled={completing === req.id}
                                        className="flex items-center gap-1.5 border border-emerald-300 text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-100 transition disabled:opacity-50">
                                        <CheckCircle className="w-4 h-4" />
                                        {completing === req.id ? 'Mise à jour…' : 'Marquer comme terminé'}
                                      </button>
                                    )}
                                    {req.status === 'completed' && !reviewedBidIds.has(bid.id) && (
                                      <button onClick={() => setReviewBid({ bid, providerName })}
                                        className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-yellow-100 transition">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />Laisser un avis
                                      </button>
                                    )}
                                    {req.status === 'completed' && reviewedBidIds.has(bid.id) && (
                                      <span className="flex items-center gap-1.5 text-xs text-gray-400 px-3 py-1.5">
                                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />Avis publié
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
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

      {/* Modals */}
      {editingReq && (
        <EditRequestModal
          req={editingReq}
          onClose={() => setEditingReq(null)}
          onSave={updated => {
            setRequests(prev => prev.map(r => r.id === editingReq.id ? { ...r, ...updated } : r));
            showToast('Demande modifiée avec succès.', 'success');
          }}
        />
      )}
      {reviewBid && (
        <BidReviewModal
          bid={reviewBid.bid}
          providerName={reviewBid.providerName}
          onClose={() => setReviewBid(null)}
          onDone={() => {
            setReviewedBidIds(prev => new Set([...prev, reviewBid.bid.id]));
            showToast('Avis publié ! Merci pour votre retour.', 'success');
          }}
        />
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

// ─── Bid Review Modal ─────────────────────────────────────────────────────────

function BidReviewModal({ bid, providerName, onClose, onDone }: {
  bid: Bid;
  providerName: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [rating, setRating]   = useState(5);
  const [comment, setComment] = useState('');
  const [quality, setQuality] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await axios.post('reviews/', {
        bid: bid.id,
        rating,
        comment,
        quality_rating: quality,
        punctuality_rating: punctuality,
        communication_rating: communication,
      });
      onDone();
      onClose();
    } catch (e: any) {
      const data = e?.response?.data;
      setError(data ? Object.values(data).flat().join(' ') : "Erreur lors de l'envoi.");
      setSubmitting(false);
    }
  };

  const StarRow = ({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} type="button" onClick={() => onChange(n)}
            className={`text-xl transition ${n <= value ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`}>
            ★
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">Évaluer le prestataire</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600 transition" /></button>
        </div>
        <div className="p-6 space-y-5">
          <p className="text-sm text-gray-500">Prestataire : <span className="font-semibold text-gray-900">{providerName}</span></p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Note globale</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setRating(n)}
                  className={`text-3xl transition ${n <= rating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`}>
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 bg-gray-50 rounded-xl p-4">
            <StarRow label="Qualité du travail" value={quality} onChange={setQuality} />
            <StarRow label="Ponctualité" value={punctuality} onChange={setPunctuality} />
            <StarRow label="Communication" value={communication} onChange={setCommunication} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire <span className="text-red-400">*</span></label>
            <textarea rows={4} value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Décrivez votre expérience avec ce prestataire…"
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

// ─── Client Bookings Tab (remplacé par ClientProjectsTab) ─────────────────────

// ─── Provider CRM Tab ─────────────────────────────────────────────────────────

type CRMNote = { id: number; author: { username: string; first_name: string; last_name: string }; content: string; created_at: string };
type CRMServiceLink = { id: number; service_request_title: string; service_area: string; price: string; price_unit: string; date: string; bid_status: string };
type CRMClient = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  pipeline_stage: string;
  source: string;
  total_revenue: string;
  last_service_date: string | null;
  service_count: number;
  reminder_date: string | null;
  reminder_note: string;
  created_at: string;
  updated_at: string;
  user: number | null;
  notes?: CRMNote[];
  service_links?: CRMServiceLink[];
};

const PIPELINE_STAGES: { value: string; label: string; color: string }[] = [
  { value: 'lead',      label: 'Lead',               color: 'bg-gray-100 text-gray-600' },
  { value: 'contacted', label: 'Contacté',            color: 'bg-blue-100 text-blue-700' },
  { value: 'quoted',    label: 'Soumission envoyée',  color: 'bg-yellow-100 text-yellow-700' },
  { value: 'active',    label: 'Client actif',        color: 'bg-green-100 text-green-700' },
  { value: 'recurring', label: 'Récurrent',           color: 'bg-emerald-100 text-emerald-700' },
  { value: 'inactive',  label: 'Inactif',             color: 'bg-red-100 text-red-600' },
];

function stageInfo(value: string) {
  return PIPELINE_STAGES.find(s => s.value === value) ?? PIPELINE_STAGES[0];
}

// ── Revenue bar chart (CSS only, no deps) ──
function CRMRevenueChart() {
  const [months, setMonths] = useState<{ month: string; revenue: number }[]>([]);
  useEffect(() => {
    axios.get('crm/revenue-chart/').then(r => setMonths(r.data as any)).catch(() => {});
  }, []);
  const max = Math.max(...months.map(m => m.revenue), 1);
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenus mensuels (6 mois)</h3>
      <div className="flex items-end gap-3 h-28">
        {months.map(m => {
          const pct = Math.round((m.revenue / max) * 100);
          return (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-400">{m.revenue > 0 ? `$${m.revenue.toFixed(0)}` : ''}</span>
              <div className="w-full rounded-t-lg bg-emerald-500 transition-all" style={{ height: `${Math.max(pct, 2)}%` }} />
              <span className="text-[10px] text-gray-400 text-center leading-tight">{m.month.split(' ')[0]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Client drawer ──
function CRMClientDrawer({ client, onClose, onSaved }: { client: CRMClient; onClose: () => void; onSaved: (c: CRMClient) => void }) {
  const [data, setData] = useState<CRMClient>(client);
  const [notes, setNotes] = useState<CRMNote[]>(client.notes ?? []);
  const [links, setLinks] = useState<CRMServiceLink[]>(client.service_links ?? []);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  // Load detail if needed
  useEffect(() => {
    axios.get(`crm/${client.id}/`).then(r => {
      const d = r.data as CRMClient;
      setData(d);
      setNotes(d.notes ?? []);
      setLinks(d.service_links ?? []);
    }).catch(() => {});
  }, [client.id]);

  const save = () => {
    setSaving(true);
    axios.patch(`crm/${data.id}/`, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      pipeline_stage: data.pipeline_stage,
      reminder_date: data.reminder_date || null,
      reminder_note: data.reminder_note,
    }).then(r => {
      onSaved(r.data as CRMClient);
      setSaving(false);
    }).catch(() => { setSaving(false); });
  };

  const submitNote = () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    axios.post(`crm/${data.id}/notes/`, { content: newNote }).then(r => {
      setNotes(prev => [r.data as CRMNote, ...prev]);
      setNewNote('');
      setAddingNote(false);
    }).catch(() => { setAddingNote(false); });
  };

  const deleteNote = (noteId: number) => {
    axios.delete(`crm/${data.id}/notes/${noteId}/`).then(() => {
      setNotes(prev => prev.filter(n => n.id !== noteId));
    }).catch(() => {});
  };

  const stage = stageInfo(data.pipeline_stage);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="relative w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{data.name}</h2>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stage.color}`}>{stage.label}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Contact info */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Contact</h3>
            <div className="space-y-2">
              <input
                type="text" placeholder="Nom complet"
                value={data.name}
                onChange={e => setData(d => ({ ...d, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-coupdemain-primary"
              />
              <input
                type="email" placeholder="Courriel"
                value={data.email}
                onChange={e => setData(d => ({ ...d, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-coupdemain-primary"
              />
              <input
                type="tel" placeholder="Téléphone"
                value={data.phone}
                onChange={e => setData(d => ({ ...d, phone: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-coupdemain-primary"
              />
              <input
                type="text" placeholder="Adresse"
                value={data.address}
                onChange={e => setData(d => ({ ...d, address: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-coupdemain-primary"
              />
            </div>
          </section>

          {/* Pipeline */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Étape pipeline</h3>
            <div className="flex flex-wrap gap-2">
              {PIPELINE_STAGES.map(s => (
                <button
                  key={s.value}
                  onClick={() => setData(d => ({ ...d, pipeline_stage: s.value }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                    data.pipeline_stage === s.value
                      ? `${s.color} border-transparent shadow-sm`
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          {/* Reminder */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Rappel de suivi</h3>
            <input
              type="date"
              value={data.reminder_date ?? ''}
              onChange={e => setData(d => ({ ...d, reminder_date: e.target.value || null }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-coupdemain-primary mb-2"
            />
            <input
              type="text" placeholder="Note de rappel (optionnel)"
              value={data.reminder_note}
              onChange={e => setData(d => ({ ...d, reminder_note: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-coupdemain-primary"
            />
          </section>

          {/* Stats */}
          <section className="grid grid-cols-3 gap-3">
            {[
              { label: 'Services', value: data.service_count },
              { label: 'Revenus', value: `$${parseFloat(data.total_revenue || '0').toFixed(0)}` },
              { label: 'Dernier service', value: data.last_service_date ? new Date(data.last_service_date).toLocaleDateString('fr-CA') : '—' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{s.value}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </section>

          {/* Service history */}
          {links.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Historique des services</h3>
              <div className="space-y-2">
                {links.map(lnk => (
                  <div key={lnk.id} className="bg-gray-50 rounded-xl p-3 text-sm">
                    <p className="font-medium text-gray-800 truncate">{lnk.service_request_title}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{lnk.service_area}</span>
                      <span className="font-semibold text-gray-700">${parseFloat(lnk.price).toFixed(2)} {lnk.price_unit}</span>
                      <span>{new Date(lnk.date).toLocaleDateString('fr-CA')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Notes */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Notes internes</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Ajouter une note…"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitNote(); }}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-coupdemain-primary"
              />
              <button
                onClick={submitNote}
                disabled={addingNote || !newNote.trim()}
                className="px-4 py-2 bg-coupdemain-primary text-white rounded-xl text-sm font-medium disabled:opacity-50"
              >
                +
              </button>
            </div>
            {notes.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Aucune note pour l'instant.</p>
            ) : (
              <div className="space-y-2">
                {notes.map(note => (
                  <div key={note.id} className="bg-gray-50 rounded-xl px-3 py-2 flex items-start gap-2 group">
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{note.content}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(note.created_at).toLocaleDateString('fr-CA')}</p>
                    </div>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-500 mt-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Save */}
          <button
            onClick={save}
            disabled={saving}
            className="w-full py-3 bg-coupdemain-primary text-white rounded-xl font-semibold text-sm disabled:opacity-50"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add client modal ──
function CRMAddClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: CRMClient) => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', pipeline_stage: 'lead' });
  const [saving, setSaving] = useState(false);
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const submit = () => {
    if (!form.name.trim()) return;
    setSaving(true);
    axios.post('crm/', form).then(r => {
      onCreated(r.data as CRMClient);
      onClose();
      setSaving(false);
    }).catch(() => { setSaving(false); });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="font-bold text-gray-900 text-lg mb-4">Nouveau client</h2>
        <div className="space-y-3">
          <input type="text" placeholder="Nom complet *" value={form.name} onChange={f('name')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-coupdemain-primary" />
          <input type="email" placeholder="Courriel" value={form.email} onChange={f('email')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-coupdemain-primary" />
          <input type="tel" placeholder="Téléphone" value={form.phone} onChange={f('phone')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-coupdemain-primary" />
          <input type="text" placeholder="Adresse" value={form.address} onChange={f('address')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-coupdemain-primary" />
          <select value={form.pipeline_stage} onChange={f('pipeline_stage')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-coupdemain-primary">
            {PIPELINE_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
          <button onClick={submit} disabled={saving || !form.name.trim()}
            className="flex-1 py-2.5 bg-coupdemain-primary text-white rounded-xl text-sm font-semibold disabled:opacity-50">
            {saving ? 'Création…' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProviderCRMTab() {
  const [clients, setClients] = useState<CRMClient[]>([]);
  const [stats, setStats] = useState<{ total_clients: number; total_revenue: number; recurring_count: number; reminders_due: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [selectedClient, setSelectedClient] = useState<CRMClient | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [importing, setImporting] = useState(false);

  const load = (q?: string, stage?: string) => {
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    if (stage) params.set('stage', stage);
    return axios.get(`crm/?${params}`).then(r => {
      const d = r.data as any;
      setClients(Array.isArray(d) ? d : (d.results ?? []));
    });
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      load(search, stageFilter),
      axios.get('crm/stats/').then(r => setStats(r.data as any)).catch(() => {}),
    ]).then(() => setLoading(false)).catch(() => setLoading(false));
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => load(search, stageFilter), 300);
    return () => clearTimeout(t);
  }, [search, stageFilter]);

  const importBids = () => {
    setImporting(true);
    axios.post('crm/import_bids/').then(r => {
      const { imported } = r.data as { imported: number };
      if (imported > 0) load(search, stageFilter);
      axios.get('crm/stats/').then(s => setStats(s.data as any)).catch(() => {});
      setImporting(false);
    }).catch(() => { setImporting(false); });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-900">CRM clients</h2>
          <p className="text-sm text-gray-500 mt-0.5">Gérez vos relations clients et votre pipeline.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={importBids}
            disabled={importing}
            className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {importing ? 'Import…' : 'Importer offres acceptées'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-coupdemain-primary text-white text-sm rounded-xl font-semibold"
          >
            + Nouveau client
          </button>
        </div>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Clients',        value: stats.total_clients,                               icon: <User className="w-5 h-5 text-blue-400" /> },
            { label: 'Revenus réels',  value: `$${stats.total_revenue.toFixed(0)}`,              icon: <DollarSign className="w-5 h-5 text-emerald-400" /> },
            { label: 'Récurrents',     value: stats.recurring_count,                             icon: <TrendingUp className="w-5 h-5 text-green-400" /> },
            { label: 'Rappels à faire', value: stats.reminders_due,                              icon: <Bell className="w-5 h-5 text-amber-400" /> },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{s.value}</p>
              </div>
              {s.icon}
            </div>
          ))}
        </div>
      )}

      {/* Revenue chart */}
      <div className="mb-6">
        <CRMRevenueChart />
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Rechercher un client…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-40 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-coupdemain-primary bg-white"
        />
        <select
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-coupdemain-primary bg-white"
        >
          <option value="">Toutes les étapes</option>
          {PIPELINE_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Client list */}
      {loading ? (
        <p className="text-center text-gray-400 text-sm py-12">Chargement…</p>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <BarChart2 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 font-medium">Aucun client pour l'instant</p>
          <p className="text-gray-400 text-sm mt-1">Importez vos offres acceptées ou ajoutez un client manuellement.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clients.map(c => {
            const stage = stageInfo(c.pipeline_stage);
            const reminderDue = c.reminder_date && c.reminder_date <= today;
            const initials = c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
            return (
              <button
                key={c.id}
                onClick={() => setSelectedClient(c)}
                className="w-full bg-white rounded-2xl shadow-sm p-4 text-left hover:shadow-md transition-shadow flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-coupdemain-primary/10 flex items-center justify-center text-sm font-bold text-coupdemain-primary shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${stage.color}`}>{stage.label}</span>
                    {reminderDue && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                        <Bell className="w-2.5 h-2.5" /> Rappel
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    {c.email && <span>{c.email}</span>}
                    {c.phone && <span>{c.phone}</span>}
                    <span>{c.service_count} service{c.service_count !== 1 ? 's' : ''}</span>
                    <span className="font-medium text-gray-600">${parseFloat(c.total_revenue || '0').toFixed(0)} de revenus</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {/* Drawer */}
      {selectedClient && (
        <CRMClientDrawer
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onSaved={updated => {
            setClients(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
            setSelectedClient(updated);
          }}
        />
      )}

      {/* Add modal */}
      {showAddModal && (
        <CRMAddClientModal
          onClose={() => setShowAddModal(false)}
          onCreated={c => {
            setClients(prev => [c, ...prev]);
            setStats(prev => prev ? { ...prev, total_clients: prev.total_clients + 1 } : prev);
          }}
        />
      )}
    </div>
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
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string; description?: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [acceptedCnesst, setAcceptedCnesst] = useState(false);

  // Step 1 — profil
  const [bio, setBio]       = useState(user?.bio || '');
  const [phone, setPhone]   = useState(user?.phone_number || '');
  const [address, setAddress] = useState(user?.address || '');

  // Step 2 — sélection des services
  const [selectedCats, setSelectedCats] = useState<number[]>([]);

  useEffect(() => {
    axios.get('categories/').then(r => {
      const d = r.data as any;
      setCategories(Array.isArray(d) ? d : (d.results ?? []));
    }).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await axios.post('become-provider/', { cnesst_accepted: true });
      localStorage.setItem('user', JSON.stringify(res.data));

      if (bio || phone || address) {
        await axios.patch('profile/', {
          ...(bio    ? { bio }                    : {}),
          ...(phone  ? { phone_number: phone }    : {}),
          ...(address ? { address }               : {}),
        });
      }

      for (const catId of selectedCats) {
        await axios.post('services/', { category_id: catId, title: categories.find(c => c.id === catId)?.name ?? '' });
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
            <p className="text-xs text-gray-400 mt-0.5">Étape {step} sur 4</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div className="h-1 bg-coupdemain-primary transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
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

          {/* ── Step 2 : Vos services ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="mb-2">
                <p className="font-semibold text-gray-900 text-base">Quels services offrez-vous ?</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Sélectionnez les types de services pour lesquels vous acceptez des demandes de soumission.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {categories.map(cat => {
                  const isSelected = selectedCats.includes(cat.id);
                  const style = getCategoryStyle(cat.slug);
                  const Icon = style.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCats(prev =>
                        isSelected ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                      )}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all text-left ${isSelected ? 'border-coupdemain-primary shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      {/* Photo + gradient + icône */}
                      <div className="relative aspect-[3/2] overflow-hidden bg-gray-100">
                        <img src={getCategoryImage(cat.slug)} alt={cat.name} className="w-full h-full object-cover" />
                        <div className={`absolute inset-0 bg-gradient-to-t ${style.gradient} opacity-80`} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon className="w-8 h-8 text-white drop-shadow-lg" />
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-5 h-5 text-white drop-shadow" />
                          </div>
                        )}
                      </div>
                      {/* Nom + description */}
                      <div className="px-2.5 py-2">
                        <p className="text-xs font-semibold text-gray-900 leading-snug">{cat.name}</p>
                        {cat.description && (
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-snug line-clamp-2">{cat.description}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStep(1)} className="text-gray-500 text-sm hover:text-gray-700 transition">← Retour</button>
                <div className="flex gap-3">
                  <button onClick={() => setStep(3)}
                    className="text-gray-500 text-sm border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition">
                    Passer
                  </button>
                  <button onClick={() => setStep(3)}
                    disabled={selectedCats.length === 0}
                    className="bg-coupdemain-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition disabled:opacity-40">
                    Suivant →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3 : Sécurité ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <p className="font-semibold text-gray-900 text-base">Travailler sécuritairement</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  En tant que travailleur autonome, votre sécurité est votre responsabilité. Voici les points essentiels à connaître.
                </p>
              </div>

              <div className="max-h-64 overflow-y-auto pr-1 space-y-1">
                <SafetyTipsContent selectedSlugs={selectedCats.map(id => categories.find(c => c.id === id)?.slug ?? '').filter(Boolean)} />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedCnesst}
                    onChange={e => setAcceptedCnesst(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-amber-600 cursor-pointer shrink-0"
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    Je comprends que j'exerce à titre de <strong>travailleur autonome indépendant</strong>.
                    Je suis seul(e) responsable de ma couverture auprès de la <strong>CNESST</strong>,
                    de mes assurances et du respect des règles de sécurité dans le cadre de mes prestations.
                    Coupdemain ne peut être tenu responsable en cas d'accident.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStep(2)} className="text-gray-500 text-sm hover:text-gray-700 transition">← Retour</button>
                <button onClick={() => setStep(4)} disabled={!acceptedCnesst}
                  className="bg-coupdemain-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-coupdemain-primary/90 transition disabled:opacity-40">
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4 : Confirmation ── */}
          {step === 4 && (
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
                {selectedCats.length > 0 && (
                  <div className="border-t pt-3 mt-2">
                    <div className="flex gap-2">
                      <span className="text-gray-400 w-24 shrink-0">Services</span>
                      <span className="text-gray-700">{selectedCats.map(id => categories.find(c => c.id === id)?.name).filter(Boolean).join(', ')}</span>
                    </div>
                  </div>
                )}
                {selectedCats.length === 0 && (
                  <p className="text-gray-400 text-xs italic pt-1">Aucun service sélectionné — vous pourrez en activer depuis votre tableau de bord.</p>
                )}
              </div>

              {error && (
                <p className="text-red-600 text-sm text-center bg-red-50 py-2 px-3 rounded-lg">{error}</p>
              )}

              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setStep(3)} className="text-gray-500 text-sm hover:text-gray-700 transition">← Retour</button>
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
    return activeMode === 'provider' ? 'overview' : 'projects';
  });

  const switchMode = (mode: Mode) => {
    setActiveMode(mode);
    localStorage.setItem('dashboard_mode', mode);
    setActiveTab(mode === 'provider' ? 'overview' : 'projects');
  };

  // Gestion du retour Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const bidId = params.get('bid');
    if (paymentStatus === 'success') {
      navigate(`/paiement-confirme?bid=${bidId ?? ''}`, { replace: true });
    } else if (paymentStatus === 'cancelled') {
      showToast('Paiement annulé.', 'warning');
      navigate('/dashboard', { replace: true });
    }
  }, []);

  // Listen for tab-switch events from child components (e.g. "Contacter" button)
  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail?.tab;
      if (tab) setActiveTab(tab);
    };
    window.addEventListener('switch-tab', handler);
    return () => window.removeEventListener('switch-tab', handler);
  }, []);

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
    { key: 'projects',      label: 'Mes projets',      icon: <Briefcase className="w-5 h-5" /> },
    { key: 'messages',      label: 'Messages',          icon: <MessageSquare className="w-5 h-5" /> },
    { key: 'notifications', label: 'Notifications',    icon: notifIcon },
    { key: 'profile',       label: 'Mon profil',        icon: <User className="w-5 h-5" /> },
    { key: 'settings',      label: 'Paramètres',        icon: <Settings className="w-5 h-5" /> },
  ];

  const providerNavItems = [
    { key: 'overview',      label: "Vue d'ensemble",   icon: <TrendingUp className="w-5 h-5" /> },
    { key: 'safety',        label: 'Sécurité',         icon: <Shield className="w-5 h-5" /> },
    { key: 'requests',      label: 'Demandes',         icon: <FileText className="w-5 h-5" /> },
    { key: 'crm',           label: 'CRM',              icon: <BarChart2 className="w-5 h-5" /> },
    { key: 'services',      label: 'Mes services',     icon: <Briefcase className="w-5 h-5" /> },
    { key: 'portfolio',     label: 'Portfolio',        icon: <Camera className="w-5 h-5" /> },
    { key: 'bookings',      label: 'Réservations',     icon: <Calendar className="w-5 h-5" /> },
    { key: 'messages',      label: 'Messages',          icon: <MessageSquare className="w-5 h-5" /> },
    { key: 'notifications', label: 'Notifications',    icon: notifIcon },
    { key: 'profile',       label: 'Mon profil',        icon: <User className="w-5 h-5" /> },
    { key: 'settings',      label: 'Paramètres',        icon: <Settings className="w-5 h-5" /> },
  ];

  const navItems = isProviderMode ? providerNavItems : clientNavItems;


  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Mobile top bar ── */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4">
        <div className="flex items-center justify-between h-14">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 p-2">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-base font-bold text-coupdemain-primary">Coupdemain</span>
          <span className="w-10" />
        </div>
        {/* Toggle Client / Prestataire visible directement sur mobile */}
        {user?.has_provider_profile && (
          <div className="pb-3">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => switchMode('client')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                  !isProviderMode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                }`}
              >
                Client
              </button>
              <button
                onClick={() => switchMode('provider')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                  isProviderMode ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                }`}
              >
                Prestataire
              </button>
            </div>
          </div>
        )}
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
      <div className="md:ml-64 p-4 md:p-8">
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

        {/* ── ONBOARDING CLIENT — première visite ── */}
        {!isProviderMode && !(user as any)?.has_made_request && activeTab !== 'projects' && (
          <div className="mb-5 flex items-start gap-3 bg-coupdemain-primary/5 border border-coupdemain-primary/20 rounded-2xl p-4">
            <div className="w-8 h-8 bg-coupdemain-primary/15 rounded-full flex items-center justify-center shrink-0">
              <Send className="w-4 h-4 text-coupdemain-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Publiez votre première demande</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Décrivez votre projet et recevez des soumissions gratuites de prestataires vérifiés en moins de 24h.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('projects')}
              className="text-xs font-semibold text-coupdemain-primary bg-coupdemain-primary/10 hover:bg-coupdemain-primary/20 px-3 py-1.5 rounded-lg transition shrink-0"
            >
              Publier →
            </button>
          </div>
        )}

        {/* ── MODE CLIENT ── */}
        {!isProviderMode && activeTab === 'projects'      && <ClientProjectsTab />}
        {!isProviderMode && activeTab === 'messages'      && <MessagesTab />}
        {!isProviderMode && activeTab === 'notifications' && <NotificationsTab />}
        {!isProviderMode && activeTab === 'profile'       && <ProfileTab />}
        {!isProviderMode && activeTab === 'settings'      && <SettingsTab />}

        {/* ── ONBOARDING PRESTATAIRE — profil incomplet ── */}
        {isProviderMode && !((user as any)?.bio) && !((user as any)?.profile_picture) && activeTab !== 'profile' && (
          <div className="mb-5 flex items-start gap-3 bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Complétez votre profil prestataire</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Ajoutez une photo, une bio et vos spécialités pour inspirer confiance et recevoir plus de contrats.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className="text-xs font-semibold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded-lg transition shrink-0"
            >
              Compléter →
            </button>
          </div>
        )}

        {/* GPS banner pour prestataires sans position */}
        {isProviderMode && !(user as any)?.latitude && (
          <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">Position GPS non configurée</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Définissez votre localisation pour recevoir des demandes de clients près de chez vous.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className="text-xs font-semibold text-amber-800 bg-amber-200 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition shrink-0"
            >
              Configurer →
            </button>
          </div>
        )}

        {/* ── MODE PRESTATAIRE ── */}
        {isProviderMode && activeTab === 'overview'      && <ProviderOverviewTab />}
        {isProviderMode && activeTab === 'requests'      && <ProviderRequestsTab />}
        {isProviderMode && activeTab === 'crm'           && <ProviderCRMTab />}
        {isProviderMode && activeTab === 'services'      && <ProviderServicesTab />}
        {isProviderMode && activeTab === 'portfolio'     && <PortfolioTab />}
        {isProviderMode && activeTab === 'bookings'      && <ProviderBookingsTab />}
        {isProviderMode && activeTab === 'safety'        && <SafetyTab />}
        {isProviderMode && activeTab === 'messages'      && <MessagesTab />}
        {isProviderMode && activeTab === 'notifications' && <NotificationsTab />}
        {isProviderMode && activeTab === 'profile'       && <ProfileTab />}
        {isProviderMode && activeTab === 'settings'      && <SettingsTab />}
      </div>

      {showOnboarding && <ProviderOnboardingModal onClose={() => setShowOnboarding(false)} />}
    </div>
  );
}
