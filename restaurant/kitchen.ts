import Queue from 'bee-queue';
import { options } from './common/config';

export const cookQueue = new Queue('cook', options);
cookQueue.on('succeeded', (job, _) => {
    serveQueue.createJob(job.data).save();
});

export const serveQueue = new Queue('serve', options);
cookQueue.process(3, (job, done) => {
    let qty: number = job.data.qty;
    let cooked: number = 0;

    setTimeout(() => console.log("Getting the ingredients ready 🥬 🧄 🧅 🍄"), 1000);
    setTimeout(() => {
        console.log(`🍳 Preparing ${job.data.dish}`);
        job.reportProgress(10);
    }, 1500);

    let timer = setInterval(() => {
        if (cooked < qty) {
            cooked++;
            console.log(`🍳 Progress: ${cooked}/${qty} ${job.data.dish}`);
            job.reportProgress(((cooked / qty) * 90) + 10);
        } else {
            clearInterval(timer);
            console.log(`🧾 Order ${job.id}: ${job.data.dish} ready`);
            job.reportProgress(100);
            done();
        }
    }, 4000);
});
