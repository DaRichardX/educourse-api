// memoryQueue.js

class MemoryQueue {
    constructor() {
      this.queue = [];
    }
  
    // Enqueue a job
    async enqueue(id, payload) {
      this.queue.push({ id, payload });
      console.log(`[MemoryQueue] Job enqueued with ID: ${id}`);
    }
  
    // Dequeue a job
    async dequeue() {
      return this.queue.shift();
    }
  
    // Peek at the first job (for monitoring)
    async peek() {
      return this.queue[0];
    }
  
    // Get the length of the queue
    async length() {
      return this.queue.length;
    }
  }
  
  module.exports = MemoryQueue;