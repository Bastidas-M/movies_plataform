from rest_framework import serializers
from .models import User, SubscriptionPlan
from django.contrib.auth.password_validation import validate_password
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'name', 'price', 'max_screens', 'video_quality']

class UserSerializer(serializers.ModelSerializer):
    plan_details = SubscriptionPlanSerializer(source='plan', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'plan', 'plan_details', 'subscription_active', 'subscription_end_date']
        read_only_fields = ['subscription_active', 'subscription_end_date']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    plan = serializers.PrimaryKeyRelatedField(queryset=SubscriptionPlan.objects.all(), required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'plan']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        
        # Establecer la fecha de fin de suscripción un mes después de hoy
        today = datetime.now().date()
        subscription_end_date = today + relativedelta(months=1)
        
        # Añadir la fecha de fin de suscripción a los datos validados
        validated_data['subscription_end_date'] = subscription_end_date
        validated_data['subscription_active'] = True
        
        # Crear el usuario
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    