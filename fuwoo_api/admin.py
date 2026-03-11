# fuwoo_api/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.contrib import messages
from .emails import send_identity_verified, send_identity_rejected
from .models import (
    CustomUser, ServiceCategory, Service, ServiceImage,
    Availability, Booking, Review, Message, Notification,
    ServiceRequest, ServiceRequestImage, Bid, Payment, PortfolioPhoto,
)

# ─── Titre du back-office ────────────────────────────────────────────────────

admin.site.site_header  = "Fuwoo — Administration"
admin.site.site_title   = "Fuwoo Admin"
admin.site.index_title  = "Tableau de bord"


# ─── Utilisateurs ────────────────────────────────────────────────────────────

def approve_identity(modeladmin, request, queryset):
    users = queryset.filter(identity_status='pending')
    count = 0
    for user in users:
        user.identity_status = 'verified'
        user.is_verified = True
        user.save(update_fields=['identity_status', 'is_verified'])
        send_identity_verified(user)
        count += 1
    messages.success(request, f"{count} identité(s) approuvée(s). Email envoyé aux prestataires.")
approve_identity.short_description = "✅ Approuver la vérification d'identité"


def reject_identity(modeladmin, request, queryset):
    reason = "Document non conforme. Veuillez soumettre une pièce d'identité officielle valide (passeport, permis de conduire)."
    users = queryset.filter(identity_status='pending')
    count = 0
    for user in users:
        user.identity_status = 'rejected'
        user.identity_rejection_reason = reason
        user.save(update_fields=['identity_status', 'identity_rejection_reason'])
        send_identity_rejected(user, reason)
        count += 1
    messages.warning(request, f"{count} identité(s) rejetée(s). Email envoyé aux prestataires.")
reject_identity.short_description = "❌ Rejeter la vérification d'identité"


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display  = ("username", "email", "full_name", "role", "has_provider_profile",
                     "is_verified", "identity_status_badge", "email_verified",
                     "rating", "total_reviews", "is_active", "date_joined")
    list_filter   = ("role", "has_provider_profile", "is_verified", "identity_status",
                     "email_verified", "is_staff", "is_active")
    search_fields = ("username", "email", "first_name", "last_name", "phone_number")
    ordering      = ("-date_joined",)
    readonly_fields = ("date_joined", "last_login", "rating", "total_reviews",
                       "created_at", "updated_at", "identity_document_preview")
    actions = [approve_identity, reject_identity]

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Informations personnelles", {"fields": (
            "first_name", "last_name", "email", "phone_number", "address",
            "profile_picture", "bio",
        )}),
        ("Rôle & profil prestataire", {"fields": (
            "role", "has_provider_profile", "is_verified", "email_verified",
            "rating", "total_reviews",
        )}),
        ("Vérification d'identité", {"fields": (
            "identity_status", "identity_document", "identity_document_preview",
            "identity_rejection_reason",
        )}),
        ("Géolocalisation", {"fields": ("latitude", "longitude")}),
        ("Permissions", {"fields": ("is_staff", "is_active", "is_superuser", "groups", "user_permissions")}),
        ("Dates", {"fields": ("last_login", "date_joined", "created_at", "updated_at")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "email", "password1", "password2", "role", "is_staff", "is_active"),
        }),
    )

    @admin.display(description="Nom complet")
    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or "—"

    @admin.display(description="Identité")
    def identity_status_badge(self, obj):
        colors = {
            'not_submitted': '#9ca3af',
            'pending':       '#f59e0b',
            'verified':      '#10b981',
            'rejected':      '#ef4444',
        }
        labels = {
            'not_submitted': 'Non soumis',
            'pending':       '⏳ En attente',
            'verified':      '✅ Vérifié',
            'rejected':      '❌ Rejeté',
        }
        color = colors.get(obj.identity_status, '#9ca3af')
        label = labels.get(obj.identity_status, obj.identity_status)
        return format_html(
            '<span style="color:{};font-weight:600">{}</span>', color, label
        )

    @admin.display(description="Aperçu document")
    def identity_document_preview(self, obj):
        if not obj.identity_document:
            return "Aucun document soumis"
        url = obj.identity_document.url
        name = obj.identity_document.name.split('/')[-1]
        if name.lower().endswith('.pdf'):
            return format_html('<a href="{}" target="_blank">📄 Ouvrir le PDF ({})</a>', url, name)
        return format_html(
            '<a href="{}" target="_blank"><img src="{}" style="max-height:200px;border-radius:6px;"></a>',
            url, url
        )


# ─── Catégories ──────────────────────────────────────────────────────────────

@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display  = ("name", "slug", "icon", "is_active", "created_at")
    list_filter   = ("is_active",)
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


# ─── Services ────────────────────────────────────────────────────────────────

class ServiceImageInline(admin.TabularInline):
    model   = ServiceImage
    extra   = 0
    readonly_fields = ("image_preview",)

    @admin.display(description="Aperçu")
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:60px;border-radius:4px;">', obj.image.url)
        return "—"


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display  = ("title", "provider", "category", "price", "price_unit",
                     "service_area", "rating", "total_bookings", "is_active", "created_at")
    list_filter   = ("category", "is_active", "instant_booking")
    search_fields = ("title", "provider__username", "provider__email", "service_area")
    raw_id_fields = ("provider",)
    readonly_fields = ("rating", "total_bookings", "created_at", "updated_at")
    inlines       = [ServiceImageInline]


