"""
generate_dataset_v3.py
======================
Complete dataset generator covering all 3 real-world flows:

  FLOW 1 — AUTO SELECT + GENERATE
    User submits profile data → model reads it → model picks best template
    → model generates all content for that template's placeholders.
    Training task: "generate_portfolio" (no template_id given)

  FLOW 2 — USER SWITCHES TEMPLATE
    User is already on a template → manually picks a different one
    → model gets the new template's placeholder list + existing content
    → model remaps/regenerates for the new template.
    Training task: "switch_template" (new template_id given by user)

  FLOW 3 — DIRECT GENERATE FOR KNOWN TEMPLATE
    Backend already knows which template to use (e.g. user picked at signup)
    → model gets user data + template_id → fills placeholders directly.
    Training task: "generate_for_template" (template_id given upfront)

Why 3 separate flows?
  The model needs to see all 3 as distinct tasks so it knows:
  - When to SELECT a template (Flow 1)
  - When to REUSE + REMAP existing content (Flow 2)
  - When to just FILL a given template (Flow 3)
"""

import json, random
from pathlib import Path
from copy import deepcopy


# ══════════════════════════════════════════════════════════════════════
# TEMPLATE REGISTRY
# Single source of truth. Add all your real templates here.
# Each template has:
#   category     — primary user type it suits
#   also_suits   — other user types it works for
#   description  — plain English, used by model for selection reasoning
#   placeholders — dict of section → list of placeholder keys
# ══════════════════════════════════════════════════════════════════════

TEMPLATE_REGISTRY = {

    "developer_modern": {
        "category":   "developer",
        "also_suits": ["fullstack", "backend", "frontend"],
        "description": "Dark theme, code-editor aesthetic. Terminal-inspired design. Best for backend and full-stack developers with strong technical skills. Shows skills in categorized groups.",
        "placeholders": {
            "hero":      ["{{name}}", "{{title}}", "{{hero_headline}}", "{{hero_subheadline}}", "{{cta_primary}}", "{{cta_secondary}}"],
            "about":     ["{{about_bio}}", "{{tagline}}"],
            "skills":    ["{{skills_frontend}}", "{{skills_backend}}", "{{skills_tools}}"],
            "projects":  ["{{project_1_title}}", "{{project_1_desc}}", "{{project_1_tech}}", "{{project_1_link}}",
                          "{{project_2_title}}", "{{project_2_desc}}", "{{project_2_tech}}"],
            "contact":   ["{{contact_headline}}", "{{contact_message}}", "{{email}}", "{{github_url}}", "{{linkedin_url}}"],
        }
    },

    "developer_minimal": {
        "category":   "developer",
        "also_suits": ["student", "junior"],
        "description": "Clean white layout, minimal decoration. Focuses on experience timeline and skills list. Best for developers who want professional simplicity over visual flair.",
        "placeholders": {
            "hero":       ["{{name}}", "{{title}}", "{{hero_headline}}", "{{cta_primary}}"],
            "about":      ["{{about_bio}}"],
            "skills":     ["{{skills_list}}"],
            "experience": ["{{exp_1_company}}", "{{exp_1_role}}", "{{exp_1_duration}}", "{{exp_1_desc}}",
                           "{{exp_2_company}}", "{{exp_2_role}}", "{{exp_2_duration}}", "{{exp_2_desc}}"],
            "contact":    ["{{email}}", "{{linkedin_url}}"],
        }
    },

    "developer_timeline": {
        "category":   "developer",
        "also_suits": ["senior", "lead"],
        "description": "Career journey focused layout with visual timeline and stats counter. Best for experienced developers (5+ years) who want to showcase their career progression and achievements.",
        "placeholders": {
            "hero":      ["{{name}}", "{{title}}", "{{hero_headline}}", "{{hero_subheadline}}", "{{cta_primary}}"],
            "stats":     ["{{stat_1_number}}", "{{stat_1_label}}", "{{stat_2_number}}", "{{stat_2_label}}", "{{stat_3_number}}", "{{stat_3_label}}"],
            "timeline":  ["{{timeline_1_year}}", "{{timeline_1_title}}", "{{timeline_1_desc}}",
                          "{{timeline_2_year}}", "{{timeline_2_title}}", "{{timeline_2_desc}}",
                          "{{timeline_3_year}}", "{{timeline_3_title}}", "{{timeline_3_desc}}"],
            "skills":    ["{{skills_frontend}}", "{{skills_backend}}"],
            "contact":   ["{{contact_headline}}", "{{email}}", "{{github_url}}"],
        }
    },

    "designer_visual": {
        "category":   "designer",
        "also_suits": ["ux", "ui", "creative"],
        "description": "Large image grid, visual-first layout. Showcases project visuals prominently. Best for UX/UI and visual designers whose work speaks through images.",
        "placeholders": {
            "hero":     ["{{name}}", "{{title}}", "{{hero_headline}}", "{{hero_subheadline}}", "{{cta_primary}}"],
            "about":    ["{{about_bio}}", "{{design_philosophy}}"],
            "projects": ["{{project_1_title}}", "{{project_1_desc}}", "{{project_1_impact}}",
                         "{{project_2_title}}", "{{project_2_desc}}", "{{project_2_impact}}",
                         "{{project_3_title}}", "{{project_3_desc}}", "{{project_3_impact}}"],
            "skills":   ["{{tools_list}}", "{{process_list}}"],
            "contact":  ["{{contact_headline}}", "{{contact_message}}", "{{email}}", "{{dribbble_url}}", "{{behance_url}}"],
        }
    },

    "freelancer_service": {
        "category":   "freelancer",
        "also_suits": ["consultant", "independent"],
        "description": "Service-package layout with pricing cards and testimonials section. Best for freelancers who want to clearly communicate what they offer and convert visitors into clients.",
        "placeholders": {
            "hero":          ["{{name}}", "{{title}}", "{{hero_headline}}", "{{hero_subheadline}}", "{{cta_primary}}"],
            "services":      ["{{service_1_title}}", "{{service_1_desc}}", "{{service_1_price}}",
                              "{{service_2_title}}", "{{service_2_desc}}", "{{service_2_price}}",
                              "{{service_3_title}}", "{{service_3_desc}}", "{{service_3_price}}"],
            "about":         ["{{about_bio}}", "{{availability}}"],
            "testimonials":  ["{{testimonial_1_text}}", "{{testimonial_1_name}}", "{{testimonial_1_company}}",
                              "{{testimonial_2_text}}", "{{testimonial_2_name}}", "{{testimonial_2_company}}"],
            "contact":       ["{{contact_headline}}", "{{contact_message}}", "{{email}}", "{{calendly_url}}"],
        }
    },

    "student_minimal": {
        "category":   "student",
        "also_suits": ["graduate", "junior", "fresher"],
        "description": "Clean simple layout emphasizing education, skills, and projects. No experience section required. Best for students, fresh graduates, or career switchers with limited work history.",
        "placeholders": {
            "hero":      ["{{name}}", "{{title}}", "{{hero_headline}}", "{{cta_primary}}"],
            "about":     ["{{about_bio}}"],
            "education": ["{{university}}", "{{degree}}", "{{graduation_year}}", "{{gpa}}"],
            "skills":    ["{{skills_list}}"],
            "projects":  ["{{project_1_title}}", "{{project_1_desc}}", "{{project_1_tech}}",
                          "{{project_2_title}}", "{{project_2_desc}}", "{{project_2_tech}}"],
            "contact":   ["{{email}}", "{{github_url}}", "{{linkedin_url}}"],
        }
    },

    "creator_portfolio": {
        "category":   "creator",
        "also_suits": ["educator", "blogger", "youtuber"],
        "description": "Content-creator layout featuring YouTube embed, blog post list, and subscriber stats. Best for developer educators, tech YouTubers, and technical writers.",
        "placeholders": {
            "hero":   ["{{name}}", "{{title}}", "{{hero_headline}}", "{{cta_primary}}", "{{youtube_url}}"],
            "about":  ["{{about_bio}}", "{{tagline}}"],
            "stats":  ["{{stat_1_number}}", "{{stat_1_label}}", "{{stat_2_number}}", "{{stat_2_label}}", "{{stat_3_number}}", "{{stat_3_label}}"],
            "blog":   ["{{blog_1_title}}", "{{blog_1_excerpt}}", "{{blog_1_url}}",
                       "{{blog_2_title}}", "{{blog_2_excerpt}}", "{{blog_2_url}}",
                       "{{blog_3_title}}", "{{blog_3_excerpt}}"],
            "contact":["{{contact_headline}}", "{{email}}", "{{youtube_url}}", "{{twitter_url}}"],
        }
    },
}


