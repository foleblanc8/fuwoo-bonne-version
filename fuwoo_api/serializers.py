# fuwoo_api/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    ServiceCategory, Service, ServiceImage, Booking,
    Review, Message, Notification, Availability,
    ServiceRequest, ServiceRequestImage, Bid, PortfolioPhoto,
)

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                 'role', 'has_provider_profile', 'phone_number', 'address',
                 'profile_picture', 'bio', 'is_verified', 'email_verified',
                 'rating', 'total_reviews', 'latitude', 'longitude',
                 'identity_status', 'identity_rejection_reason', 'date_joined']
        read_only_fields = ['rating', 'total_reviews', 'is_verified', 'email_verified',
                            'identity_status', 'identity_rejection_reason', 'date_joined']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 
                 'first_name', 'last_name', 'role', 'phone_number']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        role = validated_data.get('role', 'client')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        if role == 'prestataire':
            user.has_provider_profile = True
        user.save()
        return user

class ServiceCategorySerializer(serializers.ModelSerializer):
    provider_count = serializers.SerializerMethodField()

    def get_provider_count(self, obj):
        return Service.objects.filter(category=obj, is_active=True).values('provider').distinct().count()

    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'slug', 'icon', 'description', 'is_active', 'created_at', 'provider_count']

class ServiceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceImage
        fields = ['id', 'image', 'is_primary']

class ServiceSerializer(serializers.ModelSerializer):
    provider = UserSerializer(read_only=True)
    category = ServiceCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ServiceCategory.objects.all(), source='category', write_only=True
    )
    images = ServiceImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Service
        fields = '__all__'
        read_only_fields = ['rating', 'total_bookings', 'provider']

class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = '__all__'
        read_only_fields = ['provider']

class BookingSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    provider = UserSerializer(read_only=True)
    service = ServiceSerializer(read_only=True)
    service_id = serializers.PrimaryKeyRelatedField(
        queryset=Service.objects.all(), source='service', write_only=True
    )
    has_review = serializers.SerializerMethodField()

    def get_has_review(self, obj):
        return hasattr(obj, 'review')

    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['client', 'provider', 'total_price', 'has_review']
    
    def create(self, validated_data):
        service = validated_data['service']
        validated_data['provider'] = service.provider
        validated_data['total_price'] = service.price  # À ajuster selon la durée
        return super().create(validated_data)

class ReviewSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    provider = UserSerializer(read_only=True)
    service_title = serializers.CharField(source='service.title', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'booking', 'client', 'provider', 'service_title',
            'rating', 'comment',
            'quality_rating', 'punctuality_rating', 'communication_rating',
            'created_at',
        ]
        read_only_fields = ['client', 'provider', 'service_title', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['sender']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'type', 'title', 'message',
            'related_booking', 'related_service_request',
            'is_read', 'created_at',
        ]
        read_only_fields = ['user']


class ServiceRequestImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequestImage
        fields = ['id', 'image']


class ServiceRequestSerializer(serializers.ModelSerializer):
    images = ServiceRequestImageSerializer(many=True, read_only=True)
    bid_count = serializers.SerializerMethodField()
    category = ServiceCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=ServiceCategory.objects.all(),
        source='category',
        write_only=True,
        required=False,
        allow_null=True,
    )
    client = UserSerializer(read_only=True)

    def get_bid_count(self, obj):
        return obj.bids.count()

    def _can_see_private(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        user = request.user
        if obj.client_id == user.id:
            return True
        if getattr(user, 'role', None) == 'prestataire':
            return obj.bids.filter(provider=user, status='accepted').exists()
        return False

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not self._can_see_private(instance):
            data['address'] = None
            data['latitude'] = None
            data['longitude'] = None
        return data

    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'client', 'category', 'category_id', 'title', 'description',
            'service_area', 'address', 'preferred_dates', 'submission_deadline',
            'status', 'images', 'bid_count', 'created_at', 'updated_at',
            'latitude', 'longitude',
        ]
        read_only_fields = ['client', 'status']


class BidSerializer(serializers.ModelSerializer):
    provider = UserSerializer(read_only=True)

    class Meta:
        model = Bid
        fields = [
            'id', 'service_request', 'provider', 'price', 'price_unit',
            'message', 'estimated_duration', 'status', 'created_at',
        ]
        read_only_fields = ['provider', 'status']


class PortfolioPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = PortfolioPhoto
        fields = ['id', 'image', 'caption', 'order', 'created_at']
        read_only_fields = ['created_at']
