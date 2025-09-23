
from typing import Dict, Any
import requests
import json


class AiClient:
  def __init__(self, model:str="mistral", host:str="http://localhost:11434", timeout:int=300):
    self.model = model
    self._url = f"{host.rstrip('/')}/api/generate"
    self.timeout = timeout

  def _generate(self, prompt:str, temperature:float = 0.05 , top_p:float = 0.95, max_tokens:int | None = None) -> str:
    payload: Dict[str, Any] = {
      "model": self.model,
      "prompt": prompt,
      "stream": False,
      "format": "json",
      "options":{
        "temperature": temperature,
        "top_p": top_p,
        # "top_k":1,
        "num_ctx": 8192,
        "repeat_penalty":1.05,
        "num_ctx": 8192
      }
    }

    if max_tokens is not None:
      payload["options"]["num_predict"] = max_tokens

    response=requests.post(self._url, json=payload, timeout=self.timeout)
    response.raise_for_status()
    data = response.json()

    return data.get("response")




if __name__ == "__main__":
  client = AiClient(model="llama3.1:8b")

  PROMPT = """
You are an information extractor. Read the attached job ad and return exactly six (6) technical or job-specific skills as short noun phrases (≤5 words each).

Scope
- Consider all sections: summary, responsibilities, requirements, and “Nice to have”.
- Extract only concrete technologies, frameworks, programming languages, cloud services, databases, and domain-specific platforms/tools.

Selection & Normalisation Rules
- Use the ad’s exact terminology/casing wherever possible.
- This list is intended to help tailor a resume and cover letter, so prioritise skills that a hiring manager or ATS system would scan for to confirm relevant industry experience.
- Prefer specific named technologies over broad categories.
- Deduplicate overlaps by prioritising higher-level items (frameworks, platforms, tools) over their underlying languages or components.
- If only lower-level items are present, group them into one combined skill, otherwise, keep the high-level 
- Ensure exactly six unique skills. If fewer remain after de-duplication, fill with the next most relevant unique technologies from the ad.
- If multiple options are listed, select the one most prominently mentioned; if equal, combine with “or”.
- You are an information extractor. Read the attached job ad and return exactly six (6) technical or job-specific skills as short noun phrases (≤5 words each).

Scope
- Consider all sections: summary, responsibilities, requirements, and “Nice to have”.
- Extract only concrete technologies, frameworks, programming languages, cloud services, databases, and domain-specific platforms/tools.

Selection & Normalisation Rules
- Use the ad’s exact terminology/casing wherever possible.
- Prefer specific named technologies over broad categories.
- Deduplicate overlaps by prioritising higher-level items (frameworks, platforms, tools) over their underlying languages or components.
- If only lower-level items are present, group them into one combined skill (e.g. “HTML/CSS/JavaScript”).
- Ensure exactly six unique skills. If fewer remain after de-duplication, fill with the next most relevant unique technologies from the ad.
- If multiple options are listed, select the one most prominently mentioned; if equal, combine with “or”.
- Always include explicit CMS/platform mentions (e.g. WordPress) and integration mentions (e.g. API development & integration) if present.

Ranking
- Order by prominence in the ad: front-end framework first, then back-end framework/language, then database, then CMS/platform, then integration, then tooling/version control.

Output
- Return ONLY a plain JSON array of exactly 6 strings, in ranked order.
- No extra text, keys, numbering, markdown, or code fences.
- Use double quotes; no duplicates; no trailing punctuation.

Ranking
- Order by prominence in the ad: front-end framework first, then back-end framework/language, then database, then CMS/platform, then integration, then tooling/version control.

Output
- Return ONLY a plain JSON array of exactly 6 strings, in ranked order.
- No extra text, keys, numbering, markdown, or code fences.
- Use double quotes; no duplicates; no trailing punctuation.


Example format:
{skills:["RESTful APIs (NodeJS)", "AWS Lambda & API Gateway", "Backend architecture scoping", "AI model integration", "MySQL/MariaDB", "NextJS or NuxtJS"]}
"""

  res=client._generate(f"""IntegraDev - Who are we?
Integrated Application Development (IntegraDev) is a subsidiary of Integrafin Holdings plc (Transact) in the UK. We develop the key operational system for Transact – the market leader in the UK financial platform sector. Transact has more than 240,000 clients, with over AU$130BN in funds under administration
Our software development team is built on a foundation of mentorship, collaboration and quality. Our success is built on a culture of knowledge sharing and an unwavering focus on quality that ensures our high-performing development team produces easy to use, maintainable, and secure software.
The Role
Our software developers are engaged across the entire software development lifecycle. Working with us will allow you to develop your cross-functional expertise, driven by a mindset and methodology that emphasises discipline, interconnectedness and adaptability. You will have end-to-end ownership working on:
•	Requirements analysis and management
•	Analysis and design
•	Coding
•	Automated and manual testing
•	Documentation
We are looking for people who value:
•	Agnostic skills - critical thinking, problem solving and communication
•	The fundamentals of good software design that span technologies, including OO design principles
•	Effective peer review and collaboration skills
•	Curiosity
•	The importance of methodical processes and clear decisions
•	Adaptability
We think you'll love working at IntegraDev as we offer you:
•	A collaborative environment that values hands-on problem solving
•	Stability - with staff retention rates averaging over 8 years
•	A structured onboarding process
•	Experienced team leaders to support your ongoing development
•	Ongoing learning and development opportunities
Required skills and experience
•	Completed Bachelor of Software Engineering or Computer Science
•	Strong understanding of OO programming principles and development tools
•	Effective written and verbal communication skills
Find out more about us at https://integradev.com.au/
If you think we sound like a team you’d like to work with, apply now.
Employer questions
Your application will include the following questions:
•	How many years' experience do you have in a software development role?
•	Which of the following statements best describes your right to work in Australia?
•	How many years' experience do you have as a software developer?
•	Have you worked in a role which requires a sound understanding of the software development lifecycle?

 
                      
                      {PROMPT}
                       """)
  
  print(res)