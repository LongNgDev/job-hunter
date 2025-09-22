
from .client import AiClient

class SkillExtractor(AiClient) :
  def __init__(self, article:str):
    super().__init__(model="llama3.1:8b")
    self.__ARTICLE=article


  def clear_article(self):
    PROMPT=f"""
    You are a text cleaner for job advertisements.
    Your task: extract ONLY the job-specific content and output STRICT JSON.

    Input (raw job ad):
    {self.__ARTICLE}

    Extraction scope:
    - START at the first role-related heading (examples: "The Role", "About the role", "Role overview", "Position", "Job description", "Responsibilities").
    - KEEP everything from there through responsibilities/requirements/skills/qualifications.
    - STOP when you reach sections about perks/benefits, culture, company info, apply instructions, employer questions, salary, contact info, location-only blocks, or links.

    Field definitions (use these to classify text):
    - job_title = the actual role name if present (e.g. "Software Engineer - Integrations"). If only a generic heading like "The Role" appears, return "".
    - summary = short descriptive sentences about the role (the what and why), usually 1–3 sentences before any bullet lists.
    - responsibilities = action-oriented list (the what you'll do).
    - requirements = personal qualities, values, expectations (the what we want you to be).
    - technical_skills = specific technical knowledge, tools, programming abilities, APIs, protocols, formats (e.g. REST, OAuth, JSON, XML).
    - qualifications = formal credentials (degrees, certifications, licences). Degree lines belong here, not in requirements.

    Formatting rules:
    - Remove leading bullet symbols from items (e.g., "•", "-", "–", "—", "●", "○", "·", "*").
    - Preserve original wording (no paraphrasing), apart from removing bullet symbols and surrounding whitespace.
    - Normalise whitespace: collapse multiple spaces, trim each item.
    - Dedupe within each array only; cross-field overlaps are allowed.
    - If a section is missing, use "" for text fields and [] for list fields.
    - Do NOT include company promo/culture/perks/apply/links/emails/phone numbers.
    - If a degree/certification line appears in requirements, move it to qualifications.
    - Prefer specific technologies over vague groupings when both appear.

    Output:
    - Return ONLY a single JSON object (no code fences, no commentary).
    - Keys and types must EXACTLY match this schema:
    {{
      "response": {{
        "job_title": "",
        "summary": "",
        "responsibilities": [],
        "requirements": [],
        "technical_skills": [],
        "qualifications": []
      }}
    }}

    Validation constraints:
    - All six keys MUST exist.
    - responsibilities/requirements/technical_skills/qualifications MUST be arrays (even if empty).
    - summary and job_title MUST be strings.
    - Never invent content; copy text exactly from the input span (after cleaning bullets/whitespace).
    """

   
    clean_article=self.generate(PROMPT, temperature=0)
    print(clean_article)
    return clean_article
  

