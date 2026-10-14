import requests

from datetime import timedelta
from urllib.parse import quote

from django.db import transaction
from django.db.models import Q, Sum
from django.utils import timezone
from django.core.exceptions import ValidationError

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Language,
    Course,
    Lesson,
    LessonContent,
    LessonProgress,
    DictionaryWord,
    DailyActivity,
    LearningStreak,
    Leaderboard,
    SavedWord,
    Quiz,
    QuizQuestion,
    QuizAttempt,
)

from .serializers import (
    LanguageSerializer,
    CourseSerializer,
    LessonSerializer,
    LessonContentSerializer,
    LessonProgressSerializer,
    DictionaryWordSerializer,
    DailyActivitySerializer,
    LearningStreakSerializer,
    LeaderboardSerializer,
    SavedWordSerializer,
    QuizSerializer,
    QuizQuestionSerializer,
    QuizAttemptSerializer,
)


# ============================================================
# LANGUAGES
# ============================================================

class LanguageListView(generics.ListAPIView):
    queryset = Language.objects.filter(is_active=True)
    serializer_class = LanguageSerializer


# ============================================================
# COURSES
# ============================================================

class CourseListView(generics.ListAPIView):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer


# ============================================================
# LESSONS
# ============================================================

class LessonListView(generics.ListAPIView):
    serializer_class = LessonSerializer

    def get_queryset(self):
        queryset = Lesson.objects.filter(
            is_active=True,
            course__is_active=True,
            course__language__is_active=True,
        ).select_related("course", "course__language")

        course_id = self.request.query_params.get("course")
        language_id = self.request.query_params.get("language")
        level = self.request.query_params.get("level")

        if course_id:
            queryset = queryset.filter(course_id=course_id)

        if language_id:
            queryset = queryset.filter(
                course__language_id=language_id
            )

        if level:
            queryset = queryset.filter(
                course__level__iexact=level
            )

        return queryset


# ============================================================
# LESSON CONTENT
# ============================================================

class LessonContentListView(generics.ListAPIView):
    serializer_class = LessonContentSerializer

    def get_queryset(self):
        queryset = LessonContent.objects.filter(
            lesson__is_active=True,
            lesson__course__is_active=True,
            lesson__course__language__is_active=True,
        ).select_related("lesson")

        lesson_id = self.request.query_params.get("lesson")

        if lesson_id:
            queryset = queryset.filter(lesson_id=lesson_id)

        return queryset


# ============================================================
# DICTIONARY WORDS + EXTERNAL SEARCH
# ============================================================