# ══════════════════════════════════════════════════════════════════════
# SELECTION RULES
# Used to generate the model's template-selection reasoning.
# The model must learn WHY a template was chosen, not just which one.
# ══════════════════════════════════════════════════════════════════════

def select_best_template(user: dict, available_templates: list) -> tuple[str, str]:
    """
    Rule-based template selector that returns (template_id, reasoning).
    This mirrors what the fine-tuned model will learn to do.
    """
    title  = user.get("title", "").lower()
    skills = user.get("skills", {})
    years  = user.get("years_experience", 0)
    has_exp         = len(user.get("experience", [])) > 0
    has_projects    = len(user.get("projects", [])) > 0
    has_testimonials= len(user.get("testimonials", [])) > 0
    has_education   = bool(user.get("education"))
    has_services    = bool(user.get("services"))
    has_blog        = bool(user.get("blog_posts") or user.get("articles"))
    has_stats       = bool(user.get("stats"))

    # Flatten skills
    if isinstance(skills, dict):
        all_skills = [s for group in skills.values() for s in (group if isinstance(group, list) else [group])]
    else:
        all_skills = skills if isinstance(skills, list) else []
    skills_str = " ".join(all_skills).lower()

    # ── Designer ─────────────────────────────────────────────────────
    if any(w in title for w in ["design", "ux", "ui", "visual", "brand", "motion", "creative"]):
        if "designer_visual" in available_templates:
            return "designer_visual", "User is a designer — selected visual-first layout that showcases design work through images."

    # ── Creator / educator ───────────────────────────────────────────
    if any(w in title for w in ["creator", "educator", "youtuber", "writer", "advocate", "blogger"]) or has_blog or has_stats:
        if "creator_portfolio" in available_templates:
            return "creator_portfolio", "User is a content creator with blog/video content — selected creator layout with stats and blog section."

    # ── Freelancer ───────────────────────────────────────────────────
    if any(w in title for w in ["freelance", "consultant", "independent"]) or has_services or has_testimonials:
        if "freelancer_service" in available_templates:
            return "freelancer_service", "User is a freelancer — selected service layout with pricing cards and testimonials to convert visitors."

    # ── Student / fresh graduate ─────────────────────────────────────
    if any(w in title for w in ["student", "graduate", "fresher", "aspiring"]) or (has_education and not has_exp):
        if "student_minimal" in available_templates:
            return "student_minimal", "User is a student with no work experience — selected minimal layout focused on education and projects."

    # ── Senior developer with long career ───────────────────────────
    if years >= 5 and has_exp and "developer_timeline" in available_templates:
        return "developer_timeline", f"User is a senior developer with {years} years experience — selected timeline layout to showcase career progression."

    # ── Default developer ────────────────────────────────────────────
    if "developer_modern" in available_templates:
        return "developer_modern", "User is a developer — selected modern dark-theme layout with categorized skills and project showcase."

    if "developer_minimal" in available_templates:
        return "developer_minimal", "Selected minimal developer layout as clean, professional default."

    # Absolute fallback
    chosen = available_templates[0]
    return chosen, f"Selected {chosen} as the best available match for this profile."


# ══════════════════════════════════════════════════════════════════════
# USER DATA POOLS
# ══════════════════════════════════════════════════════════════════════

NAMES = {
    "first": ["Alex","Sarah","James","Priya","Marcus","Elena","David","Aisha","Chris",
              "Yuki","Omar","Sofia","Nathan","Lin","Fatima","Ryan","Jessica","Mohammed",
              "Emma","Carlos","Zoe","Raj","Maya","Lucas","Amara","Kevin","Diana","Hassan",
              "Lena","Arjun","Mia","Felix","Nora","Ibrahim","Chloe","Diego","Yuna","Kai"],
    "last":  ["Chen","Johnson","Patel","Williams","Kim","Singh","Rodriguez","Mueller",
              "Tanaka","Okafor","Petrov","Martinez","Hassan","Wilson","Nguyen","Garcia",
              "Sharma","Dubois","Andersen","Kowalski","Nakamura","Ali","Reyes","Brown",
              "Schmidt","Yamamoto","Johansson","Ferreira","Nkosi","Ivanova"],
}

