import os
from datetime import datetime
from typing import Dict, Any

from pymongo import MongoClient, ASCENDING
from pymongo.errors import DuplicateKeyError, PyMongoError
from config.settings import MONGO_URI, MONGO_DB, MONGO_COLL

_client = None
_db = None
_coll = None  # set after connect


def _connect_once():
    """
    Create a global MongoClient once, select DB/collection, and ensure indexes.
    Called lazily by get_collection(). Keeping it here to keep file minimal.
    """
    global _client, _coll
    if _coll is not None:
        return  # already connected


    _client = MongoClient(MONGO_URI)
    db = _client[MONGO_DB]
    _coll = db[MONGO_COLL]

    # IMPORTANT: unique index on URL makes saves idempotent per job URL.
    # background=True so it doesn't block; safe for dev, fine for prod too.
    _coll.create_index([("url", ASCENDING)], unique=True, background=True)


def get_collection():
    """Returns the Mongo collection, connecting if needed."""
    global _coll
    if _coll is None:
        _connect_once()
    return _coll


def save_job(payload: Dict[str, Any]) -> Dict[str, Any]:
    doc = dict(payload)
    # doc.setdefault("processedAt", datetime.now())


    coll = get_collection()

    try:
        if coll is None:
            raise Exception("Collection is not existed!")
        res = coll.update_one(
            {"url": doc["url"]},
            {"$set": doc, "$setOnInsert": {"processedAt": datetime.now()}},
            upsert= True
        )

        return {
            "ok": True,
            "upserted": res.upserted_id is not None,
            "matched_count": res.matched_count,
            "modified_count": res.modified_count,
            "url": doc["url"],
        }

    except DuplicateKeyError:
        # In rare race cases, two writers can upsert the same URL at once.
        # We handle by doing a second update without upsert.
        if coll is None:
            raise Exception("Collection is not existed!")
        
        res2 = coll.update_one({"url": doc["url"]}, {"$set": doc})
        return {
            "ok": True,
            "upserted": False,
            "matched_count": res2.matched_count,
            "modified_count": res2.modified_count,
            "url": doc["url"],
            "note": "duplicate race handled",
        }
    except PyMongoError as e:
        # Any other DB failure
        return {"ok": False, "error": str(e), "url": doc.get("url")}
    
    except Exception as e:
        return {
            "ok": False,
            "errors" : e
        }
        