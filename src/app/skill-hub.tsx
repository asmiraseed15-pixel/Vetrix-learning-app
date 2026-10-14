import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { router } from "expo-router";

const COLORS = {
  background: "#050816",
  surface: "#101A30",
  surface2: "#16243D",
  border: "#253452",
  cyan: "#37D9FF",
  purple: "#9B7CFF",
  white: "#F5F7FF",
  muted: "#A8B4CC",
  green: "#4ADE80",
  orange: "#FFB86B",
};

type Lesson = {
  title: string;
  explanation: string;
  example: string;
  output: string;
  question: string;
  answer: string;
};

type Topic = {
  title: string;
  icon: string;
  description: string;
  lessons: string[];
  explanation: string;
  example: string;
  output: string;
  question: string;
  answer: string;
};

type Category = {
  title: string;
  icon: string;
  color: string;
  description: string;
  topics: Topic[];
};

type LessonInfo = Omit<Lesson, "title">;

const makeTopic = (
  title: string,
  icon: string,
  description: string,
  lessons: string[],
  example: string,
  output: string,
  question: string,
  answer: string
): Topic => ({
  title,
  icon,
  description,
  lessons,
  explanation: description,
  example,
  output,
  question,
  answer,
});

const CATEGORIES: Category[] = [
  {
    title: "Coding & Technology",
    icon: "💻",
    color: COLORS.cyan,
    description: "Learn programming, websites, databases and AI.",
    topics: [
      makeTopic("Python", "🐍", "Learn Python programming from basic syntax to small projects.", [
        "Python introduction", "Variables and data types", "If-else conditions", "Loops",
        "Functions", "Lists and dictionaries", "File handling", "Mini project ideas",
      ], 'print("Hello, World!")', "Hello, World!", "What is Python?", "Python is a high-level programming language."),

      makeTopic("Django", "🌐", "Build websites and backend applications with Python and Django.", [
        "Introduction to Django", "Create a Django project", "Apps and URL routing", "Views and templates",
        "Models and databases", "Django ORM", "Forms and validation", "Build a mini project",
      ], "django-admin startproject myproject", "A Django project folder is created.", "What is Django?", "Django is a Python framework for building web applications."),

      makeTopic("Frontend Development", "🎨", "Build the visible and interactive part of websites.", [
        "HTML introduction", "HTML elements and forms", "CSS styling", "Flexbox and Grid",
        "JavaScript basics", "DOM and events", "React introduction", "Responsive web design",
      ], "<h1>Hello World</h1>", "A heading appears on a webpage.", "What is frontend development?", "It develops the visible and interactive part of a website."),

      makeTopic("Backend & Databases", "🗄️", "Learn servers, APIs, database queries and authentication.", [
        "Backend introduction", "Client and server", "HTTP and APIs", "CRUD operations",
        "SQL basics", "Database relationships", "Authentication basics", "Build a REST API",
      ], "GET /api/students/", "The server may return student records if the endpoint exists.", "What is an API?", "An API allows software applications to communicate."),

      makeTopic("Artificial Intelligence", "🤖", "Understand AI, machine learning and responsible AI projects.", [
        "Introduction to AI", "AI vs machine learning", "Machine learning basics", "Generative AI",
        "Prompt engineering", "AI tools and safety", "AI project planning", "Build a simple AI project",
      ], 'prompt = "Explain AI simply"', "The text is an example of a prompt.", "What is Generative AI?", "Generative AI creates content such as text, images, audio or code."),
    ],
  },
  {
    title: "Civil Engineering",
    icon: "🏗️",
    color: COLORS.orange,
    description: "Learn construction, estimation and surveying fundamentals.",
    topics: [
      makeTopic("Construction Basics", "🧱", "Understand building materials, foundations, safety and site work.", [
        "Introduction to construction", "Types of buildings", "Cement and concrete", "Bricks and blocks",
        "Foundation basics", "Structural components", "Construction safety", "Site management basics",
      ], "Concrete = Cement + Water + Aggregates", "Concrete ingredients are mixed in suitable proportions.", "What is a foundation?", "A foundation transfers building loads safely to the ground."),

      makeTopic("Estimation & Quantity", "📐", "Calculate quantities and approximate construction costs.", [
        "Introduction to estimation", "Units of measurement", "Length, area and volume", "Quantity calculation",
        "Material estimation", "Labour cost basics", "Rate analysis", "Prepare a simple estimate",
      ], "Area = Length × Width", "5 m × 4 m = 20 m².", "What is estimation?", "It calculates expected quantities and costs before work begins."),

      makeTopic("Surveying", "📍", "Learn land measurement, levels, instruments and survey records.", [
        "Introduction to surveying", "Chain surveying", "Compass surveying", "Levelling basics",
        "Surveying instruments", "Contours and maps", "Surveying calculations", "Fieldwork safety",
      ], "Record measured distance in a field book.", "The recorded measurement can be used for survey calculations.", "Why is surveying important?", "It establishes land measurements and positions for planning and construction."),
    ],
  },
  {
    title: "Architecture & Design",
    icon: "🏠",
    color: COLORS.purple,
    description: "Understand floor plans, interiors and 3D design.",
    topics: [
      makeTopic("Floor Plan Reading", "📋", "Read room layouts, symbols, dimensions and house plans.", [
        "Introduction to floor plans", "Common plan symbols", "Walls and partitions", "Doors and windows",
        "Dimensions and scale", "Room layout", "Reading a house plan", "Plan-reading practice",
      ], "Bedroom: 4 m × 3 m", "Bedroom area = 12 m².", "What is a floor plan?", "A floor plan shows the arrangement of spaces viewed from above."),

      makeTopic("Interior Design", "🛋️", "Plan functional indoor spaces using colour, lighting and furniture.", [
        "Introduction to interiors", "Colour theory basics", "Space planning", "Furniture arrangement",
        "Lighting design", "Materials and textures", "Design styles", "Create a room concept",
      ], "Room design = Layout + Colour + Lighting + Furniture", "These elements work together to create a functional room.", "What is space planning?", "It organises furniture and activities to use a room effectively."),

      makeTopic("3D Design Basics", "🧊", "Explore modelling, materials, camera views and rendering.", [
        "Introduction to 3D design", "2D vs 3D", "Shapes and modelling", "Materials and textures",
        "Lighting in 3D", "Camera and views", "Rendering basics", "Create a simple model",
      ], "A cube has width, height and depth.", "A cube is a three-dimensional object.", "What is 3D modelling?", "It is the process of creating a three-dimensional digital object."),
    ],
  },
  {
    title: "Medical Knowledge",
    icon: "🩺",
    color: COLORS.green,
    description: "Learn introductory anatomy, microbiology, coding and first aid.",
    topics: [
      makeTopic("Human Anatomy", "🫀", "Study body structures, organs and major body systems.", [
        "Introduction to anatomy", "Skeletal system", "Muscular system", "Digestive system",
        "Respiratory system", "Circulatory system", "Nervous system", "Major organs revision",
      ], "Heart → Pumps blood around the body", "The heart is part of the circulatory system.", "What is anatomy?", "Anatomy is the study of the structure of the body."),

      makeTopic("Microbiology", "🔬", "Study microorganisms, infection prevention and laboratory safety.", [
        "Introduction to microbiology", "Bacteria", "Viruses", "Fungi",
        "Protozoa", "Microorganisms and disease", "Sterilisation and disinfection", "Laboratory safety",
      ], "Microscope → Observe tiny structures", "Microscopes help scientists study cells and microorganisms.", "What is microbiology?", "Microbiology is the study of microorganisms."),

      makeTopic("Medical Coding", "📝", "Learn medical terminology, records, coding systems and compliance.", [
        "Introduction to medical coding", "Medical terminology", "Anatomy for coding", "ICD-10-CM basics",
        "CPT basics", "Reading medical records", "Coding accuracy and compliance", "Practice coding scenarios",
      ], "Review documentation → Check guidelines → Select code", "Code selection must follow official coding rules and documentation.", "What is medical coding?", "It assigns standard codes to documented healthcare diagnoses and services."),

      makeTopic("First Aid Education", "🩹", "Learn basic emergency awareness and how to seek appropriate help.", [
        "Introduction to first aid", "Emergency assessment", "Calling emergency services", "Bleeding awareness",
        "Burn safety", "Choking emergencies", "CPR awareness", "First aid kit basics",
      ], "Check scene safety → Call for help", "Follow local emergency guidance and trained responders' instructions.", "What is first aid?", "First aid is immediate assistance provided before professional medical care."),
    ],
  },
  {
    title: "Career & Communication",
    icon: "💼",
    color: "#F472B6",
    description: "Build interview, English communication and workplace skills.",
    topics: [
      makeTopic("Interview Practice", "🎤", "Practise interviews and explain your skills confidently.", [
        "Interview introduction", "Tell me about yourself", "Strengths and weaknesses", "Common HR questions",
        "Technical interview basics", "Body language", "Mock interview practice", "Interview follow-up",
      ], 'Question: "Tell me about yourself."', "Introduce your background, relevant skills and career goal.", "How should you answer interview questions?", "Listen carefully, answer honestly and give relevant examples."),

      makeTopic("Spoken English", "🗣️", "Improve daily English, pronunciation, vocabulary and conversations.", [
        "Daily-use English", "Basic sentence formation", "Present tense", "Past and future tense",
        "Asking questions", "Workplace conversations", "Pronunciation practice", "Speaking activities",
      ], 'I am learning Python.', "This sentence describes an activity happening now.", "How can you improve spoken English?", "Practise daily, learn useful phrases and listen to clear English."),

      makeTopic("Resume & Workplace Skills", "📄", "Prepare a resume, write professional emails and develop workplace habits.", [
        "Resume introduction", "Write a career objective", "Present technical skills", "Describe projects",
        "Email writing", "Teamwork and communication", "Time management", "Prepare a job application",
      ], "Project: Name + Technologies + What you built", "A clear project entry explains your contribution and skills.", "What should a fresher resume include?", "Contact details, summary, education, skills, projects, certifications and relevant experience."),
    ],
  },
];

