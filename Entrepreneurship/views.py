from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import *
from random import sample
from django.views.decorators.http import require_POST
from django.utils import timezone
import json
from django.conf import settings
import requests
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseBadRequest, Http404
from django.db.models import Sum
from django.contrib.auth import get_user_model

# Create your views here.
def index(request):
    return render(request, 'index.html')

@login_required
def upload_course(request):
    return render(request, 'upload-course.html')

def courses(request):
    return render(request, 'courses.html')

def course_detail(request):
    return render(request, 'course-detail.html')

@login_required
def profile(request):
    return render(request, 'profile.html')

@login_required
def bookmarks(request):
    return render(request, 'bookmarks.html')

@login_required
def certificates(request):
    return render(request, 'certificates.html')

@login_required
def user_profile(request):
    user = Customer.objects.get(user=request.user)
    return JsonResponse({
        'authenticated': True,
        'name': user.full_name or user.username,
        'initial': user.user.first_name[:1].upper() if user.user.first_name else user.user.username[:1].upper()
    })


def popular_courses_api(request):
    courses = Course.objects.order_by('-rating')[:10]  # Example: Top 10 by rating
    data = []

    for course in courses:
        data.append({
            'id': course.id,
            'title': course.title,
            'description': course.description,
            'thumbnail': course.thumbnail.url if course.thumbnail else '',
            'category': course.category,
            'level': course.level,
            'instructor': {
                'name': course.instructor.name,
            },
        })

    return JsonResponse(data, safe=False)

def course_detail_api(request, course_id):
    course = get_object_or_404(Course, pk=course_id)

    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=403)

    # Check subscription status
    customer = getattr(request.user, 'customer', None)
    is_subscribed = Subscription.objects.filter(customer=customer, is_active=True).exists() if customer else False

    # Instructor info
    instructor = {
        'name': course.instructor.name if course.instructor else 'Unknown Instructor',
        'avatar': course.instructor.avatar.url if course.instructor and course.instructor.avatar else '/static/images/default-avatar.png',
        'bio': course.instructor.bio if course.instructor else '',
    }

    # Roadmap
    roadmap = [
        {'title': m.title, 'description': m.description}
        for m in course.roadmap.all()
    ]

    # Lessons from VideoContent and WrittenContent, grouped manually by "order"
    lessons = []
    video_lessons = course.videos.all()
    written_lessons = course.writings.all()

    # Combine and sort all content
    all_lessons = list(video_lessons) + list(written_lessons)
    all_lessons.sort(key=lambda x: x.order)

    for lesson in all_lessons:
        lessons.append({
            'title': lesson.title,
            'content': getattr(lesson, 'content', ''),  # Only for WrittenContent
            'videoUrl': getattr(lesson, 'video_url', ''),  # Only for VideoContent
            'type': 'video' if hasattr(lesson, 'video_url') else 'text',
        })

    # Student count via Enrollment model
    student_count = Enrollment.objects.filter(course=course).count()

    data = {
        'id': course.id,
        'title': course.title,
        'description': course.description,
        'category': course.category,
        'thumbnail': course.thumbnail.url if course.thumbnail else '',
        'duration': str(course.get_duration()),  # Convert timedelta to string
        'lessons': len(lessons),
        'level': course.level,
        'rating': course.rating,
        'ratingCount': course.reviews.count(),
        'students': student_count,
        'instructor': instructor,
        'roadmap': roadmap,
        'sections': [ 
            {
                'title': 'Course Content',
                'lessons': lessons
            }
        ],
        'is_subscribed': is_subscribed
    }

    return JsonResponse(data)


@login_required
def dashboard(request):
    customer = Customer.objects.get(user=request.user)


    # Completed courses
    completed_courses = CompletedCourse.objects.filter(customer=customer)
    completed_course_ids = completed_courses.values_list('course_id', flat=True)

    # In-progress = courses not yet completed
    all_course_ids = Course.objects.values_list('id', flat=True)
    in_progress_courses = Course.objects.filter(id__in=all_course_ids).exclude(id__in=completed_course_ids)

    # Total hours learned — sum all durations from completed course videos
    total_duration = VideoContent.objects.filter(
        course_id__in=completed_course_ids
    ).aggregate(
        total=Sum('duration')
    )['total']

    if total_duration:
        total_hours = round(total_duration.total_seconds() / 3600, 1)
    else:
        total_hours = 0

    # Certificates = number of completed courses
    certificate_count = completed_courses.count()

    context = {
        'in_progress_count': in_progress_courses.count(),
        'completed_count': completed_courses.count(),
        'total_hours': total_hours,
        'certificates': certificate_count,
    }
    return render(request, 'dashboard.html', context)


