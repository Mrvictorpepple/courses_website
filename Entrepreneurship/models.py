from django.db import models
from django.conf import settings
from datetime import timedelta
from django.db.models import Avg


COURSE_LEVELS = [
    ('Beginner', 'Beginner'),
    ('Intermediate', 'Intermediate'),
    ('Advanced', 'Advanced'),
]

class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
class Instructor(models.Model):
    name = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='instructors/', blank=True, null=True)

    def __str__(self):
        return self.name

class Customer(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, blank=True, null=True)
    bio = models.TextField(blank=True)
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

    @property
    def full_name(self):
        return f"{self.user.first_name} {self.user.last_name}".strip()


class Course(models.Model):
    instructor = models.ForeignKey('Instructor', on_delete=models.SET_NULL, null=True, related_name='courses')
    title = models.CharField(max_length=200)
    description = models.TextField()
    thumbnail = models.ImageField(upload_to='course_thumbnails/', blank=True, null=True)
    category = models.CharField(max_length=100)
    level = models.CharField(max_length=20, choices=COURSE_LEVELS)
    prerequisites = models.TextField(blank=True)
    tags = models.ManyToManyField('Tag', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    rating = models.FloatField(default=0.0)
    rating_count = models.IntegerField(default=0)

    def get_total_videos(self):
        return self.videos.count()

    def get_duration(self):
        return sum((video.duration for video in self.videos.all()), timedelta())

    def update_rating(self):
        """ Recalculate and update average rating """
        average = self.reviews.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
        count = self.reviews.count()
        self.rating = round(average, 1)
        self.rating_count = count
        self.save()

    def __str__(self):
        return self.title


class Review(models.Model):
    course = models.ForeignKey('Course', related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(choices=[(i, i) for i in range(1, 6)])  # 1 to 5 stars
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course', 'user')  # User can rate a course only once

    def __str__(self):
        return f"{self.user.username} - {self.course.title} - {self.rating} stars"


class VideoContent(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=200)
    video_url = models.URLField()
    order = models.PositiveIntegerField(default=0)
    duration= models.DurationField()

    class Meta:
      ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"
    

class WrittenContent(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='writings')
    title = models.CharField(max_length=200)
    content = models.TextField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class RoadmapItem(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='roadmap')
    title = models.CharField(max_length=200)
    description = models.TextField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
         ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - Step {self.order}"

class Subscription(models.Model):
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=False)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer.full_name} - {'Active' if self.is_active else 'Inactive'}"
    
class CompletedCourse(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='completed_courses')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('customer', 'course')  # Prevent duplicates

    def __str__(self):
        return f"{self.customer.full_name} completed {self.course.title}"

class CompletedVideo(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='completed_videos')
    video = models.ForeignKey(VideoContent, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('customer', 'video')

    def __str__(self):
        return f"{self.customer.full_name} completed {self.video.title}"


class Bookmark(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True)
    video = models.ForeignKey(VideoContent, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('customer', 'course', 'video')



class Certificate(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    issued_at = models.DateTimeField(auto_now_add=True)
    certificate_file = models.FileField(upload_to='certificates/', null=True, blank=True)


class Progress(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    last_video = models.ForeignKey(VideoContent, on_delete=models.SET_NULL, null=True, blank=True)
    percent_completed = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('customer', 'course')

    def is_complete(self):
        return self.percent_completed >= 100

    def __str__(self):
        return f"{self.customer.user.first_name} - {self.course.title} ({self.percent_completed}%)"

class Enrollment(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)


