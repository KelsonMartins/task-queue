import express from 'express';
import http from 'http';
import { Order } from './restaurant/models/order';
import * as waiter from './restaurant/waiter';

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get('/', (_, res) => {
    res.send("😋 We are serving freshly cooked food 🍲");
});

app.post('/order', (req, res) => {
    let order: Order = {
        dish: req.body.dish,
        qty: req.body.qty,
        orderNo: Date.now().toString(36)
    }

    if (order.dish && order.qty) {
        waiter.placeOrder(order)
            .then(() => res.json({ done: true, message: "Your order will be ready in a while" }))
            .catch(() => res.json({ done: false, message: "Your order could not be placed" }));
    } else {
        res.status(422);
    }
});

app.get('/order/:id', (req, res) => {
    let orderId = req.params.id;
    if (!orderId) {
        res.sendStatus(400);
        return;
    };

    waiter.getOrderStatus(orderId).then((result) => {
        res.json({
            progress: result.status == "succeeded" ? `Your order is ready 😊` : `Your order is ⏲ ${result.progress}% ready`,
            order: result.order,
            status: result.status
        })
    }).catch((err) => {
        res.status(500).send(err);
    });
});

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Restaurant open at:${PORT}`);
});
