from django.urls import path

from .views import (
LanguageListView,
CourseListView,
LessonListView,
LessonContentListView,
DictionaryWordListView,
LessonProgressListCreateView,
LessonProgressDetailView,
DailyActivityListView,
LearningStreakView,
DashboardView,
LeaderboardView,
SavedWordListCreateView,
SavedWordDeleteView,
QuizListView,
QuizDetailView,
QuizSubmitView,
QuizAttemptHistoryView,
)
from .interview_views import AIInterviewView

urlpatterns = [
# Languages
path("languages/", LanguageListView.as_view(), name="language-list"),


# Courses
path("courses/", CourseListView.as_view(), name="course-list"),

# Lessons
path("lessons/", LessonListView.as_view(), name="lesson-list"),

# Lesson Content
path("lesson-content/", LessonContentListView.as_view(), name="lesson-content-list"),

# Dictionary
path("dictionary/", DictionaryWordListView.as_view(), name="dictionary-list"),

# Lesson Progress
path("progress/", LessonProgressListCreateView.as_view(), name="lesson-progress"),
path("progress/<int:pk>/", LessonProgressDetailView.as_view(), name="lesson-progress-detail"),

# Daily Activity
path("daily-activity/", DailyActivityListView.as_view(), name="daily-activity"),

# Learning Streak
path("streak/", LearningStreakView.as_view(), name="learning-streak"),

# Dashboard
path("dashboard/", DashboardView.as_view(), name="dashboard"),

# Leaderboard
path("leaderboard/", LeaderboardView.as_view(), name="leaderboard"),

# Saved Words
path("saved-words/", SavedWordListCreateView.as_view(), name="saved-word-list-create"),
path("saved-words/<int:pk>/", SavedWordDeleteView.as_view(), name="saved-word-delete"),

# Quizzes
path("quizzes/", QuizListView.as_view(), name="quiz-list"),
path("quizzes/<int:pk>/", QuizDetailView.as_view(), name="quiz-detail"),
path("quizzes/<int:pk>/submit/", QuizSubmitView.as_view(), name="quiz-submit"),

# Quiz Attempt History
path("quiz-attempts/", QuizAttemptHistoryView.as_view(), name="quiz-attempt-history"),

# AI Interview
path("ai-interview/", AIInterviewView.as_view(), name="ai-interview"),

]
