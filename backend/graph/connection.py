import os
from neo4j import GraphDatabase
from functools import lru_cache

@lru_cache()
def get_driver():
    uri      = os.getenv("NEO4J_URI",     "bolt://localhost:7687")
    user     = os.getenv("NEO4J_USER",    "neo4j")
    password = os.getenv("NEO4J_PASSWORD","chhaya123")
    return GraphDatabase.driver(uri, auth=(user, password))

def get_session():
    return get_driver().session()
