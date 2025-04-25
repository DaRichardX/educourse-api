const {processMailQueue} = require('../workers/mailWorker');

const runMailWorker = (queue, interval, limit) => {
  setInterval(() => {
        processMailQueue(queue, limit);
  }, interval);

  console.log(`[Worker] Mail worker initialized: every ${interval / 1000}s (${interval} ms), limit: ${limit} emails`);
};

module.exports = runMailWorker;