if __name__ == "__main__":
  ARTICLE="""
Software Engineer - Integrations

About the job
We're quickly growing and super excited for you to join us! 
 
About Topsort
At Topsort, we believe in the mission of democratizing the secret technologies of the walled gardens and creating a privacy-first cookie-free world of clean advertising with modern tech, friendly products, and AI. We believe in making advertising intuitive, intelligent, and genuinely cool, without any of the creepy ads or cookie-obsession (well, maybe just the chocolate ones). In a rapidly changing industry, we're on a mission to democratize monetization access for all and ensure that advertising doesn't leave any brand or seller feeling confused or overwhelmed
Today, Topsort has 5 major hubs worldwide, and employees in 13+ countries, including Menlo Park, Boston, Santiago Chile, Sao Paulo Brazil, Barcelona Spain, and Sydney Australia. We are a truly global company that was born in the pandemic that’s had rapid growth since out of a genius product, a customer-first mentality, and a hardworking team of talented individuals. Since our founding in 2021, we’ve gained customers in retail, marketplaces, and delivery apps in 40+ countries and quickly approaching the #1 position in the industry.
Do you enjoy a fast-paced environment? Do you like seeing your work create real-time impact, being part of a rocket ship from the very beginning? Let’s do the unimaginable - let’s make ads clean and cool again, with AI and modern technology.
What it’s like to work at Topsort
Our team is all about straightforward communication, embracing feedback without taking it personally, and fostering a super collaborative environment. It’s a sports team that’s hyper focused on winning, collaborative internally, and competitive externally - never the other way around. We thrive on working in the open, lifting each other up, and getting things done with a sense of urgency. We're the kind of team that loves making bold choices, sharing extraordinary opinions, and maintaining a 100 mph pace. No endless meetings here – if it can be done today, we're all about getting it done today.
About the Role:
We are looking for a hands-on and client-facing Software Engineers - Integrations focuesd to join our team at Topsort. In this role, you will play a pivotal part in translating real-world business needs into powerful, scalable product solutions. You’ll collaborate directly with sales, product, and engineering teams to support Pre-sales conversations - partner with sales to understand customer pain points, lead technical implementations with Topsort. 
You will:
•	Engage with Prospects & Clients: Work closely with the sales and customer success teams to understand client requirements and propose tailored technical solutions.
•	Own Technical Discovery & Demos: Lead technical conversations and run product demonstrations that align our platform’s capabilities with customer needs.
•	Solution Design: Translate business challenges into feasible product configurations, data integrations, and implementation plans.
•	Support RFPs and Security Questionnaires: Respond to technical and compliance-related questions in RFPs and trust questionnaires.
•	Own the entire integration process – You won’t just be following instructions; you’ll be leading integrations end-to-end, solving complex challenges, and acting as a trusted technical advisor to our clients.
•	Be the bridge between tech & customer success – Work directly with clients, engineers, and product teams to deeply understand their needs and ensure seamless API integrations. Your solutions won’t just be functional—they’ll be impactful and user-friendly, strengthening long-term customer relationships.
What (we think) you need to be successful - we’re open to not checking all the boxes and be proven wrong by outlier candidates as well! 
•	Industry Experience: 1+ years in software development, managing integrations, APIs, system interoperability, or ad tech is a plus. etc.
•	API Expertise: Strong experience with RESTful APIs, authentication methods (OAuth), and data formats (JSON, XML).
•	Proven ability to communicate complex technical ideas clearly to both technical and non-technical audiences.
•	Demonstrated success working directly with enterprise clients, understanding their operational realities and constraints.
•	Comfortable navigating ambiguity and making decisions with incomplete information.
•	Clear sense of ownership — you lead the solution from pre-sales design through implementation and post-sale success.
•	Experience collaborating with product and engineering teams to shape customer-driven roadmaps.
•	Bachelor’s degree and above in Computer Science, Engineering, or related field from a top school. 
•	CRM & Platforms: Familiarity with customer relationship management (CRM) tools and integration platforms.
•	Communication & Stakeholder Management: Strong ability to interact with both technical and non-technical audiences, translating complex concepts into actionable insights.
Topsort Culture
•	Speed: We work hard, set aggressive goals and execute flawlessly to accomplish them. We give candid feedback, push each other to set higher goals and produce more impact by always thinking “how do we do this faster and better”
•	Fast Growth: We believe startup scaleup is just like a team sport. It's been written in our motto since day 1 that we are collaborative internally, competitive externally, and never the other round around. You are ultimately surrounded by just different people that are all here to help you get the job done and shine as a team. 
•	Intellectual Rigor and Individuality: We were born in the pandemic by Stanford and Harvard alum cofounders who offer (at least) once a year in person offsite gathering. You’ll be welcomed by coworkers in 11 countries that all bring a unique perspective to the company from day 1. From personalized birthday gifts to work anniversaries, and management training program or in-person gatherings or career talks and mentorships, part-time DJs and tik-tok vloggers are also commercial leaders and technical staff at Topsort. We don’t take management with a cookie cutter approach - but rather we cherish your quarks and think it makes us stronger. 
•	Company Offsite and Industry Exposure: Once a year Topsorters get together as a whole and also meet customers and really spend time to get feedback 
•	401K Matching and Comprehensive benefits: We provide a generous and comprehensive set of health benefits, including vision, dental, and a 3% 401K matching as soon as you join! 
•	Working Equipment and Hubs: our team is global and also centered around hubs, that means you’re welcome to create a hybrid work schedule, and encouraged to travel to other hubs to collaborate. We provide working devices of your choice and surprise swags for special events. 
•	Flexible PTO schedule with floating holidays - we encourage Topsorters to take time off and recharge, and respect different cultural norms so offer floating holidays to accommodate the celebrations you’d like. 
•	Meditation App, Birthday and Anniversary Celebrations - we like little surprises and remember the key moments to celebrate with you! 
  """
  extractor = SkillExtractor(article=ARTICLE)
  extractor.clear_article()