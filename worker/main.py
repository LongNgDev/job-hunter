import signal, time

# Import KafkaClient
from kafkaClass.client import KafkaClient

# Import MongoClient
from database.mongo import MongoDB 
# Import Redis
from database.redis_publisher import RedisPublisher


mongoClient = MongoDB()
redisClient = RedisPublisher()

consumer = KafkaClient().run()


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


def process(job):
    try:
        while not stop:
            # poll returns a dict: {TopicPartition: [messages]}
            records = consumer.poll(timeout_ms=1000)
            if not records:
                continue

            # loop through message queue to process
            for _tp, msgs in records.items():
                for msg in msgs:
                    # extract data from message
                    job = msg.value
                    jid = job["id"]

                    # set_status(jid, status="processing", progress=10)
                    try:
                        # Save job to database
                        mongoClient.save_job(job)
                        # Initialise status for job progress
                        mongoClient.set_status(jid)
                        """ 
                            Work start here
                        """
                        time.sleep(15) # For testing only
                        mongoClient.set_status(jid, "Complete")
                    except Exception as e:
                        mongoClient.set_status(jid, status="failed")
    except KeyboardInterrupt:
        print("👋 Stopping worker…")
    except Exception as e:
        print(f"Errors: {e}")
    finally:
        consumer.close()

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
                    jid = job["id"]

                    # set_status(jid, status="processing", progress=10)
                    try:
                        process(job)
                        mongoClient.set_status(jid)
                        time.sleep(15) # For testing only
                        mongoClient.set_status(jid, "Complete")
                    except Exception as e:
                        mongoClient.set_status(jid, status="failed")
    except KeyboardInterrupt:
        print("👋 Stopping worker…")
    except Exception as e:
        print(f"Errors: {e}")
    finally:
        consumer.close()

if __name__ == "__main__":
    main()