def subscription(request):
    return render(request, 'subscription.html')

@login_required
def subscribe(request):
    customer = Customer.objects.get(user=request.user)
    email = request.user.email
    amount = 5000 * 100  # ₦5000 (in kobo)

    # Generate Paystack transaction
    headers = {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "email": email,
        "amount": amount,
        "callback_url": request.build_absolute_uri('/subscription/callback/')
    }

    response = requests.post('https://api.paystack.co/transaction/initialize', headers=headers, json=data)
    res_data = response.json()

    if res_data.get('status'):
        return redirect(res_data['data']['authorization_url'])
    else:
        return JsonResponse({"error": "Paystack initialization failed"}, status=400)



@csrf_exempt
def subscription_callback(request):
    reference = request.GET.get('reference')
    if not reference:
        return HttpResponseBadRequest("No transaction reference provided.")

    # Verify transaction with Paystack
    headers = {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
    }

    verify_url = f"https://api.paystack.co/transaction/verify/{reference}"
    response = requests.get(verify_url, headers=headers)
    result = response.json()

    if result.get('data') and result['data']['status'] == 'success':
        email = result['data']['customer']['email']

        # Use the actual user model
        User = get_user_model()
        user = User.objects.filter(email=email).first()

        if user:
            try:
                customer = Customer.objects.get(user=user)
            except Customer.DoesNotExist:
                return JsonResponse({'error': 'Customer not found for user.'}, status=404)

            subscription, created = Subscription.objects.get_or_create(customer=customer)
            subscription.is_active = True
            subscription.subscribed_at = timezone.now()
            subscription.save()

            return redirect('dashboard')

    return JsonResponse({'error': 'Payment not verified or failed'}, status=400)


def is_subscribed_api(request):
    if request.user.is_authenticated:
        try:
            customer = Customer.objects.get(user=request.user)
            is_active = Subscription.objects.filter(customer=customer, is_active=True).exists()
            return JsonResponse({
                'authenticated': True,
                'subscribed': is_active
            })
        except Customer.DoesNotExist:
            return JsonResponse({'authenticated': True, 'subscribed': False})
    else:
        return JsonResponse({'authenticated': False, 'subscribed': False})
    

@login_required
def subscribe_user(request):
    if request.method == 'POST':
        customer = request.user.customer
        sub, created = Subscription.objects.get_or_create(customer=customer)
        sub.is_active = True
        sub.save()
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'Invalid request'}, status=400)

@login_required
def api_course_progress(request):
    customer = Customer.objects.get(user=request.user)
    data = []

    # User has an active subscription?
    has_subscription = Subscription.objects.filter(customer=customer, is_active=True).exists()
    if not has_subscription:
        return JsonResponse([], safe=False)

    all_courses = Course.objects.all()
    for course in all_courses:
        progress_obj = Progress.objects.filter(customer=customer, course=course).first()
        if progress_obj:
            progress = progress_obj.percent_completed
            last_lesson = progress_obj.last_video.title if progress_obj.last_video else 'No progress'
            last_accessed = progress_obj.updated_at.strftime('%d %b, %Y') if progress_obj.updated_at else 'Never'
        else:
            progress = 0
            last_lesson = 'Not started'
            last_accessed = 'Never'

        data.append({
            'courseId': str(course.id),
            'title': course.title,
            'thumbnail': course.thumbnail.url,
            'progress': progress,
            'lastLesson': last_lesson,
            'lastAccessed': last_accessed
        })

    return JsonResponse(data, safe=False)



@login_required
def api_recommend_courses(request):
    customer = Customer.objects.get(user=request.user)

    # Get tags from completed courses
    customer_tags = Tag.objects.filter(course__completedcourse__customer=customer)

    # Recommend courses not yet completed, but with similar tags
    recommended = Course.objects.exclude(completedcourse__customer=customer).filter(tags__in=customer_tags).distinct()

    # Fallback to random if no smart match
    if not recommended.exists():
        recommended = sample(list(Course.objects.all()), min(3, Course.objects.count()))

    data = [
        {
            'id': str(course.id),
            'title': course.title,
            'thumbnail': course.thumbnail.url,
            'description': course.description,
            'level': course.level
        }
        for course in recommended[:3]
    ]

    return JsonResponse(data, safe=False)