class DictionaryWordListView(APIView):

    def get(self, request):
        queryset = DictionaryWord.objects.select_related(
            "language"
        ).all()

        search = request.query_params.get("search", "").strip()
        language_code = request.query_params.get(
            "language", ""
        ).strip()
        level = request.query_params.get("level")
        category = request.query_params.get("category")

        if language_code:
            queryset = queryset.filter(
                language__code__iexact=language_code
            )

        if level:
            queryset = queryset.filter(level__iexact=level)

        if category:
            queryset = queryset.filter(
                category__iexact=category
            )

        if search:
            queryset = queryset.filter(
                Q(word__icontains=search)
                | Q(meaning__icontains=search)
                | Q(translation__icontains=search)
                | Q(pronunciation__icontains=search)
                | Q(example_sentence__icontains=search)
            )

            if not queryset.exists():
                external_word = self.fetch_external_word(
                    search=search,
                    language_code=language_code or None,
                )

                if external_word:
                    queryset = DictionaryWord.objects.filter(
                        pk=external_word.pk
                    ).select_related("language")
                else:
                    queryset = DictionaryWord.objects.none()

        serializer = DictionaryWordSerializer(
            queryset,
            many=True,
        )

        return Response(
            {
                "count": queryset.count(),
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def fetch_external_word(self, search, language_code=None):

        # External English dictionary
        if (
            not language_code
            or language_code.lower() in ("en", "eng")
        ):
            try:
                url = (
                    "https://freedictionaryapi.com/api/v1/"
                    "entries/en/"
                    f"{quote(search.strip(), safe='')}"
                )

                response = requests.get(
                    url,
                    timeout=(5, 15),
                    headers={
                        "User-Agent": "VETRIX-Learning-App/1.0"
                    },
                )

                if response.status_code != 200:
                    return None

                data = response.json()
                entries = data.get("entries", [])

                definitions = []
                examples = []
                pronunciations = []

                for entry in entries:
                    for item in entry.get("pronunciations", []):
                        if item.get("type") == "ipa":
                            pronunciation = item.get("text", "")

                            if (
                                pronunciation
                                and pronunciation not in pronunciations
                            ):
                                pronunciations.append(pronunciation)

                    for sense in entry.get("senses", []):
                        definition = sense.get("definition", "")

                        if (
                            definition
                            and definition not in definitions
                        ):
                            definitions.append(definition)

                        for example in sense.get("examples", []):
                            if example and example not in examples:
                                examples.append(example)

                if not definitions:
                    return None

                meaning = " ".join(definitions)
                pronunciation = ", ".join(pronunciations)
                example_sentence = examples[0] if examples else ""

                return self.save_dictionary_word(
                    word=data.get("word", search.strip()),
                    meaning=meaning,
                    pronunciation=pronunciation,
                    translation=meaning,
                    example_sentence=example_sentence,
                    language_code="en",
                )

            except (
                requests.RequestException,
                ValueError,
                TypeError,
                KeyError,
            ):
                return None

        # Translation API for supported languages
        supported_codes = {
            "ta", "hi", "ar", "ml", "te", "ur"
        }

        language_code = language_code.lower()

        if language_code not in supported_codes:
            return None

        language = Language.objects.filter(
            code__iexact=language_code
        ).first()

        if not language:
            return None

        try:
            response = requests.get(
                "https://api.mymemory.translated.net/get",
                params={
                    "q": search,
                    "langpair": f"en|{language_code}",
                },
                timeout=(5, 10),
                headers={
                    "User-Agent": "VETRIX-Learning-App/1.0"
                },
            )

            if response.status_code != 200:
                return None

            data = response.json()

            if data.get("responseStatus") not in (None, 200):
                return None

            translated_text = (
                data.get("responseData", {})
                .get("translatedText", "")
                .strip()
            )

            if (
                not translated_text
                or translated_text.lower().startswith("invalid api")
            ):
                return None

            return self.save_dictionary_word(
                word=search.strip(),
                meaning=translated_text,
                pronunciation="",
                translation=translated_text,
                example_sentence="",
                language_code=language_code,
            )

        except (
            requests.RequestException,
            ValueError,
            TypeError,
            KeyError,
        ):
            return None

    def save_dictionary_word(
        self,
        word,
        meaning,
        pronunciation,
        translation,
        example_sentence,
        language_code,
    ):
        language = Language.objects.filter(
            code__iexact=language_code
        ).first()

        if not language:
            return None

        dictionary_word, created = (
            DictionaryWord.objects.get_or_create(
                word__iexact=word,
                language=language,
                defaults={
                    "word": word,
                    "meaning": meaning,
                    "pronunciation": pronunciation,
                    "translation": translation,
                    "example_sentence": example_sentence,
                },
            )
        )

        return dictionary_word


# ============================================================
# LESSON PROGRESS
# ============================================================

class LessonProgressListCreateView(generics.ListCreateAPIView):
    serializer_class = LessonProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return LessonProgress.objects.filter(
            user=self.request.user
        ).select_related("lesson")

    def perform_create(self, serializer):
        progress = serializer.save(user=self.request.user)

        if progress.completed:
            record_lesson_completion(
                self.request.user,
                progress,
                was_completed=False,
            )


# ============================================================
# LEARNING STREAK HELPER
# ============================================================

def update_learning_streak(user):
    today = timezone.localdate()

    streak, created = LearningStreak.objects.get_or_create(
        user=user,
        defaults={
            "current_streak": 1,
            "longest_streak": 1,
            "last_active_date": today,
        },
    )

    if created:
        return streak

    last_activity = streak.last_active_date

    if last_activity == today:
        return streak

    if last_activity == today - timedelta(days=1):
        streak.current_streak += 1
    else:
        streak.current_streak = 1

    streak.longest_streak = max(
        streak.longest_streak,
        streak.current_streak,
    )

    streak.last_active_date = today

    streak.save(
        update_fields=[
            "current_streak",
            "longest_streak",
            "last_active_date",
            "updated_at",
        ]
    )

    return streak


# ============================================================
# LESSON COMPLETION REWARDS HELPER
# ============================================================

@transaction.atomic
def record_lesson_completion(user, progress, was_completed):
    if not progress.completed or was_completed:
        return

    progress.completed_at = timezone.now()
    progress.save(
        update_fields=["completed_at", "updated_at"]
    )

    today = timezone.localdate()
    points = progress.lesson.points

    activity, created = DailyActivity.objects.get_or_create(
        user=user,
        date=today,
        defaults={
            "lessons_completed": 0,
            "points_earned": 0,
        },
    )

    activity.lessons_completed += 1
    activity.points_earned += points

    activity.save(
        update_fields=[
            "lessons_completed",
            "points_earned",
        ]
    )

    streak = update_learning_streak(user)

    leaderboard, created = Leaderboard.objects.get_or_create(
        user=user,
        defaults={
            "total_points": 0,
            "current_streak": 0,
            "longest_streak": 0,
        },
    )

    leaderboard.total_points = (
        LessonProgress.objects.filter(
            user=user,
            completed=True,
        ).aggregate(
            total=Sum("lesson__points")
        )["total"] or 0
    )

    leaderboard.current_streak = streak.current_streak
    leaderboard.longest_streak = streak.longest_streak

    leaderboard.save(
        update_fields=[
            "total_points",
            "current_streak",
            "longest_streak",
            "updated_at",
        ]
    )


# ============================================================
# SINGLE LESSON PROGRESS
# ============================================================

class LessonProgressDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        try:
            return LessonProgress.objects.get(
                pk=pk,
                user=request.user,
            )
        except LessonProgress.DoesNotExist:
            return None

    def get(self, request, pk):
        progress = self.get_object(request, pk)

        if progress is None:
            return Response(
                {"message": "Lesson progress not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            LessonProgressSerializer(progress).data,
            status=status.HTTP_200_OK,
        )

    def put(self, request, pk):
        progress = self.get_object(request, pk)

        if progress is None:
            return Response(
                {"message": "Lesson progress not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        was_completed = progress.completed

        serializer = LessonProgressSerializer(
            progress,
            data=request.data,
            partial=True,
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            updated_progress = serializer.save(
                user=request.user
            )

            record_lesson_completion(
                request.user,
                updated_progress,
                was_completed=was_completed,
            )

        updated_progress.refresh_from_db()

        return Response(
            {
                "message": "Lesson progress updated successfully.",
                "progress": LessonProgressSerializer(
                    updated_progress
                ).data,
            },
            status=status.HTTP_200_OK,
        )

    def patch(self, request, pk):
        return self.put(request, pk)

    def delete(self, request, pk):
        progress = self.get_object(request, pk)

        if progress is None:
            return Response(
                {"message": "Lesson progress not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        progress.delete()

        return Response(
            {"message": "Lesson progress deleted successfully."},
            status=status.HTTP_200_OK,
        )


# ============================================================
# DAILY ACTIVITY
# ============================================================

class DailyActivityListView(generics.ListCreateAPIView):
    serializer_class = DailyActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DailyActivity.objects.filter(
            user=self.request.user
        ).order_by("-date")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ============================================================
# LEARNING STREAK
# ============================================================

class LearningStreakView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        streak, created = LearningStreak.objects.get_or_create(
            user=request.user,
            defaults={
                "current_streak": 0,
                "longest_streak": 0,
            },
        )

        return Response(
            {
                "current_streak": streak.current_streak,
                "longest_streak": streak.longest_streak,
                "last_activity_date": streak.last_active_date,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# DASHBOARD
# ============================================================

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        progress_queryset = LessonProgress.objects.filter(
            user=user
        )

        total_lessons = Lesson.objects.filter(
            is_active=True,
            course__is_active=True,
            course__language__is_active=True,
        ).count()

        completed_lessons = progress_queryset.filter(
            completed=True,
            lesson__is_active=True,
            lesson__course__is_active=True,
            lesson__course__language__is_active=True,
        ).count()

        total_progress_records = progress_queryset.count()

        streak, created = LearningStreak.objects.get_or_create(
            user=user,
            defaults={
                "current_streak": 0,
                "longest_streak": 0,
            },
        )

        total_points_earned = (
            progress_queryset.filter(
                completed=True,
                lesson__is_active=True,
            ).aggregate(
                total=Sum("lesson__points")
            )["total"] or 0
        )

        saved_words_count = SavedWord.objects.filter(
            user=user
        ).count()

        completion_percentage = (
            round(completed_lessons / total_lessons * 100)
            if total_lessons > 0
            else 0
        )

        return Response(
            {
                "message": "Dashboard fetched successfully.",
                "total_courses": Course.objects.filter(
                    is_active=True,
                    language__is_active=True,
                ).count(),
                "total_lessons": total_lessons,
                "completed_lessons": completed_lessons,
                "total_progress_records": total_progress_records,
                "completion_percentage": completion_percentage,
                "current_streak": streak.current_streak,
                "longest_streak": streak.longest_streak,
                "total_points_earned": total_points_earned,
                "saved_words_count": saved_words_count,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# LEADERBOARD
# ============================================================

class LeaderboardView(generics.ListAPIView):
    serializer_class = LeaderboardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Leaderboard.objects.select_related(
            "user"
        ).order_by("-total_points")


# ============================================================
# SAVED WORDS
# ============================================================

class SavedWordListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        saved_words = (
            SavedWord.objects
            .filter(user=request.user)
            .select_related(
                "dictionary_word",
                "dictionary_word__language",
            )
            .order_by("-created_at")
        )

        serializer = SavedWordSerializer(
            saved_words,
            many=True,
        )

        return Response(
            {
                "message": "Saved words fetched successfully.",
                "count": saved_words.count(),
                "saved_words": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        dictionary_word_id = request.data.get(
            "dictionary_word"
        )

        if not dictionary_word_id:
            return Response(
                {"message": "dictionary_word is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            dictionary_word = DictionaryWord.objects.get(
                pk=int(dictionary_word_id)
            )
        except (
            DictionaryWord.DoesNotExist,
            ValueError,
            TypeError,
            ValidationError,
        ):
            return Response(
                {"message": "Dictionary word not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        saved_word, created = SavedWord.objects.get_or_create(
            user=request.user,
            dictionary_word=dictionary_word,
        )

        serializer = SavedWordSerializer(saved_word)

        return Response(
            {
                "message": (
                    "Word added to favorites."
                    if created
                    else "Word is already in favorites."
                ),
                "created": created,
                "saved_word": serializer.data,
            },
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )


# ============================================================
# DELETE SAVED WORD
# ============================================================

class SavedWordDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            saved_word = SavedWord.objects.get(
                pk=pk,
                user=request.user,
            )
        except SavedWord.DoesNotExist:
            return Response(
                {
                    "message": "Saved word not found in your favorites."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        saved_word.delete()

        return Response(
            {"message": "Word removed from favorites."},
            status=status.HTTP_200_OK,
        )


# ============================================================
# QUIZ LIST
# ============================================================

class QuizListView(generics.ListAPIView):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Quiz.objects.filter(
            is_active=True,
            lesson__is_active=True,
            lesson__course__is_active=True,
            lesson__course__language__is_active=True,
        ).select_related(
            "lesson",
            "lesson__course",
            "lesson__course__language",
        ).prefetch_related("questions")

        lesson_id = self.request.query_params.get("lesson")

        if lesson_id:
            queryset = queryset.filter(
                lesson_id=lesson_id
            )

        return queryset


# ============================================================
# QUIZ DETAIL
# ============================================================

class QuizDetailView(generics.RetrieveAPIView):
    serializer_class = QuizSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Quiz.objects.filter(
            is_active=True,
            lesson__is_active=True,
            lesson__course__is_active=True,
            lesson__course__language__is_active=True,
        ).select_related(
            "lesson"
        ).prefetch_related("questions")


# ============================================================
# QUIZ SUBMISSION
# ============================================================

class QuizSubmitView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            quiz = Quiz.objects.get(
                pk=pk,
                is_active=True,
                lesson__is_active=True,
                lesson__course__is_active=True,
                lesson__course__language__is_active=True,
            )
        except Quiz.DoesNotExist:
            return Response(
                {"error": "Quiz not found or inactive."},
                status=status.HTTP_404_NOT_FOUND,
            )

        answers = request.data.get("answers")

        if not isinstance(answers, list) or not answers:
            return Response(
                {
                    "error": "Answers must be a non-empty list.",
                    "example": {
                        "answers": [
                            {"question_id": 1, "answer": "A"},
                            {"question_id": 2, "answer": "C"},
                        ]
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        question_ids = set()
        normalized_answers = {}

        for item in answers:
            if not isinstance(item, dict):
                return Response(
                    {"error": "Each answer must be an object."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                question_id = int(item.get("question_id"))
            except (TypeError, ValueError):
                return Response(
                    {"error": "Each question_id must be an integer."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            answer = item.get("answer")

            if answer not in ("A", "B", "C", "D"):
                return Response(
                    {"error": "Each answer must be A, B, C, or D."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if question_id in question_ids:
                return Response(
                    {"error": "Duplicate question_id found."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            question_ids.add(question_id)
            normalized_answers[question_id] = answer

        questions = list(
            QuizQuestion.objects.filter(
                quiz=quiz,
                id__in=question_ids,
            )
        )

        if len(questions) != len(question_ids):
            return Response(
                {
                    "error": (
                        "One or more questions do not belong to this quiz."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        total_questions = quiz.questions.count()

        if total_questions == 0:
            return Response(
                {"error": "This quiz has no questions yet."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        correct_count = sum(
            1
            for question in questions
            if normalized_answers[question.id]
            == question.correct_option
        )

        percentage = round(
            correct_count * 100 / total_questions
        )

        passed = percentage >= quiz.passing_score

        with transaction.atomic():
            attempt = QuizAttempt.objects.create(
                user=request.user,
                quiz=quiz,
                score=correct_count,
                total_questions=total_questions,
                percentage=percentage,
                passed=passed,
            )

        return Response(
            {
                "message": "Quiz submitted successfully.",
                "attempt": QuizAttemptSerializer(attempt).data,
                "correct_answers": correct_count,
                "questions_answered": len(questions),
                "unanswered_questions": (
                    total_questions - len(questions)
                ),
                "passing_score": quiz.passing_score,
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# QUIZ ATTEMPT HISTORY
# ============================================================

class QuizAttemptHistoryView(generics.ListAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QuizAttempt.objects.filter(
            user=self.request.user
        ).select_related(
            "quiz"
        ).order_by("-created_at")