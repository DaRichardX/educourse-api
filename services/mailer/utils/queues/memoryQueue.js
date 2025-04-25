class MemoryQueue {
  constructor() {
    this.queue = [];
  }

  async enqueue(id, payload) {
    this.queue.push({ id, payload, status: 'queued' });
    console.log(`[MemoryQueue] Job enqueued with ID: ${id}`);
  }

  async dequeue() {
    return this.queue.shift();
  }

  async peek() {
    return this.queue[0];
  }

  async length() {
    return this.queue.length;
  }

  async updateJob(id, newPayload) {
    const index = this.queue.findIndex(job => job.id === id);
    if (index !== -1) {
      this.queue[index].payload = newPayload;
    }
  }

  async updateStatus(id, newStatus) {
    const index = this.queue.findIndex(job => job.id === id);
    if (index !== -1 && this.queue[index].status !== newStatus) {
      this.queue[index].status = newStatus;
      return true; // status changed
    }
    return false; // status didn't change
  }

  async removeJob(id) {
    this.queue = this.queue.filter(job => job.id !== id);
  }

  async getAllJobs() {
    return this.queue;
  }
}

module.exports = MemoryQueue;