/*
 * Every activity below has its own explanation, example, result,
 * question and answer. Keys must match the lesson titles above.
 */
const DETAILS: Record<string, Record<string, LessonInfo>> = {
  Python: {
    "Python introduction": {
      explanation: "Python is a beginner-friendly programming language used for websites, automation, data analysis and AI.",
      example: 'print("Hello, World!")',
      output: "Hello, World!",
      question: "What is Python?",
      answer: "Python is a high-level programming language with readable syntax.",
    },
    "Variables and data types": {
      explanation: "Variables refer to values. Common types include str for text, int for whole numbers, float for decimals and bool for True or False.",
      example: 'name = "Asmi"\nage = 22\nis_student = True\nprint(name, age, is_student)',
      output: "Asmi 22 True",
      question: "What is a variable?",
      answer: "A variable is a name used to refer to a value, such as age = 22.",
    },
    "If-else conditions": {
      explanation: "if and else let a program choose a path depending on whether a condition is true or false.",
      example: "age = 20\nif age >= 18:\n    print('Eligible')\nelse:\n    print('Not eligible')",
      output: "Eligible",
      question: "Why do we use if-else?",
      answer: "To run different instructions based on a condition.",
    },
    Loops: {
      explanation: "Loops repeat instructions. A for loop iterates over a sequence, while a while loop repeats while its condition is true.",
      example: "for number in range(1, 4):\n    print(number)",
      output: "1\n2\n3",
      question: "Why do we use loops?",
      answer: "Loops repeat instructions without writing the same code multiple times.",
    },
    Functions: {
      explanation: "A function is a reusable block of code. Python uses def to define a function.",
      example: "def greet():\n    print('Hello!')\n\ngreet()",
      output: "Hello!",
      question: "What is a function?",
      answer: "A named, reusable block of code that performs a task.",
    },
    "Lists and dictionaries": {
      explanation: "Lists store ordered items. Dictionaries store values using key-value pairs.",
      example: "fruits = ['Apple', 'Orange']\nstudent = {'name': 'Asmi'}\nprint(fruits[0])\nprint(student['name'])",
      output: "Apple\nAsmi",
      question: "How does a list differ from a dictionary?",
      answer: "Lists use positions to access items; dictionaries use keys.",
    },
    "File handling": {
      explanation: "File handling lets Python read and write files. The with statement helps close a file automatically.",
      example: "with open('notes.txt', 'w') as f:\n    f.write('Hello Python')\nwith open('notes.txt', 'r') as f:\n    print(f.read())",
      output: "Hello Python",
      question: "What does file mode 'r' mean?",
      answer: "It opens a file for reading. Mode 'w' opens a file for writing and replaces existing content.",
    },
    "Mini project ideas": {
      explanation: "A mini project combines programming concepts to solve a small, practical problem.",
      example: "tasks = []\ntasks.append('Learn Python')\nprint(tasks)",
      output: "['Learn Python']",
      question: "Why build mini projects?",
      answer: "Projects help practise concepts, solve problems and demonstrate skills.",
    },
  },

  Django: {
    "Introduction to Django": {
      explanation: "Django is a Python framework that includes URL routing, views, templates, models and an admin site.",
      example: "pip install django",
      output: "Pip installs Django if the environment and internet access are configured.",
      question: "What is Django?",
      answer: "A Python web framework for building web applications.",
    },
    "Create a Django project": {
      explanation: "A project contains the settings and configuration for a Django website.",
      example: "django-admin startproject myproject",
      output: "Creates the myproject project folder.",
      question: "Which command creates a Django project?",
      answer: "django-admin startproject myproject",
    },
    "Apps and URL routing": {
      explanation: "Apps organise features. URL patterns connect browser paths to the views that handle them.",
      example: "path('about/', views.about, name='about')",
      output: "The about/ path is routed to the about view when configured.",
      question: "What does URL routing do?",
      answer: "It maps requested URLs to view functions or classes.",
    },
    "Views and templates": {
      explanation: "A view handles a request; a template defines the HTML used to present a page.",
      example: "return render(request, 'home.html')",
      output: "Renders home.html when the template exists and is configured.",
      question: "What does a Django view do?",
      answer: "It processes a request and returns a response.",
    },
    "Models and databases": {
      explanation: "Models define the structure of stored information using Python classes and fields.",
      example: "class Student(models.Model):\n    name = models.CharField(max_length=100)",
      output: "Defines a Student model with a name field.",
      question: "What is a model?",
      answer: "A Python class that describes data stored and managed by Django.",
    },
    "Django ORM": {
      explanation: "The ORM lets you query and change database records using Python objects.",
      example: "Student.objects.all()",
      output: "Returns a QuerySet of Student records.",
      question: "What is Django ORM?",
      answer: "It allows database operations through Python instead of manually writing every SQL query.",
    },
    "Forms and validation": {
      explanation: "Forms collect input and validate submitted data before it is processed.",
      example: "form = StudentForm(request.POST)\nif form.is_valid():\n    form.save()",
      output: "Saves valid data if the form and model are configured correctly.",
      question: "Why validate form data?",
      answer: "To check that submitted values meet the required rules before saving.",
    },
    "Build a mini project": {
      explanation: "A small Django project combines URLs, views, templates, forms and models into a working feature.",
      example: "Student list → Add student → Save record",
      output: "A student-management flow when each component is implemented.",
      question: "What can a student project teach?",
      answer: "Routing, templates, models, forms and database operations.",
    },
  },

  "Frontend Development": {
    "HTML introduction": {
      explanation: "HTML gives a webpage its structure using elements such as headings, paragraphs and lists.",
      example: "<h1>Hello World</h1>\n<p>Welcome!</p>",
      output: "Displays a heading and paragraph.",
      question: "What is HTML used for?",
      answer: "HTML structures the content of webpages.",
    },
    "HTML elements and forms": {
      explanation: "Elements display content; forms collect information entered by users.",
      example: "<form>\n  <input type='text' placeholder='Name' />\n  <button>Send</button>\n</form>",
      output: "Displays a text input and a Send button.",
      question: "What is an HTML form?",
      answer: "A structure for collecting user input.",
    },
    "CSS styling": {
      explanation: "CSS controls colours, fonts, spacing, borders and layout.",
      example: "h1 {\n  color: blue;\n  font-size: 28px;\n}",
      output: "The heading appears blue and 28 pixels in size.",
      question: "What does CSS do?",
      answer: "CSS styles and lays out HTML elements.",
    },
    "Flexbox and Grid": {
      explanation: "Flexbox arranges items along one main axis. Grid is useful for layouts organised into rows and columns.",
      example: ".container {\n  display: flex;\n  gap: 12px;\n}",
      output: "Child elements are arranged using Flexbox with spacing between them.",
      question: "When is CSS Grid useful?",
      answer: "For two-dimensional layouts using rows and columns.",
    },
    "JavaScript basics": {
      explanation: "JavaScript adds logic and interactive behaviour to webpages.",
      example: "const name = 'Asmi';\nconsole.log('Hello ' + name);",
      output: "Hello Asmi",
      question: "What is JavaScript used for?",
      answer: "It adds behaviour and can update webpage content.",
    },
    "DOM and events": {
      explanation: "The DOM represents webpage elements. Events let code respond to user actions.",
      example: "button.addEventListener('click', () => {\n  console.log('Clicked!');\n});",
      output: "Logs Clicked! when the configured button is clicked.",
      question: "What is a click event?",
      answer: "An event triggered when the user clicks an element.",
    },
    "React introduction": {
      explanation: "React builds interfaces using reusable components and declarative UI updates.",
      example: "function Welcome() {\n  return <h1>Hello!</h1>;\n}",
      output: "The component renders a Hello! heading when used in a React app.",
      question: "What is a React component?",
      answer: "A reusable part of a user interface.",
    },
    "Responsive web design": {
      explanation: "Responsive design adapts layouts to phones, tablets and desktop screens.",
      example: "@media (max-width: 600px) {\n  .card { width: 100%; }\n}",
      output: "The card takes full width at viewport widths up to 600 pixels.",
      question: "Why use responsive design?",
      answer: "To keep websites usable across different screen sizes.",
    },
  },

  "Backend & Databases": {
    "Backend introduction": {
      explanation: "The backend processes application logic, authentication, API requests and data operations.",
      example: "Request → Backend logic → Database",
      output: "The backend processes a request and may read or update data.",
      question: "What is backend development?",
      answer: "Building server-side logic and services for an application.",
    },
    "Client and server": {
      explanation: "A client requests a resource or service. A server processes the request and sends a response.",
      example: "Client → Request → Server\nClient ← Response ← Server",
      output: "The server returns a response to the client.",
      question: "What is the difference between a client and server?",
      answer: "The client requests a service; the server provides it.",
    },
    "HTTP and APIs": {
      explanation: "HTTP is a protocol for web requests and responses. APIs define how software exchanges data or functionality.",
      example: "GET /api/students/",
      output: "The endpoint may return student data if it exists and access is allowed.",
      question: "What is an API?",
      answer: "A defined way for software systems to communicate.",
    },
    "CRUD operations": {
      explanation: "CRUD means Create, Read, Update and Delete, the main operations for managing records.",
      example: "Create student\nRead students\nUpdate student\nDelete student",
      output: "These actions represent common database operations.",
      question: "What does CRUD stand for?",
      answer: "Create, Read, Update and Delete.",
    },
    "SQL basics": {
      explanation: "SQL is used to retrieve and manage data in relational databases.",
      example: "SELECT name FROM students;",
      output: "Returns the name column from the students table.",
      question: "What does SELECT do?",
      answer: "It retrieves specified data from database tables.",
    },
    "Database relationships": {
      explanation: "Relationships connect records between tables using keys.",
      example: "students.id → enrollments.student_id",
      output: "An enrollment record can reference its student.",
      question: "What is a foreign key?",
      answer: "A field that references a key in another table to link records.",
    },
    "Authentication basics": {
      explanation: "Authentication verifies a user's identity before allowing access to protected resources.",
      example: "Submit credentials → Verify → Start session",
      output: "A session may be created after successful verification.",
      question: "What is authentication?",
      answer: "The process of verifying a user's identity.",
    },
    "Build a REST API": {
      explanation: "A REST API exposes resources through endpoints and uses HTTP methods to work with them.",
      example: "GET /api/students/\nPOST /api/students/",
      output: "GET can retrieve records; POST can create a record if supported.",
      question: "What is a REST API?",
      answer: "An API style that uses resource-oriented endpoints and HTTP methods.",
    },
  },

  "Artificial Intelligence": {
    "Introduction to AI": {
      explanation: "AI systems perform tasks such as recognising patterns, understanding language and making predictions.",
      example: "Input: a question → AI system → response",
      output: "An AI system may generate a response based on its capabilities.",
      question: "What is AI?",
      answer: "The field of creating systems that perform tasks associated with intelligence.",
    },
    "AI vs machine learning": {
      explanation: "AI is the broader field; machine learning is one approach in which systems learn patterns from data.",
      example: "AI includes machine learning; machine learning includes many model types.",
      output: "Machine learning is a subset of AI.",
      question: "Are AI and machine learning identical?",
      answer: "No. Machine learning is a branch of AI.",
    },
    "Machine learning basics": {
      explanation: "Machine learning models learn patterns from examples and use them to make predictions.",
      example: "Training data → Model training → Prediction",
      output: "A trained model predicts a result for new input.",
      question: "What is training data?",
      answer: "Data used to help a model learn patterns.",
    },
    "Generative AI": {
      explanation: "Generative AI produces new content such as text, images, audio or code.",
      example: 'prompt = "Write a short story about a robot"',
      output: "An AI tool may generate a short story about a robot.",
      question: "What can Generative AI create?",
      answer: "It can create content such as text, images, audio and code.",
    },
    "Prompt engineering": {
      explanation: "Prompt engineering means writing clear instructions and context to guide an AI system.",
      example: 'Explain Python loops in 3 beginner-friendly steps with one example.',
      output: "A response focused on three steps and an example.",
      question: "What makes a good prompt?",
      answer: "Clear instructions, relevant context and a defined output goal.",
    },
    "AI tools and safety": {
      explanation: "AI tools can help with work and learning, but outputs may contain errors or bias.",
      example: "Ask AI → Verify facts → Check privacy → Use responsibly",
      output: "A safer process includes checking important claims.",
      question: "Should every AI answer be trusted?",
      answer: "No. Verify important information and protect sensitive data.",
    },
    "AI project planning": {
      explanation: "Planning identifies the problem, users, input data, expected output and evaluation criteria.",
      example: "Problem: Organise notes\nInput: Notes\nOutput: Categorised notes",
      output: "A basic plan defines the input and desired result.",
      question: "What should be defined before building an AI project?",
      answer: "The problem, users, data, expected result, evaluation and risks.",
    },
    "Build a simple AI project": {
      explanation: "A beginner project should solve one small problem and clearly define its limitations.",
      example: "User question → AI service → Answer",
      output: "The app displays a response from the configured AI service.",
      question: "What matters in an AI project?",
      answer: "A clear goal, testing, privacy protection and honest limitations.",
    },
  },
};

