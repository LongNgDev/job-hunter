
from datetime import datetime, date
from typing import TypedDict

from pymongo import MongoClient, ASCENDING
from pymongo.errors import DuplicateKeyError, PyMongoError
from config.settings import MONGO_URI, MONGO_DB, MONGO_COLL


class JobPayLoad(TypedDict):
   id: str 
   url: str
   companyName: str
   recruiterName: str
   jobTitle: str
   jobDescription: str
   salaryStart: int
   salaryEnd: int
   openDate: date
   closeDate:date

class MongoDB:
  def __init__(self):
    self.__client = None
    self.__db = None
    self.__coll = None
    self._connect_db()

  def _connect_db(self) -> None:
    if self.__coll is not None:
      return

    self.__client = MongoClient(MONGO_URI)
    try:
        self.__client.admin.command("ping")
        print("✅ Connected to MongoDB!")
    except Exception as e:
        print("❌ Connection failed:", e)

    self.__db = self.__client.get_database(MONGO_DB)
    self.__coll = self.__db.get_collection(MONGO_COLL)

    # self.__coll.create_index([("url", ASCENDING)], unique = True, background = True)

  
  def save_job(self, payload: JobPayLoad):
    doc = dict(payload)
    

    try:
      if self.__coll is None:
        raise Exception("Collection is not exist!")
      
      res = self.__coll.update_one(
         {"id": doc["id"]},
         {"$set": doc, "$setOnInsert": {"processedAt": datetime.now()}},
         upsert=True
      )

      print({
        "ok": True,
        "upserted": res.upserted_id is not None,
        "id": doc["id"],
        "matched_count": res.matched_count,
        "modified_count": res.modified_count,
      })
    

    except DuplicateKeyError:
        # In rare race cases, two writers can upsert the same URL at once.
        # We handle by doing a second update without upsert.
        if self.__coll is None:
            raise Exception("Collection is not existed!")
        
        res2 = self.__coll.update_one({"url": doc["url"]}, {"$set": doc})
        print({
            "ok": True,
            "upserted": False,
            "matched_count": res2.matched_count,
            "modified_count": res2.modified_count,
            "url": doc["url"],
            "note": "duplicate race handled",
        })
    except PyMongoError as e:
        # Any other DB failure
        print( {"ok": False, "error": str(e), "url": doc.get("url")})
    
    except Exception as e:
        print( {
            "ok": False,
            "errors" : e
        })
