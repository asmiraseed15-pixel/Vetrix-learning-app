import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from learning.models import Lesson, Quiz, QuizQuestion

quiz_data = {
    1: ("Tamil Beginner Quiz", [
        ("What does Vanakkam mean?", "Hello", "Goodbye", "Thanks", "Sorry", "A"),
        ("What does Nandri mean?", "Welcome", "Thank you", "Please", "Good night", "B"),
        ("What does Amma mean?", "Father", "Brother", "Mother", "Sister", "C"),
    ]),
    2: ("English Beginner Quiz", [
        ("What is the opposite of hot?", "Warm", "Cold", "Dry", "Fast", "B"),
        ("What is the plural of book?", "Bookes", "Bookies", "Books", "Book", "C"),
        ("Which word is a greeting?", "Hello", "Table", "Pencil", "Window", "A"),
    ]),
    3: ("Hindi Beginner Quiz", [
        ("What does Namaste mean?", "Goodbye", "Hello", "Sorry", "Please", "B"),
        ("What does Dhanyavaad mean?", "Thank you", "Welcome", "Good night", "Water", "A"),
        ("What does Paani mean?", "Food", "Book", "Water", "House", "C"),
    ]),
    4: ("Urdu Beginner Quiz", [
        ("What does Salaam mean?", "Hello/Peace", "Goodbye", "Book", "Water", "A"),
        ("What does Shukriya mean?", "Please", "Thank you", "Sorry", "Welcome", "B"),
        ("What does Paani mean?", "Food", "House", "Water", "School", "C"),
    ]),
    5: ("Telugu Beginner Quiz", [
        ("What does Namaskaram mean?", "Goodbye", "Hello", "Sorry", "Thanks", "B"),
        ("What does Dhanyavaadalu mean?", "Thank you", "Water", "Food", "Welcome", "A"),
        ("What does Neeru mean?", "Book", "House", "Water", "Friend", "C"),
    ]),
    6: ("Arabic Beginner Quiz", [
        ("What does Marhaba mean?", "Goodbye", "Hello", "Thank you", "Sorry", "B"),
        ("What does Shukran mean?", "Please", "Welcome", "Thank you", "Good night", "C"),
        ("What does Maa mean?", "Water", "Food", "Book", "House", "A"),
    ]),
    7: ("Malayalam Beginner Quiz", [
        ("What does Namaskaram mean?", "Goodbye", "Hello", "Sorry", "Thanks", "B"),
        ("What does Nanni mean?", "Thank you", "Water", "Food", "Book", "A"),
        ("What does Vellam mean?", "House", "Friend", "Water", "School", "C"),
    ]),
}

for lesson_id, (title, questions) in quiz_data.items():
    lesson = Lesson.objects.get(id=lesson_id)

    quiz, created = Quiz.objects.get_or_create(
        lesson=lesson,
        title=title,
        defaults={
            "description": f"Beginner practice quiz for {lesson.title}",
            "passing_score": 60,
            "is_active": True,
        },
    )

    for index, item in enumerate(questions, start=1):
        question_text, a, b, c, d, correct = item

        QuizQuestion.objects.get_or_create(
            quiz=quiz,
            order=index,
            defaults={
                "question_text": question_text,
                "option_a": a,
                "option_b": b,
                "option_c": c,
                "option_d": d,
                "correct_option": correct,
            },
        )

print("Total quizzes:", Quiz.objects.count())
print("Total questions:", QuizQuestion.objects.count())
print("Quiz data setup completed!")