@login_required
def api_certificates(request):
    customer = Customer.objects.get(user=request.user)
    certificates = Certificate.objects.filter(customer=customer)

    data = [
        {
            'id': str(certificate.id),
            'courseTitle': certificate.course.title,
            'issuedDate': certificate.issued_at.strftime('%d %b %Y'),
            'certificateUrl': certificate.file.url if certificate.file else ''
        }
        for certificate in certificates
    ]
    return JsonResponse(data, safe=False)

@login_required
def api_bookmarked_courses(request):
    customer = Customer.objects.get(user=request.user)
    bookmarks = Bookmark.objects.filter(customer=customer)

    data = [
        {
            'id': str(bookmark.course.id),
            'title': bookmark.course.title,
            'thumbnail': bookmark.course.thumbnail.url,
            'description': bookmark.course.description,
        }
        for bookmark in bookmarks
    ]
    return JsonResponse(data, safe=False)

@login_required
def api_completed_courses(request):
    customer = Customer.objects.get(user=request.user)
    completed_courses = CompletedCourse.objects.filter(customer=customer)

    data = [
        {
            'id': str(course.course.id),
            'title': course.course.title,
            'completed_at': course.completed_at.strftime('%d %b %Y')
        }
        for course in completed_courses
    ]
    return JsonResponse(data, safe=False)

@login_required
def api_my_courses(request):
    customer = Customer.objects.get(user=request.user)
    subscriptions = Subscription.objects.filter(customer=customer).select_related('course')
    enrolled_courses = [sub.course for sub in subscriptions]


    data = [
        {
            'id': str(course.id),
            'title': course.title,
            'thumbnail': course.thumbnail.url,
            'description': course.description,
            'level': course.level
        }
        for course in enrolled_courses
    ]
    return JsonResponse(data, safe=False)



def course_list_api(request):
    courses = Course.objects.all()
    data = []

    for course in courses:
        data.append({
            'id': course.id,
            'title': course.title,
            'description': course.description,
            'thumbnail': course.thumbnail.url if course.thumbnail else '',
            'category': course.category,
            'level': course.level,
            'instructor': {
                'name': course.instructor.name if course.instructor else 'N/A'
            }
        })

    return JsonResponse(data, safe=False)


@require_POST
@login_required
def complete_video(request):
    # user = request.user
    # customer = user.customer
    customer = Customer.objects.get(user=request.user)
    data = json.loads(request.body)

    video_id = data.get('videoId')

    try:
        if not video_id:
            return JsonResponse({'status': 'error', 'message': 'Missing videoId'}, status=400)

        video = VideoContent.objects.get(id=video_id)
        CompletedVideo.objects.get_or_create(customer=customer, video=video)

        # Update or create progress
        course = video.course
        all_videos = course.videocontent_set.all()
        total = all_videos.count()
        completed_count = CompletedVideo.objects.filter(customer=customer, video__in=all_videos).count()
        percent = int((completed_count / total) * 100) if total else 0

        progress, _ = Progress.objects.get_or_create(customer=customer, course=course)
        progress.percent_completed = percent
        progress.last_video = video
        progress.updated_at = timezone.now()
        progress.save()

        return JsonResponse({'status': 'success', 'progress': percent})
    
    except VideoContent.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Video not found'}, status=404)
    
@require_POST
@login_required
def enroll_course(request):
    customer = Customer.objects.get(user=request.user)
    data = json.loads(request.body)
    course_id = data.get('courseId')

    try:
        course = Course.objects.get(id=course_id)
        Subscription.objects.get_or_create(customer=customer, course=course)
        return JsonResponse({'status': 'success'})
    except Course.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Course not found'}, status=404)


@require_POST
@login_required
def submit_course_rating(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return JsonResponse({'error': 'Course not found'}, status=404)

    rating = int(request.POST.get('rating', 0))
    comment = request.POST.get('comment', '')

    if rating < 1 or rating > 5:
        return JsonResponse({'error': 'Invalid rating'}, status=400)

    # Ensure user completed the course
    if not CompletedCourse.objects.filter(customer__user=request.user, course=course).exists():
        return JsonResponse({'error': 'You must complete the course to rate it'}, status=403)

    # Create or update review
    review, created = Review.objects.update_or_create(
        course=course,
        user=request.user,
        defaults={'rating': rating, 'comment': comment}
    )

    # Update course rating
    course.update_rating()

    return JsonResponse({'success': True, 'new_average': course.rating, 'rating_count': course.rating_count})