PROFILE_POOLS = {
    "developer": {
        "titles": ["Full Stack Developer","Frontend Developer","Backend Engineer",
                   "Software Engineer","React Developer","Node.js Developer",
                   "Python Developer","DevOps Engineer","Mobile Developer",
                   "Senior Software Engineer","Lead Developer","Cloud Engineer"],
        "skill_sets": [
            {"frontend":["React","TypeScript","Next.js"],    "backend":["Node.js","Express","MongoDB"],  "tools":["Docker","Git","AWS"]},
            {"frontend":["Vue.js","Nuxt.js","Tailwind CSS"], "backend":["Django","PostgreSQL","Redis"],  "tools":["Linux","Nginx","Celery"]},
            {"frontend":["Angular","RxJS","NgRx"],           "backend":["Spring Boot","MySQL","Kafka"],  "tools":["Kubernetes","Jenkins","Terraform"]},
            {"frontend":["React","GraphQL","Apollo"],        "backend":["FastAPI","MongoDB","Redis"],    "tools":["Vercel","GitHub Actions","Supabase"]},
            {"frontend":["Svelte","SvelteKit"],              "backend":["Go","gRPC","CockroachDB"],      "tools":["Docker","Prometheus","Grafana"]},
            {"frontend":["React Native","Expo"],             "backend":["Firebase","Node.js"],           "tools":["App Store","Play Store","Sentry"]},
        ],
        "companies": ["Google","Meta","Amazon","Stripe","Shopify","Airbnb","Uber","Netflix",
                      "Microsoft","Atlassian","GitHub","Vercel","Twilio","Cloudflare","Notion","Linear"],
        "certifications": ["AWS Certified Developer","Google Cloud Professional","Azure Developer Associate","Kubernetes CKAD"],
    },
    "designer": {
        "titles": ["UX Designer","UI Designer","Product Designer","UX/UI Designer",
                   "Brand Designer","Motion Designer","Visual Designer","Design Lead"],
        "skill_sets": [
            {"tools":["Figma","Adobe XD"],             "process":["User Research","Prototyping"],     "other":["Design Systems","Accessibility"]},
            {"tools":["Sketch","InVision","Zeplin"],   "process":["Usability Testing","Wireframing"], "other":["A/B Testing","Heuristics"]},
            {"tools":["Figma","Principle","Framer"],   "process":["Interaction Design"],              "other":["Component Libraries","Design Tokens"]},
            {"tools":["Illustrator","Photoshop","After Effects"], "process":["Brand Identity","Motion Design"], "other":["Typography","Illustration"]},
        ],
        "companies": ["Apple","Airbnb","Spotify","Pinterest","Canva","Adobe","Figma","IDEO","Dropbox","Intercom","Linear"],
        "awards": ["Awwwards Site of the Day","CSS Design Awards Winner","Webby Award Nominee","Red Dot Design Award"],
    },
    "freelancer": {
        "titles": ["Freelance Developer","Independent Consultant","Web Developer",
                   "Technical Consultant","Full Stack Freelancer","WordPress Expert","Webflow Developer"],
        "skill_sets": [
            {"frontend":["React","Next.js"],      "backend":["Node.js","MongoDB"],   "specialty":["E-commerce","Stripe","Shopify"]},
            {"frontend":["WordPress","Elementor"],"backend":["PHP","MySQL"],         "specialty":["SEO","WooCommerce","Performance"]},
            {"frontend":["Webflow","Framer"],     "backend":["Supabase","Airtable"], "specialty":["Landing Pages","CRO","Analytics"]},
        ],
        "hourly_rates": ["$45/hr","$75/hr","$95/hr","$120/hr","$60/hr","$150/hr"],
        "availability": ["Available for new projects","Open to new clients","Booking 2 weeks ahead","Currently available","Taking on limited projects"],
        "testimonials": [
            {"text":"Delivered our project 2 weeks early and it exceeded expectations.", "name":"Sarah M.","company":"TechStartup Inc."},
            {"text":"Best developer I have worked with. Clear communication and great code.", "name":"James K.","company":"E-Shop Co."},
            {"text":"Transformed our website. Conversions went up 60%.", "name":"Priya R.","company":"GrowthBrand"},
            {"text":"Incredibly talented and easy to work with. Will hire again.", "name":"Omar T.","company":"Digital Agency"},
            {"text":"Highly recommend. Delivered exactly what we needed on time.", "name":"Emma L.","company":"SaaS Corp"},
        ],
    },
    "student": {
        "titles": ["CS Student","Aspiring Developer","Software Engineering Student",
                   "Computer Science Graduate","ML Enthusiast","CS Fresher","Junior Developer"],
        "skill_sets": [
            {"primary":["Python","Java","C++"],         "secondary":["Data Structures","Algorithms","OOP"]},
            {"primary":["React","JavaScript","HTML"],   "secondary":["CSS","Git","REST APIs","Postman"]},
            {"primary":["Machine Learning","TensorFlow"],"secondary":["NumPy","Pandas","Scikit-learn","Jupyter"]},
        ],
        "universities": ["MIT","Stanford University","IIT Bombay","University of Toronto",
                         "TU Berlin","NUS Singapore","University of Melbourne","ETH Zurich","UCL","Georgia Tech"],
        "degrees": ["B.Sc Computer Science","B.Tech Software Engineering",
                    "M.Sc Artificial Intelligence","B.Eng Computer Engineering","B.Sc Data Science"],
        "gpas": ["3.9/4.0","3.7/4.0","8.5/10","First Class Honours","Distinction","3.85/4.0"],
        "achievements": ["Hackathon winner (HackMIT 2024)","Dean's List 3 semesters",
                         "Google Summer of Code participant","National coding olympiad finalist"],
    },
    "creator": {
        "titles": ["Tech YouTuber","Developer Advocate","Technical Writer","Dev Educator","Content Creator","Developer & Educator"],
        "skill_sets": [
            {"primary":["Python","JavaScript"], "content":["YouTube","Technical Writing","Course Creation"]},
            {"primary":["React","Node.js"],     "content":["Blogging","Newsletter","Twitter/X"]},
        ],
        "stats_pools": [
            {"subscribers":"45k","videos":"120","blog_readers":"20k/mo"},
            {"subscribers":"8k", "videos":"35", "blog_readers":"5k/mo"},
            {"subscribers":"200k","videos":"300","blog_readers":"80k/mo"},
            {"subscribers":"2k", "videos":"18", "blog_readers":"1k/mo"},
        ],
        "blog_topics": ["Building REST APIs with FastAPI","Why I switched from React to Svelte",
                        "Docker for beginners — full guide","10 VS Code extensions I use daily",
                        "From zero to deployed — my journey","Building a SaaS with Next.js and Stripe",
                        "How I got my first 10k subscribers","Understanding async/await deeply"],
    },
}

