from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('courses/', views.courses, name='courses'),
    path('course_detail/', views.course_detail, name='course_detail'),
    path('subscribe/', views.subscribe, name='subscribe'),
    path('subscription/', views.subscription, name='subscription'),
    path('subscription/callback/', views.subscription_callback, name='subscription_callback'),
    path('upload_course/', views.upload_course, name='upload_course'),
    path('profile/', views.profile, name='profile'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('dashboard/bookmarks/', views.bookmarks, name='bookmarks'),
    path('dashboard/certificates/', views.certificates, name='certificates'),
    path('api/dashboard/progress/', views.api_course_progress, name='api_course_progress'),
    path('api/dashboard/recommendations/', views.api_recommend_courses, name='api_recommend_courses'),
    path('api/complete-video/', views.complete_video, name='complete_video'),
    path('api/my-courses/', views.api_my_courses, name='api_my_courses'),
    path('api/completed-courses/', views.api_completed_courses, name='api_completed_courses'),
    path('api/bookmarks/', views.api_bookmarked_courses, name='api_bookmarked_courses'),
    path('api/certificates/', views.api_certificates, name='api_certificates'),
    path('api/course/<int:course_id>/', views.course_detail_api, name='course_detail_api'), 
    path('api/courses/', views.course_list_api, name='course_list_api'),
    path('api/courses/popular/', views.popular_courses_api, name='popular_courses_api'),
    path('api/user/is-subscribed/', views.is_subscribed_api, name='is_subscribed_api'),
    path('api/subscribe/', views.subscribe_user, name='subscribe_user'),
    path('api/user/profile/', views.user_profile, name='user_profile'),
]
 