# ─── Réservations ────────────────────────────────────────────────────────────

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display  = ("id", "service_title", "client", "provider", "date",
                     "status", "total_price", "is_paid", "created_at")
    list_filter   = ("status", "is_paid", "date")
    search_fields = ("service__title", "client__username", "client__email",
                     "provider__username", "service_address")
    raw_id_fields = ("client", "provider", "service")
    readonly_fields = ("created_at", "updated_at", "confirmed_at", "completed_at")
    date_hierarchy = "date"

    @admin.display(description="Service")
    def service_title(self, obj):
        return obj.service.title if obj.service else "—"


# ─── Avis ────────────────────────────────────────────────────────────────────

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display  = ("id", "service", "client", "provider", "rating", "created_at")
    list_filter   = ("rating",)
    search_fields = ("service__title", "client__username", "provider__username", "comment")
    raw_id_fields = ("booking", "client", "provider", "service")
    readonly_fields = ("created_at",)


# ─── Messages ────────────────────────────────────────────────────────────────

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display  = ("id", "sender", "receiver", "short_content", "is_read", "created_at")
    list_filter   = ("is_read",)
    search_fields = ("sender__username", "receiver__username", "content")
    raw_id_fields = ("sender", "receiver", "booking")
    readonly_fields = ("created_at",)

    @admin.display(description="Message")
    def short_content(self, obj):
        return obj.content[:60] + "…" if len(obj.content) > 60 else obj.content


# ─── Notifications ───────────────────────────────────────────────────────────

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display  = ("id", "user", "type", "title", "is_read", "created_at")
    list_filter   = ("type", "is_read")
    search_fields = ("user__username", "title", "message")
    raw_id_fields = ("user", "related_booking", "related_service_request")
    readonly_fields = ("created_at",)


# ─── Demandes de service (ServiceRequest) ────────────────────────────────────

class ServiceRequestImageInline(admin.TabularInline):
    model = ServiceRequestImage
    extra = 0
    readonly_fields = ("image_preview",)

    @admin.display(description="Aperçu")
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:60px;border-radius:4px;">', obj.image.url)
        return "—"


class BidInline(admin.TabularInline):
    model        = Bid
    extra        = 0
    readonly_fields = ("provider", "price", "price_unit", "message", "estimated_duration", "status", "created_at")
    can_delete   = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display  = ("id", "title", "client", "category", "service_area",
                     "status", "bid_count", "submission_deadline", "created_at")
    list_filter   = ("status", "category")
    search_fields = ("title", "client__username", "client__email", "service_area", "description")
    raw_id_fields = ("client",)
    readonly_fields = ("created_at", "updated_at", "bid_count")
    date_hierarchy = "created_at"
    inlines       = [ServiceRequestImageInline, BidInline]

    @admin.display(description="Offres reçues")
    def bid_count(self, obj):
        return obj.bids.count()


# ─── Soumissions (Bid) ───────────────────────────────────────────────────────

@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display  = ("id", "service_request", "provider", "price", "price_unit",
                     "status", "created_at")
    list_filter   = ("status",)
    search_fields = ("service_request__title", "provider__username", "provider__email", "message")
    raw_id_fields = ("service_request", "provider")
    readonly_fields = ("created_at",)


# ─── Paiements ───────────────────────────────────────────────────────────────

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display  = ("id", "bid", "client", "provider", "amount",
                     "commission_pct", "commission_amount", "provider_amount",
                     "status", "created_at", "completed_at")
    list_filter   = ("status",)
    search_fields = ("client__username", "client__email",
                     "provider__username", "stripe_session_id")
    raw_id_fields = ("bid", "client", "provider")
    readonly_fields = ("stripe_session_id", "stripe_payment_intent_id",
                       "commission_rate", "commission_amount", "provider_amount",
                       "created_at", "completed_at")

    @admin.display(description="Commission %")
    def commission_pct(self, obj):
        return f"{int(obj.commission_rate * 100)} %"


# ─── Portfolio ───────────────────────────────────────────────────────────────

@admin.register(PortfolioPhoto)
class PortfolioPhotoAdmin(admin.ModelAdmin):
    list_display  = ("id", "provider", "caption_short", "photo_preview", "created_at")
    search_fields = ("provider__username", "caption")
    raw_id_fields = ("provider",)
    readonly_fields = ("photo_preview", "created_at")

    @admin.display(description="Légende")
    def caption_short(self, obj):
        return obj.caption[:50] + "…" if len(obj.caption) > 50 else obj.caption or "—"

    @admin.display(description="Aperçu")
    def photo_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:80px;border-radius:6px;">', obj.image.url)
        return "—"


# ─── Disponibilités ──────────────────────────────────────────────────────────

@admin.register(Availability)
class AvailabilityAdmin(admin.ModelAdmin):
    list_display  = ("provider", "day_of_week", "start_time", "end_time", "is_active")
    list_filter   = ("day_of_week", "is_active")
    search_fields = ("provider__username",)
    raw_id_fields = ("provider",)