PROJECTS_POOL = [
    {"title":"E-Commerce Platform",      "desc":"Full-stack online store with cart, payments, and admin dashboard",     "impact":"Processed $50k+ in sales in first month",   "tech":["React","Node.js","Stripe"]},
    {"title":"Real-Time Chat App",       "desc":"WebSocket-based messaging with rooms, notifications, file sharing",    "impact":"500+ concurrent users, 99.9% uptime",       "tech":["Socket.io","React","Redis"]},
    {"title":"AI Resume Builder",        "desc":"SaaS tool that generates resumes using LLM APIs",                       "impact":"2,000 users in first week after launch",     "tech":["Next.js","OpenAI","PostgreSQL"]},
    {"title":"Portfolio Website Builder","desc":"No-code platform for creating and publishing portfolios",               "impact":"1,000+ portfolios created",                  "tech":["React","Node.js","MongoDB"]},
    {"title":"Task Management System",   "desc":"Kanban-style productivity app with team collaboration features",        "impact":"Adopted by 3 companies internally",          "tech":["Vue.js","Django","PostgreSQL"]},
    {"title":"Weather Dashboard",        "desc":"Real-time weather visualization with historical charts and alerts",     "impact":"500+ GitHub stars, featured on Hacker News", "tech":["React","D3.js","OpenWeatherAPI"]},
    {"title":"Mobile Banking App",       "desc":"React Native fintech app with biometric auth and budgeting tools",     "impact":"4.8/5 App Store rating, 10k downloads",     "tech":["React Native","Firebase","Plaid"]},
    {"title":"Data Analytics Dashboard", "desc":"Business intelligence tool with real-time PostgreSQL queries",          "impact":"Reduced reporting time by 60%",              "tech":["Next.js","PostgreSQL","Recharts"]},
    {"title":"Open Source CLI Tool",     "desc":"Developer productivity tool for automating repetitive tasks",           "impact":"3k+ weekly npm downloads",                  "tech":["Node.js","Commander.js","Chalk"]},
    {"title":"Social Media Scheduler",   "desc":"Multi-platform scheduling tool with analytics and team features",       "impact":"Used by 50+ small businesses",               "tech":["Next.js","Prisma","Twitter API"]},
]

EXPERIENCE_POOL = [
    {"company":"Google",     "role":"Senior Software Engineer","years":"2021–2024","desc":"Led backend services for Google Workspace, serving 3B+ users"},
    {"company":"Meta",       "role":"Software Engineer",       "years":"2022–2024","desc":"Worked on React infrastructure and developer tooling"},
    {"company":"Stripe",     "role":"Full Stack Engineer",     "years":"2020–2023","desc":"Built payment processing dashboard used by 500k+ merchants"},
    {"company":"Shopify",    "role":"Frontend Engineer",       "years":"2019–2022","desc":"Developed merchant-facing storefront features"},
    {"company":"Startup XYZ","role":"Lead Developer",          "years":"2021–2023","desc":"Built product from 0 to 10k users as sole developer"},
    {"company":"Agency Co",  "role":"Web Developer",           "years":"2018–2021","desc":"Delivered 30+ client websites across various industries"},
    {"company":"Airbnb",     "role":"Software Engineer",       "years":"2020–2023","desc":"Built host tools and search infrastructure"},
    {"company":"Vercel",     "role":"Developer Experience Engineer","years":"2022–2024","desc":"Improved deployment pipeline and documentation"},
]


# ══════════════════════════════════════════════════════════════════════
# PLACEHOLDER VALUE GENERATOR
# Handles every placeholder key for every template section.
# Unknown keys fall back gracefully — never crash.
# ══════════════════════════════════════════════════════════════════════

def flatten_skills(skills_raw) -> list:
    if isinstance(skills_raw, dict):
        return [s for group in skills_raw.values() for s in (group if isinstance(group, list) else [group])]
    elif isinstance(skills_raw, list):
        return skills_raw
    return [str(skills_raw)] if skills_raw else []

