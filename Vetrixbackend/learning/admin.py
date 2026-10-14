from django.contrib import admin

from .models import (
    Language,
    Course,
    Lesson,
    LessonProgress,
    LessonContent,
    DictionaryWord,
    DailyActivity,
    LearningStreak,
    Leaderboard,
    SavedWord,
    Quiz,
    QuizQuestion,
    QuizAttempt,
)


# =========================================================
# LANGUAGE ADMIN
# =========================================================

@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "code", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name", "code")
    ordering = ("name",)


# =========================================================
# COURSE ADMIN
# =========================================================

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "language",
        "level",
        "order",
        "is_active",
    )
    list_filter = ("language", "level", "is_active")
    search_fields = ("title", "language__name")
    ordering = ("language", "order")


# =========================================================
# LESSON ADMIN
# =========================================================

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "course",
        "order",
        "points",
        "is_active",
    )
    list_filter = ("course", "is_active")
    search_fields = ("title", "course__title")
    ordering = ("course", "order")


# =========================================================
# LESSON PROGRESS ADMIN
# =========================================================

@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "lesson",
        "completed",
        "score",
        "completed_at",
    )
    list_filter = ("completed",)
    search_fields = ("user__email", "lesson__title")
    ordering = ("-updated_at",)


# =========================================================
# LESSON CONTENT ADMIN
# =========================================================

@admin.register(LessonContent)
class LessonContentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "word",
        "meaning",
        "pronunciation",
        "translation",
        "lesson",
        "order",
    )
    list_filter = ("lesson",)
    search_fields = ("word", "meaning", "translation")
    ordering = ("lesson", "order")


# =========================================================
# DICTIONARY WORD ADMIN
# =========================================================

@admin.register(DictionaryWord)
class DictionaryWordAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "word",
        "meaning",
        "language",
        "level",
        "category",
    )
    list_filter = ("language", "level", "category")
    search_fields = ("word", "meaning", "translation")
    ordering = ("word",)


# =========================================================
# DAILY ACTIVITY ADMIN
# =========================================================

@admin.register(DailyActivity)
class DailyActivityAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "date",
        "lessons_completed",
        "points_earned",
    )
    list_filter = ("date",)
    search_fields = ("user__email",)
    ordering = ("-date",)


# =========================================================
# LEARNING STREAK ADMIN
# =========================================================

@admin.register(LearningStreak)
class LearningStreakAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "current_streak",
        "longest_streak",
        "last_active_date",
        "updated_at",
    )
    search_fields = ("user__email",)
    ordering = ("-current_streak",)


# =========================================================
# LEADERBOARD ADMIN
# =========================================================

@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "total_points",
        "current_streak",
        "longest_streak",
        "updated_at",
    )
    search_fields = ("user__email",)
    ordering = ("-total_points",)


# =========================================================
# SAVED WORD ADMIN
# =========================================================

@admin.register(SavedWord)
class SavedWordAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "dictionary_word",
        "created_at",
    )
    search_fields = (
        "user__email",
        "dictionary_word__word",
    )
    ordering = ("-created_at",)


# =========================================================
# QUIZ QUESTION INLINE
# =========================================================

class QuizQuestionInline(admin.TabularInline):
    model = QuizQuestion
    extra = 1


# =========================================================
# QUIZ ADMIN
# =========================================================

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "lesson",
        "passing_score",
        "is_active",
        "created_at",
    )
    list_filter = ("is_active", "passing_score")
    search_fields = ("title", "lesson__title")
    inlines = (QuizQuestionInline,)
    ordering = ("lesson", "title")


# =========================================================
# QUIZ QUESTION ADMIN
# =========================================================

@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "quiz",
        "question_text",
        "correct_option",
        "order",
    )
    list_filter = ("quiz", "correct_option")
    search_fields = ("question_text", "quiz__title")
    ordering = ("quiz", "order")


# =========================================================
# QUIZ ATTEMPT ADMIN
# =========================================================

@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "quiz",
        "score",
        "total_questions",
        "percentage",
        "passed",
        "created_at",
    )
    list_filter = ("quiz", "passed")
    search_fields = ("user__email", "quiz__title")
    ordering = ("-created_at",)