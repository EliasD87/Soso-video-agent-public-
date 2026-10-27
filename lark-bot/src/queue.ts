// One job at a time: a render needs the whole 4 GB / 2-core budget of the bot's VPS user.
let tail: Promise<void> = Promise.resolve();
let pending = 0;

/** Queues the job and returns how many jobs are ahead of it (0 = it starts now). */
export function enqueue(job: () => Promise<void>): number {
  const ahead = pending++;
  tail = tail
    .then(job)
    .catch((err) => console.error("job failed", err))
    .finally(() => {
      pending--;
    });
  return ahead;
}
