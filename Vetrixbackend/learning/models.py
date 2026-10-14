from django.db import models


# =========================================================
# LANGUAGE
# =========================================================

class Language(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# =========================================================
# COURSE
# =========================================================

class Course(models.Model):
    language = models.ForeignKey(
        Language,
        on_delete=models.CASCADE,
        related_name="courses"
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    level = models.CharField(max_length=50, default="Beginner")
    order = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.language.name} - {self.title}"


# =========================================================
# LESSON
# =========================================================

class Lesson(models.Model):
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="lessons"
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=1)
    points = models.PositiveIntegerField(default=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.course.title} - {self.title}"


# =========================================================
# USER LESSON PROGRESS
# =========================================================

class LessonProgress(models.Model):
    user = models.ForeignKey(
        "accounts.VETRIXUser",
        on_delete=models.CASCADE,
        related_name="lesson_progress"
    )
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="user_progress"
    )
    completed = models.BooleanField(default=False)
    score = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "lesson")

    def __str__(self):
        return f"{self.user} - {self.lesson.title}"


# =========================================================
# LESSON CONTENT
# =========================================================

class LessonContent(models.Model):
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="contents"
    )
    word = models.CharField(max_length=200)
    meaning = models.CharField(max_length=200)
    pronunciation = models.CharField(max_length=200, blank=True)
    translation = models.CharField(max_length=200, blank=True)
    example_sentence = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.lesson.title} - {self.word}"


# =========================================================
# DICTIONARY WORD
# =========================================================

class DictionaryWord(models.Model):

    LEVEL_CHOICES = [
        ("Beginner", "Beginner"),
        ("Intermediate", "Intermediate"),
        ("Advanced", "Advanced"),
    ]

    language = models.ForeignKey(
        Language,
        on_delete=models.CASCADE,
        related_name="dictionary_words"
    )
    word = models.CharField(max_length=200)
    meaning = models.CharField(max_length=300)
    pronunciation = models.CharField(max_length=300, blank=True)
    translation = models.CharField(max_length=300, blank=True)
    example_sentence = models.TextField(blank=True)
    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES,
        default="Beginner"
    )
    category = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.word} - {self.language.name}"


# =========================================================
# DAILY LEARNING ACTIVITY
# =========================================================

class DailyActivity(models.Model):
    user = models.ForeignKey(
        "accounts.VETRIXUser",
        on_delete=models.CASCADE,
        related_name="daily_activities"
    )
    date = models.DateField()
    lessons_completed = models.PositiveIntegerField(default=0)
    points_earned = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user} - {self.date}"


# =========================================================
# LEARNING STREAK
# =========================================================

class LearningStreak(models.Model):
    user = models.OneToOneField(
        "accounts.VETRIXUser",
        on_delete=models.CASCADE,
        related_name="learning_streak"
    )
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} - {self.current_streak} days"


# =========================================================
# LEADERBOARD
# =========================================================

class Leaderboard(models.Model):
    user = models.OneToOneField(
        "accounts.VETRIXUser",
        on_delete=models.CASCADE,
        related_name="leaderboard"
    )
    total_points = models.PositiveIntegerField(default=0)
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} - {self.total_points} points"


# =========================================================
# FAVORITES / SAVED WORDS
# =========================================================

class SavedWord(models.Model):
    user = models.ForeignKey(
        "accounts.VETRIXUser",
        on_delete=models.CASCADE,
        related_name="saved_words"
    )
    dictionary_word = models.ForeignKey(
        DictionaryWord,
        on_delete=models.CASCADE,
        related_name="saved_by_users"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "dictionary_word"],
                name="unique_saved_word_per_user"
            )
        ]

    def __str__(self):
        return f"{self.user} - {self.dictionary_word.word}"


# =========================================================
# QUIZ
# =========================================================

class Quiz(models.Model):
    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="quizzes"
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    passing_score = models.PositiveIntegerField(default=60)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.lesson.title} - {self.title}"


# =========================================================
# QUIZ QUESTION
# =========================================================

class QuizQuestion(models.Model):

    OPTION_CHOICES = [
        ("A", "Option A"),
        ("B", "Option B"),
        ("C", "Option C"),
        ("D", "Option D"),
    ]

    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="questions"
    )
    question_text = models.TextField()
    option_a = models.CharField(max_length=300)
    option_b = models.CharField(max_length=300)
    option_c = models.CharField(max_length=300)
    option_d = models.CharField(max_length=300)
    correct_option = models.CharField(
        max_length=1,
        choices=OPTION_CHOICES
    )
    explanation = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.question_text[:100]


# =========================================================
# QUIZ ATTEMPT
# =========================================================

class QuizAttempt(models.Model):
    user = models.ForeignKey(
        "accounts.VETRIXUser",
        on_delete=models.CASCADE,
        related_name="quiz_attempts"
    )
    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="attempts"
    )
    score = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveIntegerField(default=0)
    percentage = models.PositiveIntegerField(default=0)
    passed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.user} - {self.quiz.title} "
            f"- {self.percentage}%"
        )


# =========================================================
# AUTOMATIC MISTAKES & IMPROVEMENTS
# =========================================================

class LearningMistake(models.Model):

    SOURCE_CHOICES = [
        ("quiz", "Quiz"),
        ("interview", "AI Interview"),
        ("coding", "Coding Practice"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("practicing", "Practicing"),
        ("fixed", "Fixed"),
    ]

    user = models.ForeignKey(
        "accounts.VETRIXUser",
        on_delete=models.CASCADE,
        related_name="learning_mistakes"
    )

    source = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        default="quiz"
    )

    quiz_attempt = models.ForeignKey(
        QuizAttempt,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="mistakes"
    )

    question = models.TextField()
    user_answer = models.TextField()
    correct_answer = models.TextField(blank=True)
    explanation = models.TextField(blank=True)
    improvement_tip = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.user} - {self.source} - "
            f"{self.question[:50]}"
        )