def generate_value(key: str, user: dict) -> str:
    name      = user.get("name", "Professional")
    title     = user.get("title", "Professional")
    skills_raw= user.get("skills", {})
    projects  = user.get("projects", [])
    experience= user.get("experience", [])
    email     = user.get("email", f"{name.split()[0].lower()}@gmail.com")
    social    = user.get("social_links", user.get("socials", {}))
    all_skills= flatten_skills(skills_raw)
    top_skill = all_skills[0] if all_skills else "software development"
    years     = user.get("years_experience", 0)

    ptype = user.get("_detected_type", "developer")

    # ── Hero ─────────────────────────────────────────────────────────
    if key == "{{hero_headline}}":
        options = [
            f"Building {top_skill} Solutions That Scale",
            f"{'Senior ' if years > 5 else ''}{title} Crafting Quality Software",
            f"Turning Ideas Into {top_skill} Products",
            f"Engineering Impactful Applications with {top_skill}",
            f"Passionate About {top_skill} and Clean Code",
        ]
        return random.choice(options)

    if key == "{{hero_subheadline}}":
        s = all_skills
        parts = [s[0]] + ([s[1]] if len(s)>1 else []) + ([s[2]] if len(s)>2 else [])
        return f"Specialized in {', '.join(parts)}" + (" and more" if len(s)>3 else "")

    if key == "{{cta_primary}}":
        return random.choice(["View My Work","See My Projects","Explore Portfolio","View Projects"])

    if key == "{{cta_secondary}}":
        return random.choice(["Get In Touch","Contact Me","Let's Talk","Hire Me"])

    # ── About ────────────────────────────────────────────────────────
    if key == "{{about_bio}}":
        exp_phrase = f"{years}+ years of experience" if years > 0 else "a passionate newcomer to the field"
        comp = experience[0]["company"] if experience else None
        comp_phrase = f" at {comp}" if comp else ""
        achievement = projects[0].get("impact","building quality software") if projects else "building quality software"
        return (f"{name} is a {title} with {exp_phrase}{comp_phrase}. "
                f"Skilled in {', '.join(all_skills[:3])}, with a proven record of {achievement.lower()}. "
                f"Passionate about writing clean, maintainable code that solves real problems.")

    if key == "{{tagline}}":
        return random.choice([
            "Code. Build. Ship. Repeat.",
            f"{top_skill} engineer who ships.",
            "Turning complex problems into elegant solutions.",
            "Building the web, one component at a time.",
        ])

    if key == "{{design_philosophy}}":
        return random.choice([
            "I believe great design is invisible — it just works for the user.",
            "Design is problem-solving with a human touch.",
            "Every pixel should have a purpose.",
            "Good design reduces friction. Great design creates delight.",
        ])

    # ── Skills ───────────────────────────────────────────────────────
    if key == "{{skills_list}}":
        return ", ".join(all_skills)
    if key == "{{skills_frontend}}":
        fe = skills_raw.get("frontend",[]) if isinstance(skills_raw,dict) else all_skills[:3]
        return ", ".join(fe) if fe else ", ".join(all_skills[:3])
    if key == "{{skills_backend}}":
        be = skills_raw.get("backend",[]) if isinstance(skills_raw,dict) else all_skills[3:6]
        return ", ".join(be) if be else ", ".join(all_skills[3:6] or all_skills[:2])
    if key == "{{skills_tools}}":
        tools = skills_raw.get("tools",[]) if isinstance(skills_raw,dict) else all_skills[6:]
        return ", ".join(tools) if tools else "Git, Docker, Linux"
    if key == "{{tools_list}}":
        tools = skills_raw.get("tools",[]) if isinstance(skills_raw,dict) else all_skills[:3]
        return ", ".join(tools) if tools else ", ".join(all_skills[:3])
    if key == "{{process_list}}":
        process = skills_raw.get("process",[]) if isinstance(skills_raw,dict) else ["User Research","Prototyping"]
        return ", ".join(process)

    # ── Projects ─────────────────────────────────────────────────────
    for i in range(1, 5):
        proj = projects[i-1] if len(projects) >= i else (PROJECTS_POOL[(i-1) % len(PROJECTS_POOL)])
        if key == f"{{{{project_{i}_title}}}}":  return proj.get("title", f"Project {i}")
        if key == f"{{{{project_{i}_desc}}}}":
            desc   = proj.get("desc", proj.get("description","A professional project."))
            impact = proj.get("impact","")
            return f"{desc}. {impact}" if impact else desc
        if key == f"{{{{project_{i}_tech}}}}":
            tech = proj.get("tech", random.sample(all_skills, min(3, len(all_skills))))
            return ", ".join(tech) if isinstance(tech, list) else str(tech)
        if key == f"{{{{project_{i}_impact}}}}": return proj.get("impact","Delivered on time and within scope.")
        if key == f"{{{{project_{i}_link}}}}":   return proj.get("link", proj.get("url","https://github.com"))

    # ── Experience ───────────────────────────────────────────────────
    for i in range(1, 5):
        exp = experience[i-1] if len(experience) >= i else (EXPERIENCE_POOL[(i-1) % len(EXPERIENCE_POOL)] if not experience else experience[0])
        if key == f"{{{{exp_{i}_company}}}}":  return exp.get("company","Company")
        if key == f"{{{{exp_{i}_role}}}}":     return exp.get("role", title)
        if key == f"{{{{exp_{i}_duration}}}}": return exp.get("years", exp.get("duration","2021–2023"))
        if key == f"{{{{exp_{i}_desc}}}}":     return exp.get("desc", exp.get("description",f"Worked on {top_skill} projects."))

    # ── Education ────────────────────────────────────────────────────
    edu = user.get("education", {})
    if key == "{{university}}":       return edu.get("university", edu.get("school","University"))
    if key == "{{degree}}":           return edu.get("degree","B.Sc Computer Science")
    if key == "{{graduation_year}}":  return str(edu.get("graduation_year", edu.get("year","2024")))
    if key == "{{gpa}}":              return str(edu.get("gpa","3.8/4.0"))

    # ── Services (freelancer) ────────────────────────────────────────
    default_services = [
        {"title":"Web Development",    "desc":f"Custom websites and web apps built with {', '.join(all_skills[:2])}","price":"From $1,500"},
        {"title":"Performance Audit",  "desc":"Deep-dive audit of your existing site with actionable fixes",          "price":"From $400"},
        {"title":"Consulting",         "desc":"Architecture advice, code review, and technical strategy sessions",     "price":"From $150/hr"},
    ]
    services = user.get("services", default_services)
    for i in range(1, 4):
        svc = services[i-1] if len(services) >= i else default_services[i-1]
        if key == f"{{{{service_{i}_title}}}}": return svc.get("title",f"Service {i}")
        if key == f"{{{{service_{i}_desc}}}}":  return svc.get("desc", f"Professional {top_skill} service.")
        if key == f"{{{{service_{i}_price}}}}": return svc.get("price", user.get("hourly_rate","Contact for pricing"))

    if key == "{{availability}}":
        return user.get("availability","Available for new projects")

    # ── Testimonials ─────────────────────────────────────────────────
    default_testimonials = [
        {"text":"Outstanding work delivered on time.","name":"Happy Client","company":"Client Co."},
        {"text":"Would highly recommend to anyone.","name":"Another Client","company":"Business Ltd."},
    ]
    testimonials = user.get("testimonials", default_testimonials)
    for i in range(1, 4):
        t = testimonials[i-1] if len(testimonials) >= i else (testimonials[0] if testimonials else default_testimonials[0])
        if key == f"{{{{testimonial_{i}_text}}}}":    return t.get("text","Great work and professional service.")
        if key == f"{{{{testimonial_{i}_name}}}}":    return t.get("name",f"Client {i}")
        if key == f"{{{{testimonial_{i}_company}}}}": return t.get("company","Client Company")

    # ── Stats ────────────────────────────────────────────────────────
    default_stats = [
        {"number":f"{max(1,years)}+",          "label":"Years Experience"},
        {"number":f"{random.randint(10,50)}+", "label":"Projects Completed"},
        {"number":f"{random.randint(5,30)}+",  "label":"Happy Clients"},
        {"number":f"{random.randint(2,15)}k+", "label":"GitHub Stars"},
    ]
    user_stats = user.get("stats", default_stats)
    for i in range(1, 5):
        s = user_stats[i-1] if len(user_stats) >= i else default_stats[min(i-1, 3)]
        if key == f"{{{{stat_{i}_number}}}}": return str(s.get("number",f"{random.randint(5,100)}+"))
        if key == f"{{{{stat_{i}_label}}}}":  return s.get("label",f"Achievement {i}")

    # ── Timeline ─────────────────────────────────────────────────────
    timeline = []
    for exp in experience[:3]:
        yr = exp.get("years","2023")
        timeline.append({"year": yr.split("–")[0] if "–" in yr else yr,
                          "title": f"{exp.get('role','Developer')} at {exp.get('company','Company')}",
                          "desc":  exp.get("desc", exp.get("description","Grew professionally and shipped key features."))})
    while len(timeline) < 3:
        i = len(timeline)
        timeline.append({"year":str(2023-i),"title":f"Career Milestone {i+1}","desc":"Key growth in skills and responsibility."})
    for i in range(1, 4):
        ev = timeline[i-1]
        if key == f"{{{{timeline_{i}_year}}}}":  return ev["year"]
        if key == f"{{{{timeline_{i}_title}}}}": return ev["title"]
        if key == f"{{{{timeline_{i}_desc}}}}":  return ev["desc"]

    # ── Blog ─────────────────────────────────────────────────────────
    blog_posts = user.get("blog_posts", user.get("articles", []))
    default_blogs = [
        {"title":f"Getting Started with {top_skill}",  "excerpt":f"A beginner-friendly guide to {top_skill}.", "url":"https://blog.example.com/1"},
        {"title":f"Advanced {top_skill} Patterns",     "excerpt":"Deep dive into advanced patterns and techniques.", "url":"https://blog.example.com/2"},
        {"title":f"My Journey with {top_skill}",       "excerpt":"Lessons learned building real projects.", "url":"https://blog.example.com/3"},
    ]
    if not blog_posts: blog_posts = default_blogs
    for i in range(1, 4):
        b = blog_posts[i-1] if len(blog_posts) >= i else default_blogs[min(i-1,2)]
        if key == f"{{{{blog_{i}_title}}}}":   return b.get("title",f"Blog Post {i}")
        if key == f"{{{{blog_{i}_excerpt}}}}": return b.get("excerpt","Read this on my blog.")
        if key == f"{{{{blog_{i}_url}}}}":     return b.get("url", b.get("link","https://blog.example.com"))

    # ── Contact ──────────────────────────────────────────────────────
    if key == "{{contact_headline}}":
        return {"freelancer":"Let's Work Together","designer":"Let's Create Something Beautiful",
                "student":"Open to Opportunities","creator":"Let's Collaborate"
               }.get(ptype,"Let's Build Something Together")
    if key == "{{contact_message}}":
        if ptype == "freelancer":
            rate  = user.get("hourly_rate","")
            avail = user.get("availability","available for new projects")
            return f"I'm {avail}. {f'Starting at {rate}. ' if rate else ''}Let's discuss your project."
        return "Available for full-time roles and exciting collaborations. Reach out — I'd love to connect."

    # ── Social links ─────────────────────────────────────────────────
    links = {
        "{{email}}":       user.get("email", email),
        "{{github_url}}":  social.get("github",   user.get("github",   "https://github.com")),
        "{{linkedin_url}}":social.get("linkedin",  user.get("linkedin", "https://linkedin.com")),
        "{{dribbble_url}}":social.get("dribbble",  user.get("dribbble", "https://dribbble.com")),
        "{{behance_url}}": social.get("behance",   user.get("behance",  "https://behance.net")),
        "{{twitter_url}}": social.get("twitter",   user.get("twitter",  "https://twitter.com")),
        "{{youtube_url}}": social.get("youtube",   user.get("youtube",  "https://youtube.com")),
        "{{calendly_url}}":social.get("calendly",  user.get("calendly", "https://calendly.com")),
    }
    if key in links:
        return links[key]

    # ── FALLBACK for any unknown / future placeholder key ────────────
    clean = key.strip("{}").replace("_"," ").title()
    return f"{name}'s {clean}"


