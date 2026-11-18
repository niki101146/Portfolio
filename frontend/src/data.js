// Fallback content, shown instantly and if the API is offline. Django admin overrides it.
export const profile = {
  name: "Shoba Niki J",
  role: "Full Stack Developer",
  intro: "I build clean, user-friendly web applications with Django and React, and turn ideas into working products.",
  email: "nikildanniki@gmail.com",
  phone: "+91 7845877124",
  github: "https://github.com/niki101146",
  linkedin: "https://www.linkedin.com/in/shoba-niki-j-5ba4352b2/",
};
export const fallback = {
  skills: [
    ["Frontend", "HTML, CSS, JavaScript, Bootstrap, React"],
    ["Backend", "Python, Django, C++, C"],
    ["Database", "PostgreSQL, MySQL, SQLite"],
    ["Tools", "VS Code, Jupyter Notebook, PyCharm, GitHub"],
    ["AI tools", "Claude, Codex"],
    ["Strengths", "Data handling, Teamwork, Time management, Adaptability"],
  ].flatMap(([group, list]) => list.split(", ").map((name) => ({ group, name }))),
  projects: [
    { id: 1, title: "Explore South", tag: "AI travel planner · Python Django",
      summary: "A full-stack travel guide and trip planner for South India covering Tamil Nadu, Kerala, Karnataka, Andhra Pradesh and Telangana.",
      highlights: ["AI Planner that builds day-wise itineraries and budget estimates.",
        "Season prediction scores every destination by weather, rain, crowds and prices for the month you pick.",
        "Travel assistant chatbot (text and voice) that answers when to visit, where to go and what a trip will cost.",
        "Destination guides with entry fees, timings, favorites, saved trips and user login."],
      stack: ["Python", "Django", "JavaScript", "HTML", "CSS", "AI chatbot", "Vercel"], github_url: "", live_url: "https://explore-south.vercel.app",
      note: "Hosted on Vercel: the first load and images can take 20 to 30 seconds. Please wait for them to appear.",
      image: "/screens/explore-south.png" },
    { id: 2, title: "Niki Jewels", tag: "Jewellery e-commerce · Python Django",
      summary: "An elegant jewellery e-commerce store with a luxury dark theme, collections and a smooth shopping flow.",
      highlights: ["Product search, collections, wishlist, cart and user account.",
        "Filters for sort order, material and category (pendants, bangles, chains and more) with an Apply button.",
        "Wishlist hearts with a live count badge on every product card.",
        "Light and dark theme toggle with a gold-and-black premium look.",
        "Django MVT architecture with ORM-backed carts, checkout and order history."],
      stack: ["Python", "Django", "HTML", "CSS", "JavaScript", "Render"], github_url: "", live_url: "https://niki-jewels.onrender.com",
      note: "Hosted on Render's free plan: the first visit can take up to a minute while the server wakes up. Please wait and refresh once.",
      image: "/screens/niki-jewels.png" },
    { id: 3, title: "Hospital Management System", tag: "Healthcare web app · Python Django",
      summary: "City Hospital: a patient-facing hospital website and management system for booking appointments and finding doctors.",
      highlights: ["Online appointment booking, patient login and find-a-doctor search by name, speciality or department.",
        "Built-in help chatbot (Ask us) that answers visitors' questions about the hospital.",
        "Departments for Emergency, OPD, Pharmacy, Laboratory, Radiology and ICU, with doctor profiles.",
        "Emergency and reception contact numbers and 24/7 availability shown on every page.",
        "Django backend with database-backed patient, doctor and appointment records."],
      stack: ["Python", "Django", "HTML", "CSS", "JavaScript", "Chatbot", "Render"], github_url: "", live_url: "https://hospital-management-vxl5.onrender.com/",
      note: "Hosted on Render's free plan: the first visit can take up to a minute while the server wakes up. Please wait and refresh once.",
      image: "/screens/hospital-management.png" },
  ],
  education: [
    { title: "Bachelor's in Computer Application", institution: "St.John's College of Arts & Science", period: "2023–2026" },
    { title: "Higher Secondary Certificate (HSC), 83%", institution: "St.Mary's Higher Secondary School", period: "2021–2023" },
    { title: "Secondary School Leaving Certificate (SSLC)", institution: "St.Michael's High School", period: "2020–2021" },
  ],
};

// Edit these freely: bar levels are your own honest self-rating (0–100).
export const expertise = [
  ["Python and Django", 85], ["HTML and CSS", 90], ["JavaScript", 75],
  ["React", 70], ["PostgreSQL and SQL", 72], ["Git and GitHub", 78],
];
export const services = [
  ["Backend development", "Django apps with clean models, views and REST APIs."],
  ["Responsive interfaces", "Mobile-first pages built with React, CSS and Bootstrap."],
  ["Database design", "Relational schemas in PostgreSQL, MySQL and SQLite."],
  ["Booking and e-commerce", "Reservations, carts, checkout and order history that stay in sync."],
  ["Admin dashboards", "Dashboards so owners can manage their own content and images."],
  ["AI-assisted development", "Claude and Codex help me plan, write and review code faster. I test and own every line."],
];
export const process = [
  ["Understand", "Clarify the goal, users and must-have features."],
  ["Design", "Sketch screens and plan the data models."],
  ["Build", "Write the Django API and the React interface."],
  ["Test", "Check every flow on phone and desktop."],
  ["Launch", "Deploy, then keep improving."],
];

// Gallery: add more screenshots to public/screens and list them here.
export const gallery = [
  { src: "/screens/niki-jewels.png", project: "Niki Jewels", caption: "Storefront home with search, wishlist and cart" },
  { src: "/screens/hospital-management.png", project: "Hospital Management", caption: "City Hospital home with appointment booking" },
];
