
from typing import Dict, Any
import requests


class AiClient:
  def __init__(self, model:str="mistral", host:str="http://localhost:11434", timeout:int=300):
    self.model = model
    self.url = f"{host.rstrip('/')}/api/generate"
    self.timeout = timeout

  def generate(self, prompt:str, temperature:float = 0.2, top_p:float = 0.95, max_tokens:int | None = None) -> str:
    payload: Dict[str, Any] = {
      "model": self.model,
      "prompt": prompt,
      "stream": False,
      "options":{
        "temperature": temperature,
        "top_p": top_p
      }
    }

    if max_tokens is not None:
      payload["options"]["num_predict"] = max_tokens

    response=requests.post(self.url, json=payload, timeout=self.timeout)
    response.raise_for_status()
    data = response.json()

    return data.get("response")




if __name__ == "__main__":
  client = AiClient(model="mistral")

  print(client.generate("Say hello in one short sentence."))