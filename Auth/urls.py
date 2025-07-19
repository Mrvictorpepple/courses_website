from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

app_name = 'auth'

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('signup_otp/', views.signup_otp_view, name='signup_otp'),
    path('resend_otp/', views.resend_otp_view, name='resend_otp'),
    path('logout/', views.logout_view, name='logout'),
    # password reset stuff
    path('password_reset/', auth_views.PasswordResetView.as_view(template_name="auth/reset-password.html"), name='password_reset'),
    path('password_reset_done/', auth_views.PasswordResetDoneView.as_view(template_name="auth/password-reset-done.html"), name='password_reset_done'),
    path('password_reset_confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(
    template_name='auth/password-reset-confirm.html'), name='password_reset_confirm'),
    path('password_reset_complete/', auth_views.PasswordResetCompleteView.as_view(
    template_name='auth/password-reset-complete.html'), name='password_reset_complete'),
]

