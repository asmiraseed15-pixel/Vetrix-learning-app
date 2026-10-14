from rest_framework import serializers

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
# LANGUAGE SERIALIZER
# =========================================================

class LanguageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Language
        fields = [
            "id",
            "name",
            "code",
            "description",
            "icon",
            "is_active",
            "created_at",
        ]


# =========================================================
# COURSE SERIALIZER
# =========================================================

class CourseSerializer(serializers.ModelSerializer):

    language_name = serializers.CharField(
        source="language.name",
        read_only=True
    )

    class Meta:
        model = Course
        fields = [
            "id",
            "language",
            "language_name",
            "title",
            "description",
            "level",
            "order",
            "is_active",
            "created_at",
        ]


# =========================================================
# LESSON SERIALIZER
# =========================================================

class LessonSerializer(serializers.ModelSerializer):

    course_title = serializers.CharField(
        source="course.title",
        read_only=True
    )

    class Meta:
        model = Lesson
        fields = [
            "id",
            "course",
            "course_title",
            "title",
            "description",
            "order",
            "points",
            "is_active",
            "created_at",
        ]


# =========================================================
# LESSON CONTENT SERIALIZER
# =========================================================

class LessonContentSerializer(serializers.ModelSerializer):

    lesson_title = serializers.CharField(
        source="lesson.title",
        read_only=True
    )

    class Meta:
        model = LessonContent
        fields = [
            "id",
            "lesson",
            "lesson_title",
            "word",
            "meaning",
            "pronunciation",
            "translation",
            "example_sentence",
            "order",
            "created_at",
        ]


# =========================================================
# LESSON PROGRESS SERIALIZER
# =========================================================

class LessonProgressSerializer(serializers.ModelSerializer):

    class Meta:
        model = LessonProgress
        fields = [
            "id",
            "user",
            "lesson",
            "completed",
            "score",
            "completed_at",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "user",
            "completed_at",
            "created_at",
            "updated_at",
        ]


# =========================================================
# DICTIONARY WORD SERIALIZER
# =========================================================

class DictionaryWordSerializer(serializers.ModelSerializer):

    language_name = serializers.CharField(
        source="language.name",
        read_only=True
    )

    class Meta:
        model = DictionaryWord
        fields = [
            "id",
            "language",
            "language_name",
            "word",
            "meaning",
            "pronunciation",
            "translation",
            "example_sentence",
            "level",
            "category",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]


# =========================================================
# DAILY ACTIVITY SERIALIZER
# =========================================================

class DailyActivitySerializer(serializers.ModelSerializer):

    class Meta:
        model = DailyActivity
        fields = [
            "id",
            "date",
            "lessons_completed",
            "points_earned",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "date",
            "lessons_completed",
            "points_earned",
            "created_at",
        ]


# =========================================================
# LEARNING STREAK SERIALIZER
# =========================================================

class LearningStreakSerializer(serializers.ModelSerializer):

    class Meta:
        model = LearningStreak
        fields = [
            "id",
            "current_streak",
            "longest_streak",
            "last_active_date",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "current_streak",
            "longest_streak",
            "last_active_date",
            "updated_at",
        ]


# =========================================================
# LEADERBOARD SERIALIZER
# =========================================================

class LeaderboardSerializer(serializers.ModelSerializer):

    user_name = serializers.CharField(
        source="user.name",
        read_only=True
    )

    class Meta:
        model = Leaderboard
        fields = [
            "id",
            "user",
            "user_name",
            "total_points",
            "current_streak",
            "longest_streak",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "user_name",
            "total_points",
            "current_streak",
            "longest_streak",
            "updated_at",
        ]


# =========================================================
# SAVED WORDS SERIALIZER
# =========================================================

class SavedWordSerializer(serializers.ModelSerializer):

    word = serializers.CharField(
        source="dictionary_word.word",
        read_only=True
    )

    meaning = serializers.CharField(
        source="dictionary_word.meaning",
        read_only=True
    )

    pronunciation = serializers.CharField(
        source="dictionary_word.pronunciation",
        read_only=True
    )

    translation = serializers.CharField(
        source="dictionary_word.translation",
        read_only=True
    )

    example_sentence = serializers.CharField(
        source="dictionary_word.example_sentence",
        read_only=True
    )

    language = serializers.CharField(
        source="dictionary_word.language.name",
        read_only=True
    )

    language_code = serializers.CharField(
        source="dictionary_word.language.code",
        read_only=True
    )

    class Meta:
        model = SavedWord
        fields = [
            "id",
            "dictionary_word",
            "word",
            "meaning",
            "pronunciation",
            "translation",
            "example_sentence",
            "language",
            "language_code",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]


# =========================================================
# QUIZ QUESTION SERIALIZER
# =========================================================

class QuizQuestionSerializer(serializers.ModelSerializer):

    class Meta:
        model = QuizQuestion

        # Correct answer is intentionally excluded.
        fields = [
            "id",
            "quiz",
            "question_text",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
            "explanation",
            "order",
        ]

        read_only_fields = fields


# =========================================================
# QUIZ SERIALIZER
# =========================================================

class QuizSerializer(serializers.ModelSerializer):

    lesson_title = serializers.CharField(
        source="lesson.title",
        read_only=True
    )

    questions = QuizQuestionSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Quiz
        fields = [
            "id",
            "lesson",
            "lesson_title",
            "title",
            "description",
            "passing_score",
            "questions",
            "created_at",
        ]

        read_only_fields = fields


# =========================================================
# QUIZ ATTEMPT SERIALIZER
# =========================================================

class QuizAttemptSerializer(serializers.ModelSerializer):

    quiz_title = serializers.CharField(
        source="quiz.title",
        read_only=True
    )

    class Meta:
        model = QuizAttempt
        fields = [
            "id",
            "quiz",
            "quiz_title",
            "score",
            "total_questions",
            "percentage",
            "passed",
            "created_at",
        ]

        read_only_fields = fields