/* Detailed lesson content for Civil, Architecture, Medical and Career topics. */
const MORE_DETAILS: Record<string, Record<string, LessonInfo>> = {
  "Construction Basics": {
    "Introduction to construction": {
      explanation: "Construction turns a planned design into a building or other structure through coordinated labour, materials and equipment.",
      example: "Planning → Site preparation → Construction → Inspection",
      output: "A sequence of major construction stages.",
      question: "What is construction?",
      answer: "The process of building or assembling structures according to a plan.",
    },
    "Types of buildings": {
      explanation: "Buildings may be residential, commercial, institutional, industrial or used for other purposes.",
      example: "House = Residential\nSchool = Institutional\nShop = Commercial",
      output: "Each example represents a different building use.",
      question: "What is a residential building?",
      answer: "A building designed primarily for people to live in.",
    },
    "Cement and concrete": {
      explanation: "Cement is a binding material. Concrete is made from cement, water, fine aggregate and coarse aggregate.",
      example: "Cement + Water + Sand + Coarse aggregate",
      output: "These ingredients form concrete when correctly proportioned and mixed.",
      question: "How is cement different from concrete?",
      answer: "Cement is an ingredient; concrete is a mixture containing cement and aggregates.",
    },
    "Bricks and blocks": {
      explanation: "Bricks and blocks are masonry units used for walls and partitions. Their selection depends on design and site requirements.",
      example: "Wall area = Length × Height − openings",
      output: "The net wall area helps estimate masonry quantities.",
      question: "What are bricks and blocks used for?",
      answer: "They are commonly used to construct walls and partitions.",
    },
    "Foundation basics": {
      explanation: "Foundations transfer structural loads to the ground. The design depends on soil, loads and site conditions.",
      example: "Building load → Foundation → Supporting soil",
      output: "Loads are transferred to the ground through the foundation.",
      question: "What is the purpose of a foundation?",
      answer: "To transfer loads safely to the supporting ground.",
    },
    "Structural components": {
      explanation: "Common structural components include beams, columns, slabs and foundations, which work together to support loads.",
      example: "Slab → Beam → Column → Foundation",
      output: "A simplified example of a load path.",
      question: "What does a column do?",
      answer: "A column carries loads from supported structural elements toward the foundation.",
    },
    "Construction safety": {
      explanation: "Construction safety includes hazard identification, suitable protective equipment, training and safe work procedures.",
      example: "Identify hazard → Assess risk → Apply controls",
      output: "A basic hazard-control workflow.",
      question: "Why is construction safety important?",
      answer: "It reduces the risk of injuries and unsafe working conditions.",
    },
    "Site management basics": {
      explanation: "Site management coordinates people, materials, equipment, schedules and quality checks.",
      example: "Daily plan → Assign tasks → Inspect progress",
      output: "A simple daily site-management routine.",
      question: "What does site management coordinate?",
      answer: "Labour, materials, equipment, time, safety and quality.",
    },
  },

  "Estimation & Quantity": {
    "Introduction to estimation": {
      explanation: "Estimation predicts quantities and costs before work begins, using drawings, specifications and rates.",
      example: "Estimated cost = Quantity × Rate",
      output: "The formula gives a basic cost estimate for an item of work.",
      question: "Why prepare an estimate?",
      answer: "To plan quantities, budgets and resources before construction.",
    },
    "Units of measurement": {
      explanation: "Construction quantities use appropriate units such as metres, square metres, cubic metres and kilograms.",
      example: "Length: m\nArea: m²\nVolume: m³",
      output: "Each unit describes a different type of measurement.",
      question: "Which unit is used for volume?",
      answer: "Cubic metres (m³) are commonly used for construction volume.",
    },
    "Length, area and volume": {
      explanation: "Length measures distance, area measures a surface and volume measures three-dimensional space.",
      example: "Area = 5 × 4 = 20 m²\nVolume = 5 × 4 × 3 = 60 m³",
      output: "Area is 20 m² and volume is 60 m³.",
      question: "How do you calculate the volume of a cuboid?",
      answer: "Length × Width × Height.",
    },
    "Quantity calculation": {
      explanation: "Quantity calculations use measured dimensions and the relevant method for each construction item.",
      example: "Floor area = Length × Width",
      output: "A 6 m × 5 m floor has an area of 30 m².",
      question: "What information is needed for a floor-area calculation?",
      answer: "The floor's length and width, measured in compatible units.",
    },
    "Material estimation": {
      explanation: "Material estimation predicts the required quantity of materials using design dimensions and specifications.",
      example: "Required quantity = Measured work quantity × Applicable material factor",
      output: "The factor depends on the material and specified construction method.",
      question: "Why estimate materials before work?",
      answer: "To plan purchases, reduce shortages and manage waste.",
    },
    "Labour cost basics": {
      explanation: "Labour cost estimation uses the required workforce, working time and applicable labour rates.",
      example: "Labour cost = Worker-days × Rate per worker-day",
      output: "A basic estimate of labour cost.",
      question: "What affects labour cost?",
      answer: "Work quantity, productivity, workforce size, duration and labour rates.",
    },
    "Rate analysis": {
      explanation: "Rate analysis estimates the unit cost of work by considering materials, labour, equipment and applicable overheads.",
      example: "Unit rate = Total item cost ÷ Quantity",
      output: "The result is the estimated cost per unit of work.",
      question: "What is rate analysis?",
      answer: "Calculating a work item's unit rate from its cost components.",
    },
    "Prepare a simple estimate": {
      explanation: "A simple estimate lists work items, measured quantities, unit rates and calculated amounts.",
      example: "Amount = Quantity × Rate",
      output: "Each line item has a calculated amount that contributes to the total.",
      question: "What details appear in an estimate?",
      answer: "Work description, quantity, unit, rate and amount.",
    },
  },

  Surveying: {
    "Introduction to surveying": {
      explanation: "Surveying determines the relative positions, distances, directions and elevations of points on land.",
      example: "Choose stations → Measure → Record → Plot",
      output: "A basic surveying workflow.",
      question: "What is surveying?",
      answer: "The measurement and mapping of land features and positions.",
    },
    "Chain surveying": {
      explanation: "Chain surveying measures linear distances and is suitable for relatively small, open areas with simple details.",
      example: "A-B = 20 m\nB-C = 15 m",
      output: "Measured distances can be recorded in the field book.",
      question: "What does chain surveying mainly measure?",
      answer: "Linear distances using a chain or measuring tape.",
    },
    "Compass surveying": {
      explanation: "Compass surveying measures directions or bearings along survey lines and records the corresponding distances.",
      example: "Line AB: Bearing + measured distance",
      output: "The line can be plotted using its bearing and distance.",
      question: "What is a bearing?",
      answer: "The direction of a survey line expressed relative to a reference direction.",
    },
    "Levelling basics": {
      explanation: "Levelling determines height differences between points using appropriate instruments and staff readings.",
      example: "Height difference = Back sight − Fore sight",
      output: "The formula gives the height difference for the applicable setup.",
      question: "What is levelling used for?",
      answer: "To determine elevations or differences in height between points.",
    },
    "Surveying instruments": {
      explanation: "Surveying instruments include tapes, levels, theodolites and total stations, each used for particular measurements.",
      example: "Tape → Distance\nLevel → Elevation difference\nTotal station → Angles and distances",
      output: "Different instruments support different survey tasks.",
      question: "What can a total station measure?",
      answer: "It measures angles and distances and can calculate point coordinates.",
    },
    "Contours and maps": {
      explanation: "Contour lines connect points of equal elevation and help show the shape of the land.",
      example: "Contour 100 m → Points at 100 m elevation",
      output: "Contour lines help interpret slopes and terrain.",
      question: "What does a contour line represent?",
      answer: "A line connecting points with the same elevation.",
    },
    "Surveying calculations": {
      explanation: "Survey calculations convert field measurements into distances, bearings, elevations or coordinates as required.",
      example: "Average distance = (10 m + 12 m) ÷ 2",
      output: "Average distance = 11 m.",
      question: "Why check surveying calculations?",
      answer: "To detect errors and improve the reliability of recorded measurements.",
    },
    "Fieldwork safety": {
      explanation: "Surveying safety requires awareness of traffic, terrain, weather, equipment and other site hazards.",
      example: "Assess site → Wear suitable PPE → Communicate with team",
      output: "A basic fieldwork safety checklist.",
      question: "What should surveyors check before fieldwork?",
      answer: "Site hazards, weather, equipment condition, access and required protective equipment.",
    },
  },

  "Floor Plan Reading": {
    "Introduction to floor plans": {
      explanation: "A floor plan is a scaled top-view drawing of the layout of a building level.",
      example: "Room → Walls → Door openings → Dimensions",
      output: "These details help explain how spaces are arranged.",
      question: "What is a floor plan?",
      answer: "A top-view drawing showing the arrangement of spaces in a building.",
    },
    "Common plan symbols": {
      explanation: "Plan symbols represent features such as doors, windows, stairs and fixtures. Always check the drawing legend.",
      example: "Symbol + Legend = Meaning",
      output: "The legend helps identify the symbols used in the drawing.",
      question: "Why use a plan legend?",
      answer: "It explains the symbols and abbreviations used in the drawing.",
    },
    "Walls and partitions": {
      explanation: "Floor plans show wall positions. Structural and non-structural walls must be distinguished using the design documents.",
      example: "External wall → Building boundary\nPartition → Separates internal spaces",
      output: "Different wall types serve different purposes.",
      question: "What is a partition wall?",
      answer: "An internal wall used to divide spaces; it may not carry structural loads.",
    },
    "Doors and windows": {
      explanation: "Doors and windows are shown using drawing conventions to indicate location, opening and orientation.",
      example: "Door swing arc → Indicates opening direction",
      output: "The arc helps interpret the door's swing.",
      question: "What does a door swing arc show?",
      answer: "The direction and space occupied by the door as it opens.",
    },
    "Dimensions and scale": {
      explanation: "Dimensions give actual measurements; scale relates drawing measurements to real-world measurements.",
      example: "At 1:100 scale, 1 cm on paper represents 1 m in reality.",
      output: "A 1 cm drawing length represents 1 m at this scale.",
      question: "What does a 1:100 scale mean?",
      answer: "One unit on the drawing represents 100 of the same units in reality.",
    },
    "Room layout": {
      explanation: "Room layout considers room function, circulation, furniture, openings and access.",
      example: "Bedroom plan → Bed + Wardrobe + Walking space",
      output: "The arrangement should allow practical movement around furniture.",
      question: "What should a room layout consider?",
      answer: "Room function, access, furniture, circulation and dimensions.",
    },
    "Reading a house plan": {
      explanation: "Read the title, scale, orientation, dimensions, symbols and room labels before interpreting a house plan.",
      example: "Title → North arrow → Scale → Room labels → Dimensions",
      output: "These checks help establish the drawing's meaning.",
      question: "What should you check first when reading a plan?",
      answer: "Review the drawing title, scale, orientation and legend.",
    },
    "Plan-reading practice": {
      explanation: "Plan-reading practice involves identifying spaces, openings, dimensions and circulation from a drawing.",
      example: "Room: 4 m × 3 m",
      output: "Room area = 12 m².",
      question: "How do you calculate the room area?",
      answer: "Multiply the room's length by its width when it is rectangular.",
    },
  },

  "Interior Design": {
    "Introduction to interiors": {
      explanation: "Interior design organises indoor spaces to meet functional, comfort and visual needs.",
      example: "Function + Layout + Lighting + Materials",
      output: "These factors contribute to a usable interior.",
      question: "What is interior design?",
      answer: "Planning indoor spaces for function, comfort and appearance.",
    },
    "Colour theory basics": {
      explanation: "Colour theory explores colour relationships, contrast, harmony and the effects colours can have on a space.",
      example: "Blue + Orange → Complementary colours",
      output: "Complementary colours sit opposite one another on a traditional colour wheel.",
      question: "What are complementary colours?",
      answer: "Colours positioned opposite one another on a colour wheel.",
    },
    "Space planning": {
      explanation: "Space planning arranges furniture and activities while considering movement, access and room dimensions.",
      example: "Measure room → Identify activities → Arrange zones",
      output: "A layout that supports the room's intended use.",
      question: "What is space planning?",
      answer: "Organising a space so activities and movement work effectively.",
    },
    "Furniture arrangement": {
      explanation: "Furniture arrangement balances function, circulation, scale and visual balance.",
      example: "Keep a clear route between the door and main seating area.",
      output: "The main circulation route remains accessible.",
      question: "Why is circulation important?",
      answer: "It allows people to move through a room safely and comfortably.",
    },
    "Lighting design": {
      explanation: "Lighting design combines ambient, task and accent lighting to support activities and create atmosphere.",
      example: "Ambient: ceiling light\nTask: desk lamp\nAccent: picture light",
      output: "Each type serves a different lighting purpose.",
      question: "What is task lighting?",
      answer: "Lighting focused on a specific activity such as reading or working.",
    },
    "Materials and textures": {
      explanation: "Materials and textures affect durability, maintenance, comfort and the visual character of a room.",
      example: "Flooring selection → Use + Durability + Maintenance",
      output: "Material selection should match the room's requirements.",
      question: "What should guide material selection?",
      answer: "Function, durability, safety, maintenance and design requirements.",
    },
    "Design styles": {
      explanation: "Interior styles describe recurring choices in furniture, materials, colours and decorative details.",
      example: "Minimalist style → Simple forms + Limited clutter",
      output: "The example illustrates a minimalist design approach.",
      question: "What is a design style?",
      answer: "A recognisable approach to a space's appearance and furnishings.",
    },
    "Create a room concept": {
      explanation: "A room concept combines a design goal, colour palette, materials, lighting and furniture ideas.",
      example: "Goal: Calm bedroom\nPalette: Soft neutrals\nLighting: Warm ambient light",
      output: "A basic concept to guide later design decisions.",
      question: "What is a room concept?",
      answer: "A coordinated design idea that guides the room's layout and appearance.",
    },
  },

  "3D Design Basics": {
    "Introduction to 3D design": {
      explanation: "3D design creates digital objects or spaces with width, height and depth.",
      example: "3D model → Geometry + Materials + Lighting",
      output: "These components contribute to a 3D scene.",
      question: "What is 3D design?",
      answer: "Creating digital objects or spaces in three dimensions.",
    },
    "2D vs 3D": {
      explanation: "2D objects use two dimensions, while 3D objects include depth as a third dimension.",
      example: "2D: Square\n3D: Cube",
      output: "A square is flat; a cube has volume.",
      question: "What is the main difference between 2D and 3D?",
      answer: "3D includes depth; 2D uses height and width only.",
    },
    "Shapes and modelling": {
      explanation: "3D modelling creates object geometry using basic shapes, vertices, edges and faces.",
      example: "Cube + Scale tool → Rectangular box",
      output: "Scaling a cube changes its dimensions.",
      question: "What is 3D modelling?",
      answer: "Creating and editing the geometry of a three-dimensional object.",
    },
    "Materials and textures": {
      explanation: "Materials define surface properties; textures add surface detail such as patterns or colour variation.",
      example: "Model + Wood material → Wood-like surface",
      output: "The model appears with a wood-like finish when correctly configured.",
      question: "What is a texture?",
      answer: "An image or procedural pattern used to add surface detail.",
    },
    "Lighting in 3D": {
      explanation: "3D lighting simulates illumination and influences shadows, depth and the appearance of materials.",
      example: "Scene + Light source + Shadows",
      output: "Lighting changes how objects appear in the scene.",
      question: "Why is lighting important in 3D?",
      answer: "It helps show shape, depth, materials and atmosphere.",
    },
    "Camera and views": {
      explanation: "A 3D camera determines the viewpoint and framing used to view or render a scene.",
      example: "Place camera → Set angle → Adjust framing",
      output: "The scene is viewed from the selected camera position.",
      question: "What does a 3D camera control?",
      answer: "The viewpoint, angle and framing of a scene.",
    },
    "Rendering basics": {
      explanation: "Rendering calculates an image from a 3D scene using geometry, materials, lighting and camera settings.",
      example: "Model + Materials + Lights + Camera → Render",
      output: "An image of the scene is generated.",
      question: "What is rendering?",
      answer: "Producing an image from a 3D scene.",
    },
    "Create a simple model": {
      explanation: "A beginner model can be created by adding a primitive shape, changing its dimensions and applying a material.",
      example: "Add cube → Scale → Apply material → Preview",
      output: "A simple customised 3D object.",
      question: "What is a primitive in 3D design?",
      answer: "A basic starting shape such as a cube, sphere or cylinder.",
    },
  },

  "Human Anatomy": {
    "Introduction to anatomy": {
      explanation: "Anatomy studies body structures and how organs and systems are arranged.",
      example: "Cells → Tissues → Organs → Organ systems",
      output: "A simplified hierarchy of biological organisation.",
      question: "What is anatomy?",
      answer: "The study of the structure of the body.",
    },
    "Skeletal system": {
      explanation: "The skeletal system supports the body, protects organs and works with muscles to enable movement.",
      example: "Skull → Protects the brain\nRib cage → Protects organs in the chest",
      output: "Different bones provide support and protection.",
      question: "Name two functions of the skeletal system.",
      answer: "Support and protection; bones also help movement and blood cell production.",
    },
    "Muscular system": {
      explanation: "Muscles produce movement, maintain posture and help move substances inside the body.",
      example: "Muscle contraction → Pulls on a bone through a tendon",
      output: "The movement depends on coordinated muscle action.",
      question: "What connects many muscles to bones?",
      answer: "Tendons connect muscles to bones.",
    },
    "Digestive system": {
      explanation: "The digestive system breaks food down, absorbs nutrients and eliminates undigested waste.",
      example: "Mouth → Oesophagus → Stomach → Small intestine",
      output: "Food travels through the digestive tract in this order.",
      question: "Where does most nutrient absorption occur?",
      answer: "In the small intestine.",
    },
    "Respiratory system": {
      explanation: "The respiratory system brings oxygen into the body and removes carbon dioxide through gas exchange.",
      example: "Nose/mouth → Airways → Lungs",
      output: "Air reaches the lungs through the respiratory passages.",
      question: "What is gas exchange?",
      answer: "The exchange of oxygen and carbon dioxide between the lungs and blood.",
    },
    "Circulatory system": {
      explanation: "The circulatory system moves blood through the heart and blood vessels to transport oxygen, nutrients and waste.",
      example: "Heart → Arteries → Capillaries → Veins",
      output: "Blood circulates through the body's blood vessels.",
      question: "What is the heart's main function?",
      answer: "To pump blood through the circulatory system.",
    },
    "Nervous system": {
      explanation: "The nervous system receives information, processes it and coordinates responses throughout the body.",
      example: "Stimulus → Sensory signal → Processing → Response",
      output: "The body responds to information through coordinated nerve activity.",
      question: "What are the main parts of the central nervous system?",
      answer: "The brain and spinal cord.",
    },
    "Major organs revision": {
      explanation: "Major organs have specialised functions and work together to maintain body processes.",
      example: "Heart: pumps blood\nLungs: gas exchange\nKidneys: filter blood",
      output: "Each organ performs a different essential function.",
      question: "Which organs are primarily responsible for gas exchange?",
      answer: "The lungs.",
    },
  },

  Microbiology: {
    "Introduction to microbiology": {
      explanation: "Microbiology studies microscopic organisms and other microscopic biological agents.",
      example: "Bacteria + Fungi + Protozoa + Viruses",
      output: "These groups are studied in microbiology, though viruses are not cellular organisms.",
      question: "What is microbiology?",
      answer: "The study of microorganisms.",
    },
    Bacteria: {
      explanation: "Bacteria are single-celled organisms. Some are beneficial, while others can cause disease.",
      example: "Bacteria → Single-celled organism",
      output: "Bacteria have different shapes and characteristics.",
      question: "Are all bacteria harmful?",
      answer: "No. Many bacteria are harmless or beneficial; some can cause disease.",
    },
    Viruses: {
      explanation: "Viruses need host cells to reproduce and are structurally different from cellular organisms.",
      example: "Virus + Susceptible host cell → Replication may occur",
      output: "Viral replication depends on suitable host cells.",
      question: "Can viruses reproduce independently like many cells?",
      answer: "No. Viruses depend on host cells for replication.",
    },
    Fungi: {
      explanation: "Fungi include yeasts, moulds and mushrooms. Some are useful, while others cause infections or spoil food.",
      example: "Yeast → Used in bread making",
      output: "Yeast helps dough rise through fermentation.",
      question: "Give one useful application of fungi.",
      answer: "Yeast is used in baking and fermentation.",
    },
    Protozoa: {
      explanation: "Protozoa are a diverse group of mostly single-celled eukaryotic organisms, some of which cause disease.",
      example: "Protozoa → Eukaryotic microorganisms",
      output: "They have cells with a nucleus.",
      question: "What is one feature of protozoa?",
      answer: "They are eukaryotic organisms, generally single-celled.",
    },
    "Microorganisms and disease": {
      explanation: "Some microorganisms can cause infectious diseases, while others are part of normal environments or microbiomes.",
      example: "Pathogen exposure → Possible infection → Host response",
      output: "Infection depends on factors such as the organism, exposure and host.",
      question: "What is a pathogen?",
      answer: "An organism or agent capable of causing disease.",
    },
    "Sterilisation and disinfection": {
      explanation: "Sterilisation eliminates all forms of microbial life; disinfection reduces or inactivates many harmful microorganisms on objects.",
      example: "Choose method → Follow validated procedure → Verify as required",
      output: "The correct process depends on the item and intended use.",
      question: "How does sterilisation differ from disinfection?",
      answer: "Sterilisation eliminates all microbial life; disinfection reduces or inactivates specified microorganisms.",
    },
    "Laboratory safety": {
      explanation: "Laboratory safety uses training, appropriate protective equipment, hygiene and approved procedures to reduce risks.",
      example: "Wear required PPE → Label samples → Dispose of waste correctly",
      output: "A basic laboratory safety routine.",
      question: "Why label laboratory samples?",
      answer: "To identify samples correctly and reduce mix-ups.",
    },
  },

  "Medical Coding": {
    "Introduction to medical coding": {
      explanation: "Medical coding translates documented healthcare diagnoses, procedures and services into standard codes.",
      example: "Clinical documentation → Review guidelines → Assign code",
      output: "A code is selected based on the documented information and applicable rules.",
      question: "What is medical coding?",
      answer: "Assigning standard codes to documented diagnoses, procedures and services.",
    },
    "Medical terminology": {
      explanation: "Medical terminology uses standard word parts to describe body structures, conditions and procedures.",
      example: "Cardio = Heart\n-itis = Inflammation",
      output: "Carditis refers to inflammation of the heart, though the exact term depends on context.",
      question: "What does the suffix -itis generally mean?",
      answer: "Inflammation.",
    },
    "Anatomy for coding": {
      explanation: "Anatomy knowledge helps coders understand the body site and structure described in clinical documentation.",
      example: "Documentation: right knee → Identify the documented anatomical site",
      output: "The site is the right knee; code assignment still requires full documentation and guidelines.",
      question: "Why is anatomy important in coding?",
      answer: "It helps interpret body sites and clinical descriptions accurately.",
    },
    "ICD-10-CM basics": {
      explanation: "ICD-10-CM is a diagnosis classification system used in the United States. Coders must consult the current official guidelines.",
      example: "Diagnosis documentation → Alphabetic Index → Tabular List verification",
      output: "A candidate code must be verified against the official resources.",
      question: "What is ICD-10-CM used for?",
      answer: "Classifying diagnoses and health conditions in the United States.",
    },
    "CPT basics": {
      explanation: "CPT is a code set used in the United States to describe many medical procedures and professional services.",
      example: "Procedure documentation → Check CPT guidelines → Verify code",
      output: "The code depends on the service documentation and applicable rules.",
      question: "What does CPT describe?",
      answer: "Medical procedures and professional services within its coding scope.",
    },
    "Reading medical records": {
      explanation: "Coders review clinical notes for diagnoses, procedures, dates and supporting documentation.",
      example: "Read note → Identify documented condition → Check supporting details",
      output: "A documentation summary ready for code research.",
      question: "Why must coders review documentation carefully?",
      answer: "Codes must be supported by the medical record and coding guidelines.",
    },
    "Coding accuracy and compliance": {
      explanation: "Accurate coding follows documentation, official guidelines, confidentiality requirements and applicable regulations.",
      example: "Review documentation → Verify code → Check compliance",
      output: "A structured review reduces coding errors.",
      question: "Can a coder choose a code only because it pays more?",
      answer: "No. Code assignment must be supported by documentation and applicable coding rules.",
    },
    "Practice coding scenarios": {
      explanation: "Practice scenarios help learners apply code-selection rules to fictional documentation.",
      example: "Read a fictional case → Identify key terms → Consult official coding resources",
      output: "A reasoned coding choice after checking the applicable rules.",
      question: "What should you do if documentation is unclear?",
      answer: "Follow applicable policies and query the provider when permitted and necessary; do not guess.",
    },
  },

  "First Aid Education": {
    "Introduction to first aid": {
      explanation: "First aid is immediate assistance provided while arranging appropriate professional medical care.",
      example: "Check scene safety → Assess responsiveness → Get help",
      output: "A basic first-aid response sequence.",
      question: "What is first aid?",
      answer: "Immediate assistance given before professional medical care.",
    },
    "Emergency assessment": {
      explanation: "An emergency assessment begins with scene safety and checking whether the person needs urgent assistance.",
      example: "Safe scene → Check response and breathing → Call emergency services as needed",
      output: "An initial assessment that guides the next safe action.",
      question: "What comes first in an emergency?",
      answer: "Check that the scene is safe before approaching.",
    },
    "Calling emergency services": {
      explanation: "Give the emergency dispatcher the location, nature of the incident, number of people involved and known hazards.",
      example: "Location + What happened + Condition + Hazards",
      output: "The dispatcher receives key information to coordinate assistance.",
      question: "What information should you provide when calling for help?",
      answer: "Exact location, incident details, the person's condition and any immediate hazards.",
    },
    "Bleeding awareness": {
      explanation: "Severe bleeding can be life-threatening. Call emergency services and follow dispatcher instructions and recognised first-aid training.",
      example: "Severe bleeding → Call emergency services → Apply firm direct pressure if appropriate",
      output: "Prompt action can help control bleeding while assistance is on the way.",
      question: "What should you do for severe bleeding?",
      answer: "Call emergency services and apply firm direct pressure if safe and appropriate; follow trained guidance.",
    },
    "Burn safety": {
      explanation: "For a thermal burn, remove the heat source and cool the burn with cool running water. Seek medical help for serious burns.",
      example: "Stop burning process → Cool with running water → Cover loosely with a clean dressing",
      output: "Basic first-aid steps; urgent assessment may be required for severe burns.",
      question: "Should ice be applied directly to a burn?",
      answer: "No. Use cool running water and seek medical help when indicated.",
    },
    "Choking emergencies": {
      explanation: "Choking can block breathing. Actions depend on the person's age and whether they can cough or breathe; follow local first-aid guidance.",
      example: "Assess ability to cough or speak → Call for help if severe → Follow trained choking response",
      output: "The response depends on the person's condition and applicable guidance.",
      question: "What should you do if someone has severe choking?",
      answer: "Call emergency services and follow recognised first-aid guidance for the person's age and condition.",
    },
    "CPR awareness": {
      explanation: "CPR is an emergency technique used when someone is unresponsive and not breathing normally. Call emergency services and follow dispatcher instructions.",
      example: "Unresponsive + Not breathing normally → Call emergency services → Start CPR if indicated",
      output: "Prompt emergency action may improve the chance of survival.",
      question: "When may CPR be needed?",
      answer: "When a person is unresponsive and not breathing normally, following emergency guidance.",
    },
    "First aid kit basics": {
      explanation: "A first-aid kit contains suitable supplies for basic care, and it should be checked and replenished regularly.",
      example: "Dressings + Gloves + Gauze + Tape + Scissors",
      output: "A basic set of supplies; the kit should match likely needs and local guidance.",
      question: "Why check a first-aid kit regularly?",
      answer: "To replace used or expired supplies and ensure items are ready when needed.",
    },
  },

  "Interview Practice": {
    "Interview introduction": {
      explanation: "Start an interview politely, greet the interviewer and give a brief professional introduction when invited.",
      example: "Good morning. Thank you for giving me this opportunity.",
      output: "A polite, professional opening.",
      question: "How can you start an interview?",
      answer: "Greet the interviewer politely and thank them for the opportunity.",
    },
    "Tell me about yourself": {
      explanation: "Give a short summary of your background, relevant skills, projects and career goal.",
      example: "I am a motivated fresher learning web development. I have practised HTML, CSS and JavaScript through projects, and I am looking for an opportunity to grow as a developer.",
      output: "A focused introduction connecting skills and career goals.",
      question: "What should your self-introduction include?",
      answer: "Relevant education or background, skills, projects and career direction.",
    },
    "Strengths and weaknesses": {
      explanation: "Choose genuine strengths relevant to the role and a real area for improvement with a plan to develop it.",
      example: "Strength: I practise consistently. Improvement area: I am working on speaking more confidently in meetings.",
      output: "A balanced answer with a practical improvement plan.",
      question: "How should you discuss a weakness?",
      answer: "Be honest, choose a work-appropriate area and explain what you are doing to improve.",
    },
    "Common HR questions": {
      explanation: "HR questions explore motivation, teamwork, adaptability and suitability for a role.",
      example: "Question: Why do you want this role?\nAnswer: Explain how the role matches your skills and learning goals.",
      output: "An answer connected to the role and the employer.",
      question: "How do you answer why you want a job?",
      answer: "Connect the job responsibilities to your skills, interests and career goals.",
    },
    "Technical interview basics": {
      explanation: "Technical interviews assess understanding, problem-solving and the ability to explain decisions.",
      example: "Clarify the problem → Explain your approach → Solve → Test",
      output: "A structured way to explain a technical solution.",
      question: "What should you do when you do not know an answer?",
      answer: "Be honest, explain what you do know and describe how you would find the answer.",
    },
    "Body language": {
      explanation: "Professional body language includes attentive posture, appropriate eye contact and calm, respectful gestures.",
      example: "Listen carefully → Sit comfortably upright → Avoid distracting movements",
      output: "A more attentive and professional impression.",
      question: "Why does body language matter?",
      answer: "It can help communicate attentiveness, confidence and respect.",
    },
    "Mock interview practice": {
      explanation: "A mock interview simulates an interview so you can practise answers and identify areas to improve.",
      example: "Ask a question → Answer aloud → Review clarity → Practise again",
      output: "A repeatable interview-practice routine.",
      question: "What is the benefit of a mock interview?",
      answer: "It builds familiarity, improves answer structure and identifies areas for improvement.",
    },
    "Interview follow-up": {
      explanation: "A short follow-up message can thank the interviewer and restate your interest in the role.",
      example: "Thank you for your time today. I appreciated learning about the role and remain interested in the opportunity.",
      output: "A polite follow-up message.",
      question: "What should an interview follow-up message do?",
      answer: "Thank the interviewer, refer to the discussion briefly and express continued interest.",
    },
  },

  "Spoken English": {
    "Daily-use English": {
      explanation: "Daily-use English focuses on short phrases used in everyday situations.",
      example: "Could you please help me?\nThank you for your help.",
      output: "Polite phrases for requesting help and expressing gratitude.",
      question: "How can you politely ask for help?",
      answer: "You can say, 'Could you please help me?'",
    },
    "Basic sentence formation": {
      explanation: "A basic English sentence often follows Subject + Verb + Object, although other sentence patterns are also common.",
      example: "I read a book.\nSubject: I\nVerb: read\nObject: a book",
      output: "A complete sentence with subject, verb and object.",
      question: "Identify the verb in 'She writes notes.'",
      answer: "Writes is the verb.",
    },
    "Present tense": {
      explanation: "Present-tense forms can describe routines, facts and current situations, depending on the form used.",
      example: "I study every day.\nShe studies every day.",
      output: "The verb changes to studies with she in the simple present.",
      question: "Which sentence is correct: 'She study' or 'She studies'?",
      answer: "'She studies' is correct in the simple present.",
    },
    "Past and future tense": {
      explanation: "Past forms describe earlier events; future forms can describe expected or planned events.",
      example: "Past: I studied yesterday.\nFuture: I will study tomorrow.",
      output: "The sentences refer to past and future time.",
      question: "How do you express a simple future action with will?",
      answer: "Use will + base verb, such as 'I will learn.'",
    },
    "Asking questions": {
      explanation: "Questions commonly use question words or auxiliary verbs in a suitable word order.",
      example: "Where do you live?\nDo you speak English?",
      output: "Two correctly formed questions.",
      question: "How do you ask about someone's name?",
      answer: "You can ask, 'What is your name?'",
    },
    "Workplace conversations": {
      explanation: "Workplace English uses clear, polite language to ask questions, share updates and clarify tasks.",
      example: "Could you please explain this task?\nI will share an update by this afternoon.",
      output: "Polite phrases for clarifying and updating work.",
      question: "How can you ask for clarification politely?",
      answer: "Say, 'Could you please explain that again?'",
    },
    "Pronunciation practice": {
      explanation: "Pronunciation practice improves clarity by working on sounds, word stress, rhythm and listening.",
      example: "Listen to a short sentence → Repeat slowly → Record yourself → Compare",
      output: "A practice cycle for identifying pronunciation improvements.",
      question: "How can you practise pronunciation?",
      answer: "Listen, repeat, record yourself and compare with a reliable model.",
    },
    "Speaking activities": {
      explanation: "Speaking activities develop fluency through short talks, role-play, question-and-answer and describing objects.",
      example: "Speak for one minute about your daily routine.",
      output: "A short speaking exercise using familiar vocabulary.",
      question: "What is one way to improve speaking fluency?",
      answer: "Practise speaking regularly on familiar topics and gradually expand vocabulary.",
    },
  },

  "Resume & Workplace Skills": {
    "Resume introduction": {
      explanation: "A resume summarises relevant education, skills, projects, experience and certifications for a job.",
      example: "Name + Contact + Summary + Skills + Education + Projects",
      output: "A basic resume structure.",
      question: "What is the purpose of a resume?",
      answer: "To present relevant qualifications and experience to an employer.",
    },
    "Write a career objective": {
      explanation: "A career objective briefly describes the role you seek and the relevant skills or goals you bring.",
      example: "Seeking a fresher frontend developer role where I can apply my HTML, CSS and JavaScript skills while learning from a development team.",
      output: "A concise objective tailored to a target role.",
      question: "What makes a career objective effective?",
      answer: "It is concise, relevant to the role and honest about your skills and goals.",
    },
    "Present technical skills": {
      explanation: "List technical skills clearly and honestly, prioritising those relevant to the job description.",
      example: "Frontend: HTML, CSS, JavaScript, React\nTools: Git, GitHub, VS Code",
      output: "Skills grouped into easy-to-scan categories.",
      question: "Should you list a skill you cannot explain?",
      answer: "No. List skills you can discuss honestly and practise those you are still learning.",
    },
    "Describe projects": {
      explanation: "Project descriptions should explain what you built, which tools you used and what your contribution was.",
      example: "Food delivery app — Built reusable screens with React Native and Expo.",
      output: "A project entry that shows the work and technologies involved.",
      question: "What should a project description include?",
      answer: "Project goal, your contribution, technologies and meaningful results where available.",
    },
    "Email writing": {
      explanation: "Professional emails use a clear subject, polite greeting, concise message and suitable closing.",
      example: "Subject: Application for Frontend Developer\nDear Hiring Team,\nPlease find my resume attached.\nRegards,\nAsmi",
      output: "A short professional application email.",
      question: "Why should an email have a clear subject?",
      answer: "It helps the recipient understand the purpose quickly.",
    },
    "Teamwork and communication": {
      explanation: "Teamwork requires listening, sharing updates, respecting others and resolving disagreements constructively.",
      example: "Clarify the goal → Divide tasks → Share progress → Review together",
      output: "A simple collaborative workflow.",
      question: "What is effective teamwork?",
      answer: "Working together toward a shared goal through communication and responsibility.",
    },
    "Time management": {
      explanation: "Time management involves prioritising tasks, estimating effort and reviewing progress.",
      example: "List tasks → Set priorities → Schedule work → Review progress",
      output: "A basic plan for organising the day.",
      question: "How can you prioritise tasks?",
      answer: "Consider deadlines, importance, dependencies and the effort required.",
    },
    "Prepare a job application": {
      explanation: "A job application should be tailored to the role and include accurate details and the requested documents.",
      example: "Check job requirements → Tailor resume → Write email → Verify attachments",
      output: "A checked application ready to submit.",
      question: "What should you check before sending an application?",
      answer: "Correct contact details, relevant resume content, requested documents and spelling.",
    },
  },
};

