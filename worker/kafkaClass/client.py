
from kafka import KafkaConsumer # type: ignore
import os, json


BROKERS    = os.getenv("KAFKA_BROKERS", "localhost:19092")
GROUP_ID   = os.getenv("KAFKA_GROUP", "jobs-worker-1")
TOPIC      = os.getenv("TOPIC", "job.created")

class KafkaClient:
  def __init__(self):
    self.client = KafkaConsumer(
    TOPIC,
    bootstrap_servers= BROKERS,
    group_id=GROUP_ID,
    auto_offset_reset= "earliest",
    enable_auto_commit= True,
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )


  def run(self):
    return self.client
  
  def set_status(self, jobId:str, status:str ="In progress"):
    
    return


