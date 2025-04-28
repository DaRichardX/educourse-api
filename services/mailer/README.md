# mailer-service

Microservice that queues and automatically sends mail using Microsoft's Exchange protocol.

Queries are sent via an internal JWT system and syncs with Firestore.

Currently, the query system is implemented via an in-memory storage (not so fancy way of saying googoogaga there isn't any storage). Future implementation will use redis for queue implementations.
