import json, os, signal, sys, time

from kafka import KafkaConsumer
import redis as redisDB

BROKERS    = os.getenv("KAFKA_BROKERS", "localhost:19092")
GROUP_ID   = os.getenv("KAFKA_GROUP", "jobs-worker-1")
TOPIC      = os.getenv("TOPIC", "job.created")
REDIS_URL  = os.getenv("REDIS_URL", "redis://localhost:6379/0")
TTL_SEC    = int(os.getenv("STATUS_TTL", "604800"))  # 7 days


redis = redisDB.from_url(REDIS_URL)

""" consumer = KafkaConsumer({
    "bootstrap.servers": BROKERS,
    "group_id": GROUP_ID,
    "auto_offset_reset": "earliest",
    "enable_auto_commit": True,
})
 """
consumer = KafkaConsumer(
    TOPIC,
    bootstrap_servers= BROKERS,
    group_id=GROUP_ID,
    auto_offset_reset= "earliest",
    enable_auto_commit= True,
    value_deserializer=lambda m: json.loads(m.decode('ascii'))
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
    redis.hset(key, mapping=fields)
    redis.expire(key, TTL_SEC)

def process(job):
    # TODO: your real logic here
    print(job)
    time.sleep(15)
    time.sleep(0.5)
    return {"ok": True, "notes": "processed!"}

def main():
    try:
        for msg in consumer:
            if stop:
                break
            job = msg.value   # already a dict now
            jid = job["id"]

            set_status(jid, status="processing", progress=10)
            try:
                res = process(job)
                set_status(jid, status="done", progress=100, result=json.dumps(res))
            except Exception as e:
                set_status(jid, status="failed", error=str(e))
    finally:
        consumer.close()

if __name__ == "__main__":
    main()