def fill_template(template_def: dict, user: dict) -> dict:
    """Fill every placeholder in a template for a given user."""
    result = {}
    for section, placeholders in template_def["placeholders"].items():
        for ph in placeholders:
            result[ph] = generate_value(ph, user)
    return result


# ══════════════════════════════════════════════════════════════════════
# PROFILE GENERATOR
# ══════════════════════════════════════════════════════════════════════

def detect_type(user: dict) -> str:
    t = user.get("title","").lower()
    if any(w in t for w in ["design","ux","ui","visual","brand","motion"]): return "designer"
    if any(w in t for w in ["freelance","consultant","independent"]):        return "freelancer"
    if any(w in t for w in ["student","graduate","fresher","aspiring"]):     return "student"
    if any(w in t for w in ["creator","educator","youtuber","writer","advocate"]): return "creator"
    return "developer"

def random_name(): return f"{random.choice(NAMES['first'])} {random.choice(NAMES['last'])}"

def generate_profile(ptype: str) -> dict:
    pool    = PROFILE_POOLS[ptype]
    name    = random_name()
    title   = random.choice(pool["titles"])
    skills  = deepcopy(random.choice(pool["skill_sets"]))
    years   = random.randint(0, 12)
    company = random.choice(pool.get("companies",["Self-employed"]))
    projects= random.sample(PROJECTS_POOL, random.randint(1,3))
    exp     = random.sample(EXPERIENCE_POOL, random.randint(0,2))

    profile = {
        "name": name, "title": title, "skills": skills,
        "years_experience": years, "current_company": company,
        "projects": projects, "experience": exp,
        "email": f"{name.split()[0].lower()}.{name.split()[1].lower()}@gmail.com",
        "social_links": {
            "github":   f"https://github.com/{name.split()[0].lower()}",
            "linkedin": f"https://linkedin.com/in/{name.split()[0].lower()}-{name.split()[1].lower()}",
        },
        "_detected_type": ptype,
    }

    if ptype == "freelancer":
        profile["hourly_rate"]  = random.choice(pool["hourly_rates"])
        profile["availability"] = random.choice(pool["availability"])
        if random.random() > 0.4:
            profile["testimonials"] = random.sample(pool["testimonials"], random.randint(1,2))

    if ptype == "student":
        profile["education"] = {
            "university":      random.choice(pool["universities"]),
            "degree":          random.choice(pool["degrees"]),
            "graduation_year": random.randint(2022,2027),
            "gpa":             random.choice(pool["gpas"]),
        }
        if random.random() > 0.5:
            profile["achievements"] = [random.choice(pool["achievements"])]

    if ptype == "creator":
        stat = random.choice(pool["stats_pools"])
        profile["stats"] = [
            {"number": stat["subscribers"],  "label":"YouTube Subscribers"},
            {"number": stat["videos"],       "label":"Videos Published"},
            {"number": stat["blog_readers"], "label":"Monthly Blog Readers"},
        ]
        profile["blog_posts"] = [
            {"title":t, "excerpt":f"Read about {t.lower()} in this detailed guide.", "url":"https://blog.example.com"}
            for t in random.sample(pool["blog_topics"], 3)
        ]
        profile["social_links"]["youtube"] = f"https://youtube.com/@{name.split()[0].lower()}"
        profile["social_links"]["twitter"] = f"https://twitter.com/{name.split()[0].lower()}"

    if random.random() > 0.6 and "certifications" in pool:
        profile["certifications"] = random.sample(pool["certifications"], random.randint(1,2))

    if ptype == "designer" and random.random() > 0.6:
        profile["awards"] = [random.choice(pool["awards"])]
        profile["social_links"]["dribbble"] = f"https://dribbble.com/{name.split()[0].lower()}"

    return profile