function getLesson(topic: Topic, lessonTitle: string): Lesson {
  const topicDetails = DETAILS[topic.title] ?? MORE_DETAILS[topic.title];
  const details = topicDetails?.[lessonTitle];

  if (details) {
    return { title: lessonTitle, ...details };
  }

  return {
    title: lessonTitle,
    explanation: `${lessonTitle} is part of ${topic.title}. ${topic.description}`,
    example: topic.example,
    output: topic.output,
    question: topic.question,
    answer: topic.answer,
  };
}

export default function SkillHubScreen() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return CATEGORIES;

    return CATEGORIES.map((category) => ({
      ...category,
      topics: category.topics.filter(
        (topic) =>
          category.title.toLowerCase().includes(query) ||
          topic.title.toLowerCase().includes(query) ||
          topic.description.toLowerCase().includes(query) ||
          topic.lessons.some((lesson) => lesson.toLowerCase().includes(query))
      ),
    })).filter(
      (category) =>
        category.title.toLowerCase().includes(query) ||
        category.topics.length > 0
    );
  }, [search]);

  const goHome = () => {
    setSelectedCategory(null);
    setSelectedTopic(null);
    setSelectedLesson(null);
    setShowAnswer(false);
  };

  const goBack = () => {
    if (selectedLesson) {
      setSelectedLesson(null);
      setShowAnswer(false);
    } else if (selectedTopic) {
      setSelectedTopic(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      router.back();
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={goBack} style={styles.backButton}>
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      <Text style={styles.brand}>VETRIX</Text>
      <Text style={styles.heading}>Skill Discovery Hub</Text>
      <Text style={styles.subtitle}>
        Learn step by step. Practise with examples. Grow your skills.
      </Text>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search categories, topics or lessons..."
        placeholderTextColor={COLORS.muted}
        style={styles.search}
      />
    </View>
  );

  const renderLesson = () => {
    if (!selectedTopic || !selectedLesson) return null;

    const lesson = getLesson(selectedTopic, selectedLesson);
    const currentIndex = selectedTopic.lessons.indexOf(selectedLesson);
    const hasNext = currentIndex < selectedTopic.lessons.length - 1;

    return (
      <View style={styles.lessonContainer}>
        <View style={styles.lessonBanner}>
          <Text style={styles.eyebrow}>YOUR LEARNING SPACE</Text>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.bodyText}>{lesson.explanation}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📘 Simple explanation</Text>
          <Text style={styles.bodyText}>{lesson.explanation}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>💡 Example</Text>
          <View style={styles.codeBox}>
            <Text selectable style={styles.codeText}>{lesson.example}</Text>
          </View>
          <Text style={styles.outputLabel}>Expected output / result</Text>
          <View style={styles.outputBox}>
            <Text selectable style={styles.outputText}>{lesson.output}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>❓ Knowledge check</Text>
          <Text style={styles.question}>{lesson.question}</Text>

          <TouchableOpacity
            style={styles.answerButton}
            onPress={() => setShowAnswer((previous) => !previous)}
          >
            <Text style={styles.answerButtonText}>
              {showAnswer ? "Hide answer ▲" : "Show answer ▼"}
            </Text>
          </TouchableOpacity>

          {showAnswer && (
            <View style={styles.answerBox}>
              <Text style={styles.answerText}>{lesson.answer}</Text>
            </View>
          )}
        </View>

        {(selectedTopic.title === "First Aid Education" ||
          selectedTopic.title === "Human Anatomy" ||
          selectedTopic.title === "Medical Coding") && (
          <View style={styles.noticeBox}>
            <Text style={styles.noticeTitle}>Educational reminder</Text>
            <Text style={styles.noticeText}>
              This content is for learning only. Medical coding must follow
              current official guidelines and documentation. For medical
              emergencies, contact local emergency services and follow
              qualified professionals' instructions.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            if (hasNext) {
              setSelectedLesson(selectedTopic.lessons[currentIndex + 1]);
              setShowAnswer(false);
            } else {
              setSelectedLesson(null);
              setShowAnswer(false);
            }
          }}
        >
          <Text style={styles.primaryButtonText}>
            {hasNext ? "Next lesson →" : "Finish topic ✓"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {renderHeader()}

        {!selectedCategory && !selectedTopic && !selectedLesson && (
          <>
            <View style={styles.introCard}>
              <Text style={styles.eyebrow}>DISCOVER YOUR NEW SKILLS</Text>
              <Text style={styles.introTitle}>
                What do you want to learn today?
              </Text>
              <Text style={styles.bodyText}>
                Choose a learning area, open a topic and select a lesson to
                explore its explanation, example, result and question-answer.
              </Text>
            </View>

            {filteredCategories.map((category) => (
              <TouchableOpacity
                key={category.title}
                style={styles.categoryCard}
                onPress={() => {
                  setSelectedCategory(category);
                  setSelectedTopic(null);
                  setSelectedLesson(null);
                }}
              >
                <View style={[styles.iconCircle, { borderColor: category.color }]}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categoryDescription}>
                    {category.description}
                  </Text>
                  <Text style={[styles.linkText, { color: category.color }]}>
                    Explore topics →
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {filteredCategories.length === 0 && (
              <Text style={styles.emptyText}>
                No matching topics found. Try another search.
              </Text>
            )}
          </>
        )}

        {selectedCategory && !selectedTopic && !selectedLesson && (
          <View>
            <Text style={styles.eyebrow}>SELECTED LEARNING AREA</Text>
            <Text style={styles.pageTitle}>
              {selectedCategory.icon} {selectedCategory.title}
            </Text>
            <Text style={styles.bodyText}>{selectedCategory.description}</Text>

            {selectedCategory.topics
              .filter((topic) => {
                const query = search.trim().toLowerCase();
                return (
                  !query ||
                  topic.title.toLowerCase().includes(query) ||
                  topic.lessons.some((lesson) =>
                    lesson.toLowerCase().includes(query)
                  )
                );
              })
              .map((topic) => (
                <TouchableOpacity
                  key={topic.title}
                  style={styles.topicCard}
                  onPress={() => {
                    setSelectedTopic(topic);
                    setSelectedLesson(null);
                  }}
                >
                  <Text style={styles.topicIcon}>{topic.icon}</Text>
                  <View style={styles.topicInfo}>
                    <Text style={styles.topicTitle}>{topic.title}</Text>
                    <Text style={styles.topicDescription}>{topic.description}</Text>
                    <Text style={styles.linkText}>
                      {topic.lessons.length} lessons · Start learning →
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        )}

        {selectedTopic && !selectedLesson && (
          <View>
            <Text style={styles.eyebrow}>LEARNING ACTIVITIES</Text>
            <Text style={styles.pageTitle}>
              {selectedTopic.icon} {selectedTopic.title}
            </Text>
            <Text style={styles.bodyText}>{selectedTopic.description}</Text>

            {selectedTopic.lessons.map((lesson, index) => (
              <TouchableOpacity
                key={lesson}
                style={styles.lessonRow}
                onPress={() => {
                  setSelectedLesson(lesson);
                  setShowAnswer(false);
                }}
              >
                <View style={styles.numberCircle}>
                  <Text style={styles.numberText}>{index + 1}</Text>
                </View>
                <View style={styles.lessonRowInfo}>
                  <Text style={styles.lessonRowTitle}>{lesson}</Text>
                  <Text style={styles.lessonRowSubtitle}>
                    Read explanation · Example · Q&A
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {renderLesson()}

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>VETRIX by Vetri Technology</Text>
          <Text style={styles.footerText}>Learn something useful every day.</Text>
          <TouchableOpacity onPress={goHome}>
            <Text style={styles.linkText}>← Back to all categories</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 18, paddingBottom: 40 },
  header: { marginBottom: 22 },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  backText: { color: COLORS.cyan, fontWeight: "700" },
  brand: {
    color: COLORS.cyan,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 4,
    marginBottom: 8,
  },
  heading: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  search: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 14,
  },
  introCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
  },
  eyebrow: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 10,
  },
  introTitle: {
    color: COLORS.white,
    fontSize: 23,
    lineHeight: 30,
    fontWeight: "900",
    marginBottom: 10,
  },
  bodyText: { color: COLORS.muted, fontSize: 14, lineHeight: 22 },
  categoryCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  categoryIcon: { fontSize: 25 },
  categoryInfo: { flex: 1 },
  categoryTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 7,
  },
  categoryDescription: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 9,
  },
  linkText: {
    color: COLORS.cyan,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 6,
  },
  pageTitle: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: "900",
    marginBottom: 10,
  },
  topicCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    padding: 15,
    marginTop: 12,
  },
  topicIcon: { fontSize: 27, marginRight: 13, marginTop: 2 },
  topicInfo: { flex: 1 },
  topicTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  topicDescription: { color: COLORS.muted, fontSize: 13, lineHeight: 20 },
  lessonRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    padding: 14,
    marginTop: 10,
  },
  numberCircle: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: COLORS.surface2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  numberText: { color: COLORS.cyan, fontWeight: "900" },
  lessonRowInfo: { flex: 1 },
  lessonRowTitle: { color: COLORS.white, fontSize: 14, fontWeight: "800" },
  lessonRowSubtitle: { color: COLORS.muted, fontSize: 11, marginTop: 5 },
  chevron: { color: COLORS.cyan, fontSize: 28, marginLeft: 8 },
  lessonContainer: { marginTop: 4 },
  lessonBanner: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.cyan,
    borderWidth: 1,
    borderRadius: 20,
    padding: 19,
    marginBottom: 14,
  },
  lessonTitle: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: "900",
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    padding: 17,
    marginBottom: 14,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 13,
  },
  codeBox: {
    backgroundColor: "#070D1B",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
  },
  codeText: {
    color: COLORS.cyan,
    fontSize: 13,
    lineHeight: 22,
    fontFamily: "monospace",
  },
  outputLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 8,
  },
  outputBox: {
    backgroundColor: "#0B201B",
    borderWidth: 1,
    borderColor: "#285B4A",
    borderRadius: 12,
    padding: 13,
  },
  outputText: {
    color: COLORS.green,
    fontSize: 13,
    lineHeight: 21,
    fontFamily: "monospace",
  },
  question: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 23,
    marginBottom: 12,
  },
  answerButton: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.purple,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  answerButtonText: { color: COLORS.white, fontWeight: "800", fontSize: 13 },
  answerBox: {
    marginTop: 13,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#182B2A",
    borderWidth: 1,
    borderColor: "#285B4A",
  },
  answerText: { color: COLORS.green, fontSize: 14, lineHeight: 22 },
  noticeBox: {
    padding: 15,
    borderRadius: 14,
    backgroundColor: "#2B2115",
    borderWidth: 1,
    borderColor: "#6D4B24",
    marginBottom: 14,
  },
  noticeTitle: {
    color: COLORS.orange,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 7,
  },
  noticeText: { color: COLORS.white, fontSize: 12, lineHeight: 20 },
  primaryButton: {
    backgroundColor: COLORS.cyan,
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
    marginTop: 2,
  },
  primaryButtonText: {
    color: COLORS.background,
    fontWeight: "900",
    fontSize: 15,
  },
  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
    padding: 25,
    lineHeight: 22,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 30,
    paddingTop: 20,
    alignItems: "center",
  },
  footerTitle: { color: COLORS.white, fontSize: 13, fontWeight: "900" },
  footerText: { color: COLORS.muted, fontSize: 12, marginTop: 7 },
});
