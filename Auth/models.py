from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin
from django.utils import timezone
from django.urls import reverse
# Create your models here.

class UserManager(BaseUserManager):
    def _create_user(self, email, password, is_staff, is_superuser, **extra_fields):
        if not email:
           raise ValueError('The Email field must be set')
        now = timezone.now() 
        email = self.normalize_email(email)
        user = self.model(
            email = email,
            is_staff = is_staff,
            is_active = True,
            is_superuser = is_superuser,
            last_login = now,
            date_joined = now,
            **extra_fields
        )
        user.set_password(password)
        user.save(using = self._db)
        return user
    
    def create_user(self, email, password, **extra_fields):
        return self._create_user(email,password, False, False, **extra_fields)
        
    def create_superuser(self, email, password, **extra_fields):
        user = self._create_user(email,password, True, True, **extra_fields)
        return user

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(max_length=250,unique=True)
    first_name = models.CharField(max_length=250,null=True,blank=True)
    last_name = models.CharField(max_length=250,null=True,blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(null=True, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['phone_number','first_name','last_name']

    objects = UserManager()

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']

    def get_absolute_url(self):
        return reverse('users:detail', args=[self.pk])