import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from learning.models import Language, Course, Lesson, LessonContent


languages_data = {
    "English": {
        "course": "English Beginner",
        "lesson": "Basic English Words",
        "contents": [
            ("Hello", "Greeting", "Hello", "வணக்கம்", "Hello! How are you?"),
            ("Thank you", "Thanks", "Thank you", "நன்றி", "Thank you for your help."),
            ("Yes", "Agreement", "Yes", "ஆம்", "Yes, I am ready."),
            ("No", "Negative", "No", "இல்லை", "No, thank you."),
            ("Please", "Request", "Please", "தயவு செய்து", "Please sit down."),
            ("Sorry", "Apology", "Sorry", "மன்னிக்கவும்", "Sorry, I am late."),
            ("House", "Home", "House", "வீடு", "This is my house."),
            ("Water", "Drink", "Water", "தண்ணீர்", "I need water."),
            ("Food", "Meal", "Food", "சாப்பாடு", "The food is ready."),
            ("Friend", "Companion", "Friend", "நண்பர்", "He is my friend."),
        ],
    },

    "Hindi": {
        "course": "Hindi Beginner",
        "lesson": "Basic Hindi Words",
        "contents": [
            ("नमस्ते", "Greeting", "Namaste", "வணக்கம்", "नमस्ते! आप कैसे हैं?"),
            ("धन्यवाद", "Thanks", "Dhanyavaad", "நன்றி", "आपका धन्यवाद।"),
            ("हाँ", "Agreement", "Haan", "ஆம்", "हाँ, मैं तैयार हूँ।"),
            ("नहीं", "Negative", "Nahin", "இல்லை", "नहीं, धन्यवाद।"),
            ("कृपया", "Request", "Kripya", "தயவு செய்து", "कृपया बैठिए।"),
            ("माफ़ कीजिए", "Apology", "Maaf Kijiye", "மன்னிக்கவும்", "माफ़ कीजिए, मैं देर से आया।"),
            ("घर", "Home", "Ghar", "வீடு", "यह मेरा घर है।"),
            ("पानी", "Drink", "Paani", "தண்ணீர்", "मुझे पानी चाहिए।"),
            ("खाना", "Meal", "Khaana", "சாப்பாடு", "खाना तैयार है।"),
            ("दोस्त", "Companion", "Dost", "நண்பர்", "वह मेरा दोस्त है।"),
        ],
    },

    "Urdu": {
        "course": "Urdu Beginner",
        "lesson": "Basic Urdu Words",
        "contents": [
            ("سلام", "Greeting", "Salaam", "வணக்கம்", "سلام! آپ کیسے ہیں؟"),
            ("شکریہ", "Thanks", "Shukriya", "நன்றி", "آپ کا شکریہ۔"),
            ("ہاں", "Agreement", "Haan", "ஆம்", "ہاں، میں تیار ہوں۔"),
            ("نہیں", "Negative", "Nahin", "இல்லை", "نہیں، شکریہ۔"),
            ("براہ کرم", "Request", "Barah-e-Karam", "தயவு செய்து", "براہ کرم بیٹھیں۔"),
            ("معاف کیجیے", "Apology", "Maaf Kijiye", "மன்னிக்கவும்", "معاف کیجیے، میں دیر سے آیا۔"),
            ("گھر", "Home", "Ghar", "வீடு", "یہ میرا گھر ہے۔"),
            ("پانی", "Drink", "Paani", "தண்ணீர்", "مجھے پانی چاہیے۔"),
            ("کھانا", "Meal", "Khaana", "சாப்பாடு", "کھانا تیار ہے۔"),
            ("دوست", "Companion", "Dost", "நண்பர்", "وہ میرا دوست ہے۔"),
        ],
    },

    "Telugu": {
        "course": "Telugu Beginner",
        "lesson": "Basic Telugu Words",
        "contents": [
            ("నమస్కారం", "Greeting", "Namaskaaram", "வணக்கம்", "నమస్కారం! మీరు ఎలా ఉన్నారు?"),
            ("ధన్యవాదాలు", "Thanks", "Dhanyavaadaalu", "நன்றி", "మీకు ధన్యవాదాలు."),
            ("అవును", "Agreement", "Avunu", "ஆம்", "అవును, నేను సిద్ధంగా ఉన్నాను."),
            ("కాదు", "Negative", "Kaadu", "இல்லை", "కాదు, ధన్యవాదాలు."),
            ("దయచేసి", "Request", "Dayachesi", "தயவு செய்து", "దయచేసి కూర్చోండి."),
            ("క్షమించండి", "Apology", "Kshaminchandi", "மன்னிக்கவும்", "క్షమించండి, నేను ఆలస్యంగా వచ్చాను."),
            ("ఇల్లు", "Home", "Illu", "வீடு", "ఇది నా ఇల్లు."),
            ("నీరు", "Drink", "Neeru", "தண்ணீர்", "నాకు నీరు కావాలి."),
            ("ఆహారం", "Meal", "Aahaaram", "சாப்பாடு", "ఆహారం సిద్ధంగా ఉంది."),
            ("స్నేహితుడు", "Companion", "Snehitudu", "நண்பர்", "అతను నా స్నేహితుడు."),
        ],
    },

    "Arabic": {
        "course": "Arabic Beginner",
        "lesson": "Basic Arabic Words",
        "contents": [
            ("مرحبا", "Greeting", "Marhaban", "வணக்கம்", "مرحبا! كيف حالك؟"),
            ("شكرا", "Thanks", "Shukran", "நன்றி", "شكرا لك."),
            ("نعم", "Agreement", "Na'am", "ஆம்", "نعم، أنا مستعد."),
            ("لا", "Negative", "La", "இல்லை", "لا، شكرا."),
            ("من فضلك", "Request", "Min Fadlak", "தயவு செய்து", "من فضلك اجلس."),
            ("آسف", "Apology", "Aasif", "மன்னிக்கவும்", "آسف، لقد تأخرت."),
            ("بيت", "Home", "Bayt", "வீடு", "هذا بيتي."),
            ("ماء", "Drink", "Maa'", "தண்ணீர்", "أريد ماء."),
            ("طعام", "Meal", "Ta'aam", "சாப்பாடு", "الطعام جاهز."),
            ("صديق", "Companion", "Sadeeq", "நண்பர்", "هو صديقي."),
        ],
    },

    "Malayalam": {
        "course": "Malayalam Beginner",
        "lesson": "Basic Malayalam Words",
        "contents": [
            ("നമസ്കാരം", "Greeting", "Namaskaaram", "வணக்கம்", "നമസ്കാരം! സുഖമാണോ?"),
            ("നന്ദി", "Thanks", "Nandi", "நன்றி", "നന്ദി."),
            ("അതെ", "Agreement", "Athe", "ஆம்", "അതെ, ഞാൻ തയ്യാറാണ്."),
            ("ഇല്ല", "Negative", "Illa", "இல்லை", "ഇല്ല, നന്ദി."),
            ("ദയവായി", "Request", "Dayavaayi", "தயவு செய்து", "ദയവായി ഇരിക്കൂ."),
            ("ക്ഷമിക്കണം", "Apology", "Kshamikkanam", "மன்னிக்கவும்", "ക്ഷമിക്കണം, ഞാൻ വൈകി."),
            ("വീട്", "Home", "Veedu", "வீடு", "ഇത് എന്റെ വീടാണ്."),
            ("വെള്ളം", "Drink", "Vellam", "தண்ணீர்", "എനിക്ക് വെള്ളം വേണം."),
            ("ഭക്ഷണം", "Meal", "Bhakshanam", "சாப்பாடு", "ഭക്ഷണം തയ്യാറാണ്."),
            ("സുഹൃത്ത്", "Companion", "Suhruth", "நண்பர்", "അവൻ എന്റെ സുഹൃത്താണ്."),
        ],
    },
}


for language_name, data in languages_data.items():

    language, created = Language.objects.get_or_create(
        name=language_name,
        defaults={"is_active": True}
    )

    language.is_active = True
    language.save()

    course, created = Course.objects.get_or_create(
        title=data["course"],
        defaults={
            "language": language,
            "is_active": True
        }
    )

    course.language = language
    course.is_active = True
    course.save()

    lesson, created = Lesson.objects.get_or_create(
        title=data["lesson"],
        course=course,
        defaults={"is_active": True}
    )

    lesson.is_active = True
    lesson.save()

    for index, content in enumerate(data["contents"], start=1):

        word, meaning, pronunciation, translation, example_sentence = content

        LessonContent.objects.get_or_create(
            lesson=lesson,
            order=index,
            defaults={
                "word": word,
                "meaning": meaning,
                "pronunciation": pronunciation,
                "translation": translation,
                "example_sentence": example_sentence
            }
        )

    print(f"✓ {language_name} added successfully")


print("\nAll languages and learning content added successfully!")