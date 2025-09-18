import redis # type: ignore
from datetime import datetime
import json

class RedisPublisher:
  def __init__(self, channel:str = "job.status"):
    self.__client = None
    self.__channel = channel
    self._connect()


  def _connect(self):
    try:
      self.__client = redis.Redis(host="localhost", port=6379, decode_responses=True,  password="admin")
      self.__client.ping()
      print("✅ Connected to Redis")
    except Exception as e:
        print("[worker] Redis not ready (continuing):", e)
        self.__client = None


  def set_status(self, jid, status:str = "In progress", *progress:int):
    if not self.__client:
      return False
    
    key = f"job:{jid}"
    try:
      payload = json.dumps({
        "id": jid,
        "status": status,
        "updatedAt": datetime.now().isoformat()
      })

      self.__client.publish(self.__channel, payload)

    except Exception as e:
      print(f"error: {e}")


if __name__ == "__main__":
  r = RedisPublisher()
  r.set_status("1231")