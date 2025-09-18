import json, os, signal, sys, time

from kafka import KafkaConsumer # type: ignore
# import redis as redisDB
from pymongo import MongoClient

# Import func
from mongo import MongoDB 
import worker.redis_publisher as redis_publisher

BROKERS    = os.getenv("KAFKA_BROKERS", "localhost:19092")
GROUP_ID   = os.getenv("KAFKA_GROUP", "jobs-worker-1")
TOPIC      = os.getenv("TOPIC", "job.created")
REDIS_URL  = os.getenv("REDIS_URI", "redis://localhost:6379/0")
MONGO_URI  = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
TTL_SEC    = int(os.getenv("STATUS_TTL", "604800"))  # 7 days


mongoClient = MongoDB()


consumer = KafkaConsumer(
    TOPIC,
    bootstrap_servers= BROKERS,
    group_id=GROUP_ID,
    auto_offset_reset= "earliest",
    enable_auto_commit= True,
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
)


# Global flag to tell our main loop whether to keep running
stop = False

def _stop(*_):
    """Signal handler: flip the stop flag to True so the worker exits gracefully."""
    global stop
    stop = True

# Catch Ctrl+C in terminal (SIGINT) and call _stop instead of crashing
signal.signal(signal.SIGINT, _stop)

# Catch docker stop / system shutdown (SIGTERM) and call _stop
signal.signal(signal.SIGTERM, _stop)


def set_status(job_id, **fields):
    key = f"job:{job_id}"
    # redis.hset(key, mapping=fields)
    # redis.expire(key, TTL_SEC)

def process(job):
    mongoClient.save_job(job)
    time.sleep(0.5)
    return {"ok": True, "notes": "processed!"}

def main():
    try:
        while not stop:
            # poll returns a dict: {TopicPartition: [messages]}
            records = consumer.poll(timeout_ms=1000)
            if not records:
                continue

            for _tp, msgs in records.items():
                for msg in msgs:
                    job = msg.value
                    jid = job["url"]

                    set_status(jid, status="processing", progress=10)
                    try:
                        res = process(job)
                        set_status(jid, status="done", progress=100, result=json.dumps(res))
                    except Exception as e:
                        set_status(jid, status="failed", error=str(e))
    except KeyboardInterrupt:
        print("👋 Stopping worker…")
    except Exception as e:
        print(f"Errors: {e}")
    finally:
        consumer.close()

if __name__ == "__main__":
    main()