# ══════════════════════════════════════════════════════════════════════
# THE 3 TRAINING FLOWS
# ══════════════════════════════════════════════════════════════════════

def build_flow1_example(user: dict) -> dict:
    """
    FLOW 1 — AUTO SELECT + GENERATE
    Input:  user profile data only (no template_id)
    Output: selected template + reasoning + filled placeholder_map

    This teaches the model to:
    1. Read user data
    2. Reason about which template fits best
    3. Generate content for that template's placeholders
    """
    all_template_ids = list(TEMPLATE_REGISTRY.keys())
    chosen_id, reasoning = select_best_template(user, all_template_ids)
    template_def = TEMPLATE_REGISTRY[chosen_id]
    placeholder_map = fill_template(template_def, user)

    # Show model all available templates + their descriptions so it
    # learns to make the selection decision itself
    available = [
        {"id": tid, "description": tdef["description"], "category": tdef["category"]}
        for tid, tdef in TEMPLATE_REGISTRY.items()
    ]

    return {
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are PortfolioAI. Your job has two steps:\n"
                    "STEP 1: Analyze the user profile and select the best template from the available list.\n"
                    "STEP 2: Generate professional content for every placeholder in that template.\n"
                    "Return ONLY valid JSON. No markdown. No explanations outside the JSON."
                )
            },
            {
                "role": "user",
                "content": json.dumps({
                    "task": "auto_select_and_generate",
                    "user_data": {k: v for k, v in user.items() if not k.startswith("_")},
                    "available_templates": available
                })
            },
            {
                "role": "assistant",
                "content": json.dumps({
                    "selected_template": chosen_id,
                    "selection_reason": reasoning,
                    "placeholders_needed": {
                        section: placeholders
                        for section, placeholders in template_def["placeholders"].items()
                    },
                    "placeholder_map": placeholder_map
                })
            }
        ]
    }


def build_flow2_example(user: dict, from_template_id: str, to_template_id: str) -> dict:
    """
    FLOW 2 — USER SWITCHES TEMPLATE
    Input:  user profile + existing placeholder_map + new template_id chosen by user
    Output: new placeholder_map for the new template

    This teaches the model to:
    1. Accept that the user manually chose a specific template (respect the choice)
    2. Reuse content from the existing map where placeholders overlap
    3. Generate NEW content only for sections/placeholders that didn't exist before
    """
    from_def = TEMPLATE_REGISTRY[from_template_id]
    to_def   = TEMPLATE_REGISTRY[to_template_id]

    existing_map = fill_template(from_def, user)
    new_map      = fill_template(to_def,   user)

    # Which sections are new vs reused
    from_sections = set(from_def["placeholders"].keys())
    to_sections   = set(to_def["placeholders"].keys())
    reused_sections = list(from_sections & to_sections)
    new_sections    = list(to_sections - from_sections)

    return {
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are PortfolioAI. The user has manually switched to a new template.\n"
                    "You are given their existing generated content and the new template's placeholder list.\n"
                    "Rules:\n"
                    "1. Reuse existing content for any placeholder that already exists.\n"
                    "2. Generate NEW content only for placeholders that did not exist in the previous template.\n"
                    "3. The user chose this template themselves — do NOT suggest a different one.\n"
                    "Return ONLY valid JSON. No markdown. No explanations."
                )
            },
            {
                "role": "user",
                "content": json.dumps({
                    "task": "switch_template",
                    "user_data": {k: v for k, v in user.items() if not k.startswith("_")},
                    "previous_template": from_template_id,
                    "new_template_chosen_by_user": to_template_id,
                    "existing_content": existing_map,
                    "new_template_placeholders": {
                        section: placeholders
                        for section, placeholders in to_def["placeholders"].items()
                    }
                })
            },
            {
                "role": "assistant",
                "content": json.dumps({
                    "template": to_template_id,
                    "reused_sections": reused_sections,
                    "new_sections_generated": new_sections,
                    "placeholder_map": new_map
                })
            }
        ]
    }


