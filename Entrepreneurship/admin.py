from django.contrib import admin
from .models import *

# INLINE for VideoContent within Course
class VideoContentInline(admin.TabularInline):
    model = VideoContent
    extra = 0
    ordering = ('order',)

class WrittenContentInline(admin.TabularInline):
    model = WrittenContent
    extra = 0
    ordering = ('order',)

class RoadmapItemInline(admin.TabularInline):
    model = RoadmapItem
    extra = 0
    ordering = ('order',)

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user',)

@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


# CUSTOMER
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('user',)
    search_fields = ('user__first_name', 'user__email')

# COURSE
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'level', 'created_at')
    search_fields = ('title', 'category', 'tags__name')
    list_filter = ('level',)
    inlines = [VideoContentInline, WrittenContentInline, RoadmapItemInline]

# VIDEO
@admin.register(VideoContent)
class VideoContentAdmin(admin.ModelAdmin):
    list_display = ('course', 'title', 'order')
    list_filter = ('course',)
    search_fields = ('title',)

# WRITTEN CONTENT
@admin.register(WrittenContent)
class WrittenContentAdmin(admin.ModelAdmin):
    list_display = ('course', 'title', 'order')
    list_filter = ('course',)
    search_fields = ('title',)

# ROADMAP ITEM
@admin.register(RoadmapItem)
class RoadmapItemAdmin(admin.ModelAdmin):
    list_display = ('course', 'title', 'order')
    list_filter = ('course',)
    search_fields = ('title',)

# SUBSCRIPTION
@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('customer', 'is_active', 'subscribed_at')
    list_filter = ('is_active',)
    search_fields = ('customer__user__first_name', 'course__title')

# COMPLETED COURSE
@admin.register(CompletedCourse)
class CompletedCourseAdmin(admin.ModelAdmin):
    list_display = ('customer', 'course', 'completed_at')
    list_filter = ('completed_at',)
    search_fields = ('customer__user__first_name', 'course__title')

# PROGRESS
@admin.register(Progress)
class ProgressAdmin(admin.ModelAdmin):
    list_display = ('customer', 'course', 'percent_completed', 'last_video', 'updated_at')
    list_filter = ('course',)
    search_fields = ('customer__user__first_name', 'course__title')

# COMPLETED VIDEOS
@admin.register(CompletedVideo)
class CompletedVideoAdmin(admin.ModelAdmin):
    list_display = ('customer', 'video', 'completed_at')
    list_filter = ('video__course',)
    search_fields = ('customer__user__first_name', 'video__title')

# CERTIFICATES
@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('customer', 'course', 'issued_at')
    list_filter = ('issued_at',)
    search_fields = ('customer__user__first_name', 'course__title')

# BOOKMARKS
@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ('customer', 'course', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('customer__user__first_name', 'course__title')

# TAGS
@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)
