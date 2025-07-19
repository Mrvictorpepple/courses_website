from django.shortcuts import redirect,render
from django.core.cache import cache
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth import authenticate,login,logout, get_user_model
from django.contrib import auth, messages
from .utils import generate_otp, send_otp_email
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
import random


@csrf_protect
def login_view(request):
    if request.user.is_authenticated:
        return redirect(request.GET.get('next', 'dashboard'))
    
    email = ''
    if request.method == 'POST':
        email = request.POST.get('email', '').strip().lower()
        password = request.POST.get('password', '')
        user = authenticate(email=email, password=password)
        if user is not None:
                login(request, user)
                return redirect(request.GET.get('next', 'dashboard'))
        else:
            messages.error(request, 'Invalid Email or Password')
            return redirect('auth:login')
    return render(request, 'auth/login.html',{'email': email})

@csrf_protect
def signup_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm = request.POST.get('confirm_password')

        if password != confirm:
            messages.error(request, 'Passwords do not match')
            return redirect('auth:signup')

        if get_user_model().objects.filter(email=email).exists():
            messages.error(request, 'Email already exists')
            return redirect('auth:signup')

        otp = generate_otp()
        cache.set(f'otp_{email}', otp, timeout=300)
        cache.set(f'data_{email}', {
            'password': password,
            'first_name': request.POST.get('first_name'),
            'last_name': request.POST.get('last_name'),
            'phone_number': request.POST.get('phone_number'),
        }, timeout=300)

        send_otp_email(email, otp)
        return redirect(f'/auth/signup_otp/?email={email}')

    return render(request, 'auth/signup.html')


@csrf_protect
def signup_otp_view(request):
    email = request.GET.get('email')
    if request.method == 'POST':
        otp_input = request.POST.get('otp')
        otp_real = cache.get(f'otp_{email}')
        user_data = cache.get(f'data_{email}')

        if otp_real and str(otp_real) == str(otp_input):
            user = get_user_model().objects.create_user(
                email=email,
                password=user_data['password'],
                first_name=user_data['first_name'],
                last_name=user_data['last_name'],
                phone_number=user_data['phone_number']
            )
            login(request, user)
            return redirect('subscription')
        else:
            messages.error(request, 'Invalid OTP')

    return render(request, 'auth/signup_otp.html', {'email': email})



@csrf_protect
def resend_otp_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        user_data = cache.get(f'data_{email}')

        if not user_data:
            return JsonResponse({'status': 'error', 'message': 'User data not found.'}, status=400)

        # Generate new 6-digit OTP
        new_otp = str(random.randint(100000, 999999))
        cache.set(f'otp_{email}', new_otp, 300)  # Cache for 5 minutes

        send_otp_email(email, new_otp)

        return JsonResponse({'status': 'success', 'message': 'OTP resent successfully.'})
    return JsonResponse({'status': 'error', 'message': 'Invalid request.'}, status=400)




@login_required(login_url="auth:login")
def logout_view(request):
    logout(request)
    messages.success(request, 'You have successfully logged out!')
    return redirect('index')
