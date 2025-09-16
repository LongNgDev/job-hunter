# job_hunter_worker/config/settings.py
import os

# Kafka
KAFKA_BROKERS = os.getenv("KAFKA_BROKERS", "localhost:19092")
KAFKA_GROUP   = os.getenv("KAFKA_GROUP", "jobs-worker-1")
KAFKA_TOPIC   = os.getenv("TOPIC", "job.created")

# Redis
REDIS_URI     = os.getenv("REDIS_URI", "redis://localhost:6379/0")

# Mongo
MONGO_URI     = os.getenv("MONGO_URI", "mongodb://admin:admin@localhost:27017/")
MONGO_DB      = os.getenv("MONGO_DB", "jobhunter")   # you can change this
MONGO_COLL    = os.getenv("MONGO_COLL", "jobs")

# Worker
STATUS_TTL    = int(os.getenv("STATUS_TTL", "604800"))  # 7 days
PROCESS_DELAY = float(os.getenv("PROCESS_DELAY", "0.5")) # extra sleep if needed

# General
APP_ENV       = os.getenv("APP_ENV", "development")
DEBUG         = os.getenv("DEBUG", "false").lower() in ["true", "1", "yes"]
