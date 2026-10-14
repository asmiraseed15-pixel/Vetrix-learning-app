export type SkillQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

export type SkillLesson = {
  title: string;
  explanation: string;
  example: string;
  code?: string;
  questions: SkillQuestion[];
};

export const SKILL_CONTENT: Record<string, SkillLesson> = {
  "Python introduction": {
    title: "Python Introduction",
    explanation:
      "Python is a beginner-friendly programming language. It is used to build websites, automate tasks, analyse data, and develop AI applications.",
    example:
      "A print statement displays information on the screen. It is one of the simplest Python commands.",
    code: 'print("Hello, World!")',
    questions: [
      {
        question: "What is Python?",
        options: [
          "A programming language",
          "An operating system",
          "A database",
          "A web browser",
        ],
        correctAnswer: 0,
        explanation:
          "Python is a programming language used for many kinds of software development.",
      },
      {
        question: "What does print() do in Python?",
        options: [
          "Deletes a file",
          "Displays output",
          "Creates a database",
          "Stops the computer",
        ],
        correctAnswer: 1,
        explanation: "print() displays output on the screen.",
      },
    ],
  },

  "Variables and data types": {
    title: "Variables and Data Types",
    explanation:
      "A variable stores a value that a program can use. Common Python data types include int for whole numbers, float for decimal numbers, str for text, and bool for True or False.",
    example: "Here, name stores text and age stores a whole number.",
    code: 'name = "Asmi"\nage = 22\nprint(name)\nprint(age)',
    questions: [
      {
        question: "Which data type stores text?",
        options: ["int", "str", "bool", "float"],
        correctAnswer: 1,
        explanation: "The str data type represents text in Python.",
      },
      {
        question: "What is the type of 10?",
        options: ["str", "float", "int", "bool"],
        correctAnswer: 2,
        explanation: "10 is an integer, represented by int.",
      },
    ],
  },

  "If-else conditions": {
    title: "If-Else Conditions",
    explanation:
      "If-else lets a program make decisions. The if block runs when its condition is true; otherwise, the else block runs.",
    example: "The program checks whether a person is old enough to vote.",
    code: 'age = 20\nif age >= 18:\n    print("Eligible")\nelse:\n    print("Not eligible")',
    questions: [
      {
        question: "When does an if block run?",
        options: [
          "When its condition is true",
          "Only when the app closes",
          "Always after else",
          "Only for text values",
        ],
        correctAnswer: 0,
        explanation: "The if block runs when its condition evaluates to true.",
      },
    ],
  },

  "Loops": {
    title: "Loops",
    explanation:
      "Loops repeat a block of code. A for loop is useful when iterating over a sequence, while a while loop repeats as long as its condition remains true.",
    example: "This for loop displays the numbers from 1 to 3.",
    code: "for number in range(1, 4):\n    print(number)",
    questions: [
      {
        question: "Why do programmers use loops?",
        options: [
          "To repeat instructions",
          "To rename Python",
          "To turn off the screen",
          "To delete every variable",
        ],
        correctAnswer: 0,
        explanation: "Loops help repeat instructions without writing them many times.",
      },
    ],
  },

  "Functions": {
    title: "Functions",
    explanation:
      "A function is a reusable block of code that performs a particular task. In Python, def is used to define a function.",
    example: "The function below displays a greeting when called.",
    code: 'def greet():\n    print("Hello!")\n\ngreet()',
    questions: [
      {
        question: "Which keyword defines a Python function?",
        options: ["make", "function", "def", "className"],
        correctAnswer: 2,
        explanation: "Python uses the def keyword to define a function.",
      },
    ],
  },

  "What is Django?": {
    title: "What Is Django?",
    explanation:
      "Django is a Python web framework. It provides tools for building web applications, handling requests, connecting databases, and managing user authentication.",
    example: "A Django view can return a simple HTTP response.",
    code:
      'from django.http import HttpResponse\n\ndef home(request):\n    return HttpResponse("Welcome to Django!")',
    questions: [
      {
        question: "Django is mainly used for what?",
        options: [
          "Building web applications",
          "Editing photos only",
          "Creating computer hardware",
          "Replacing Python",
        ],
        correctAnswer: 0,
        explanation: "Django is a web framework built with Python.",
      },
    ],
  },

  "HTML fundamentals": {
    title: "HTML Fundamentals",
    explanation:
      "HTML stands for HyperText Markup Language. It describes the structure of a web page using elements such as headings, paragraphs, links, and images.",
    example: "This HTML creates a heading and a paragraph.",
    code: "<h1>Welcome</h1>\n<p>My first web page.</p>",
    questions: [
      {
        question: "What is HTML used for?",
        options: [
          "Structuring web pages",
          "Storing passwords securely by itself",
          "Managing a computer's hardware",
          "Replacing every programming language",
        ],
        correctAnswer: 0,
        explanation: "HTML provides the structure and content of web pages.",
      },
    ],
  },

  "CSS layouts": {
    title: "CSS Layouts",
    explanation:
      "CSS controls the appearance and layout of a web page. Flexbox and Grid help arrange elements on the screen.",
    example: "This CSS places items in a row with space between them.",
    code:
      ".container {\n  display: flex;\n  justify-content: space-between;\n  gap: 12px;\n}",
    questions: [
      {
        question: "What is CSS mainly used for?",
        options: [
          "Styling web pages",
          "Creating database records",
          "Sending emails automatically",
          "Replacing HTML content entirely",
        ],
        correctAnswer: 0,
        explanation: "CSS controls colours, spacing, typography, and layouts.",
      },
    ],
  },

  "JavaScript basics": {
    title: "JavaScript Basics",
    explanation:
      "JavaScript adds behaviour and interactivity to websites. It can respond to button clicks, update content, and communicate with APIs.",
    example: "A const variable stores a value that cannot be reassigned.",
    code: 'const message = "Hello!";\nconsole.log(message);',
    questions: [
      {
        question: "What does JavaScript add to many websites?",
        options: [
          "Interactivity",
          "Physical components",
          "Internet cables",
          "Computer memory chips",
        ],
        correctAnswer: 0,
        explanation: "JavaScript enables interactive behaviour on websites.",
      },
    ],
  },

  "What is microbiology?": {
    title: "Introduction to Microbiology",
    explanation:
      "Microbiology is the study of microorganisms, such as bacteria, many fungi, and microscopic algae. Viruses are also studied in microbiology, although whether they are considered living organisms is a separate scientific question.",
    example:
      "Microbiologists can study bacteria in a laboratory to understand their growth and characteristics.",
    questions: [
      {
        question: "What does microbiology study?",
        options: [
          "Microorganisms",
          "Planets only",
          "Building designs",
          "Computer networks only",
        ],
        correctAnswer: 0,
        explanation: "Microbiology focuses on microorganisms and their activities.",
      },
    ],
  },

  "Introduction to anatomy": {
    title: "Introduction to Human Anatomy",
    explanation:
      "Human anatomy studies the structures of the human body, including organs, bones, muscles, and tissues.",
    example:
      "The heart is an organ in the circulatory system that pumps blood around the body.",
    questions: [
      {
        question: "What does anatomy study?",
        options: [
          "Body structures",
          "Weather patterns",
          "Building materials",
          "Computer code only",
        ],
        correctAnswer: 0,
        explanation: "Anatomy focuses on the structures of living organisms.",
      },
    ],
  },
};

export function getSkillLesson(
  lessonTitle: string,
): SkillLesson {
  const exactLesson = SKILL_CONTENT[lessonTitle];

  if (exactLesson) {
    return exactLesson;
  }

  const normalise = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]/g, "");

  const matchedKey = Object.keys(SKILL_CONTENT).find(
    (key) => normalise(key) === normalise(lessonTitle),
  );

  if (matchedKey) {
    return SKILL_CONTENT[matchedKey];
  }

  return {
    title: lessonTitle,
    explanation:
      `${lessonTitle} is an important topic in its learning area. Start by understanding its basic definition, purpose, and common uses. Then study one practical example and practise explaining the concept in your own words.`,
    example:
      "Write down the definition, identify where the concept is used, and work through a simple example from your course.",
    questions: [
      {
        question: `What is a good first step when learning ${lessonTitle}?`,
        options: [
          "Understand the basic concept",
          "Skip all explanations",
          "Memorise without understanding",
          "Avoid practising",
        ],
        correctAnswer: 0,
        explanation:
          "Understanding the basic concept makes it easier to learn advanced ideas.",
      },
    ],
  };
}