def build_flow3_example(user: dict, template_id: str) -> dict:
    """
    FLOW 3 — DIRECT GENERATE FOR KNOWN TEMPLATE
    Input:  user profile + template_id already known (user picked at signup)
    Output: filled placeholder_map for that exact template

    This teaches the model to:
    1. Skip template selection (it's already decided)
    2. Read the template's placeholder list
    3. Generate content for every placeholder using whatever user data exists
    """
    template_def    = TEMPLATE_REGISTRY[template_id]
    placeholder_map = fill_template(template_def, user)

    return {
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are PortfolioAI. The template has already been selected.\n"
                    "Generate professional content for every placeholder in the given template.\n"
                    "Use whatever user data is available. Generate sensible defaults for missing fields.\n"
                    "Return ONLY valid JSON. No markdown. No explanations."
                )
            },
            {
                "role": "user",
                "content": json.dumps({
                    "task": "generate_for_template",
                    "user_data": {k: v for k, v in user.items() if not k.startswith("_")},
                    "template_id": template_id,
                    "placeholders_needed": {
                        section: placeholders
                        for section, placeholders in template_def["placeholders"].items()
                    }
                })
            },
            {
                "role": "assistant",
                "content": json.dumps({
                    "template": template_id,
                    "placeholder_map": placeholder_map
                })
            }
        ]
    }


# ══════════════════════════════════════════════════════════════════════
# MAIN GENERATION
# ══════════════════════════════════════════════════════════════════════

def generate_dataset(
    flow1_per_type: int  = 80,   # auto-select examples per profile type
    flow2_per_pair: int  = 20,   # switch examples per template pair
    flow3_per_template: int = 50 # direct-fill examples per template
) -> list:

    all_examples = []
    template_ids = list(TEMPLATE_REGISTRY.keys())
    ptypes       = list(PROFILE_POOLS.keys())

    # ── FLOW 1: Auto select + generate ──────────────────────────────
    print("\n[FLOW 1] Auto-select + Generate examples...")
    f1_count = 0
    for ptype in ptypes:
        for _ in range(flow1_per_type):
            user = generate_profile(ptype)
            all_examples.append(build_flow1_example(user))
            f1_count += 1
    print(f"  ✅ {f1_count} examples ({flow1_per_type} per profile type × {len(ptypes)} types)")

    # ── FLOW 2: User switches template ──────────────────────────────
    print("\n[FLOW 2] User switches template examples...")
    f2_count = 0
    for i, from_id in enumerate(template_ids):
        for to_id in template_ids:
            if from_id == to_id:
                continue
            from_cat = TEMPLATE_REGISTRY[from_id]["category"]
            ptype    = from_cat if from_cat in PROFILE_POOLS else "developer"
            for _ in range(flow2_per_pair):
                user = generate_profile(ptype)
                all_examples.append(build_flow2_example(user, from_id, to_id))
                f2_count += 1
    print(f"  ✅ {f2_count} examples ({flow2_per_pair} per pair × {len(template_ids)*(len(template_ids)-1)} pairs)")

    # ── FLOW 3: Direct generate for known template ───────────────────
    print("\n[FLOW 3] Direct-fill known template examples...")
    f3_count = 0
    for tid in template_ids:
        cat   = TEMPLATE_REGISTRY[tid]["category"]
        ptype = cat if cat in PROFILE_POOLS else "developer"
        for _ in range(flow3_per_template):
            user = generate_profile(ptype)
            all_examples.append(build_flow3_example(user, tid))
            f3_count += 1
    print(f"  ✅ {f3_count} examples ({flow3_per_template} per template × {len(template_ids)} templates)")

    random.shuffle(all_examples)
    print(f"\n  Total: {len(all_examples)} examples across all 3 flows")
    return all_examples


def save_and_validate(examples: list, out_dir: str = "./data"):
    Path(f"{out_dir}/training").mkdir(parents=True, exist_ok=True)
    Path(f"{out_dir}/validation").mkdir(parents=True, exist_ok=True)

    split      = int(len(examples) * 0.9)
    train, val = examples[:split], examples[split:]

    train_path = f"{out_dir}/training/portfolio_train.jsonl"
    val_path   = f"{out_dir}/validation/portfolio_val.jsonl"

    with open(train_path,"w") as f:
        for ex in train: f.write(json.dumps(ex)+"\n")
    with open(val_path,"w") as f:
        for ex in val:   f.write(json.dumps(ex)+"\n")

    # Validate + count tasks
    task_counts = {}
    errors = []
    for path in [train_path, val_path]:
        with open(path) as f:
            for i, line in enumerate(f):
                try:
                    ex = json.loads(line)
                    assert len(ex["messages"]) == 3
                    user_msg = json.loads(ex["messages"][1]["content"])
                    task = user_msg.get("task","unknown")
                    task_counts[task] = task_counts.get(task,0) + 1
                    asst = json.loads(ex["messages"][2]["content"])
                    assert "placeholder_map" in asst
                except Exception as e:
                    errors.append(f"{path} line {i+1}: {e}")

    return train_path, val_path, len(train), len(val), task_counts, errors


if __name__ == "__main__":
    print("="*60)
    print("PORTFOLIO AI — DATASET GENERATOR v3")
    print("All 3 Flows: Auto-Select | Switch Template | Direct Fill")
    print("="*60)
    print(f"Templates : {len(TEMPLATE_REGISTRY)}")
    print(f"User types: {list(PROFILE_POOLS.keys())}")

    examples = generate_dataset(
        flow1_per_type=80,
        flow2_per_pair=20,
        flow3_per_template=50,
    )

    train_path, val_path, n_train, n_val, task_counts, errors = save_and_validate(examples)

    print(f"\n{'='*60}")
    print(f"DATASET SAVED")
    print(f"{'='*60}")
    print(f"  Training   : {n_train} examples  →  {train_path}")
    print(f"  Validation : {n_val} examples   →  {val_path}")
    print(f"  Total      : {n_train + n_val}")
    print(f"\n  Breakdown by task:")
    for task, count in sorted(task_counts.items()):
        flow = {"auto_select_and_generate":"Flow 1 — Auto Select",
                "switch_template":         "Flow 2 — User Switch",
                "generate_for_template":   "Flow 3 — Direct Fill"}.get(task, task)
        print(f"    {flow:35s}: {count}")
    if errors:
        print(f"\n  ⚠️  {len(errors)} validation errors:")
        for e in errors[:5]: print(f"    {e}")
    else:
        print(f"\n  ✅ All examples valid")
    print(f"\n  To add a new template:")
    print(f"    1. Add it to TEMPLATE_REGISTRY at the top of this file")
    print(f"    2. Add selection logic to select_best_template() if needed")
    print(f"    3. Re-run this script")
    print(f"    4. Re-run fine-tuning: python3 scripts/finetune.py")
