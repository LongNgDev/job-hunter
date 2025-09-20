import redis # type: ignore
from typing import Optional, Dict, Any
from datetime import datetime


STATUS_TTL = 7 * 24 * 3600  # 7 days
class RedisPublisher:
  def __init__(self):
    self.__client = None
    self._connect()


  def _connect(self):
    try:
      self.__client = redis.Redis(host="localhost", port=6379, decode_responses=True,  password="admin")
      self.__client.ping()
      print("✅ Connected to Redis")
    except Exception as e:
        print("[worker] Redis not ready (continuing):", e)
        self.__client = None


  def set_status(self, jid, status:str = "In progress"):
    if not self.__client:
      return False
    
    key = f"job:{jid}"
    try:
      payload: Dict[str, Any] ={
        "id": jid,
        "status": status,
        "updatedAt": datetime.now().isoformat()
      }

      pipe = self.__client.pipeline()
      pipe.hset(key, mapping=payload)
      pipe.expire(key, STATUS_TTL)
      pipe.execute()

    except Exception as e:
      print(f"error: {e}")


if __name__ == "__main__":
  r = RedisPublisher()
  r.set_status("1231")