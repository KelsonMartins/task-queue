import Queue from 'bee-queue';
import { options } from './common/config';
import { Order } from './common/models/order';

export const cookQueue = new Queue('cook', options);
export const placeOrder = (order: Order) => cookQueue.createJob(order).save();

export const serveQueue = new Queue('serve', options);
serveQueue.process((job, done) => {
    try {
        console.log(`🧾 ${job.data.qty}x ${job.data.dish} ready to be served 😋`);
        // Notify the client via push notification, web socket or email etc.
        done();
    } catch (error) {
        done(error);
    }
});

export const getOrderStatus = (orderId) => cookQueue.getJob(orderId)
    .then((job) => ({
        progress: job.progress,
        status: job.status,
        order: job.data
    }));

