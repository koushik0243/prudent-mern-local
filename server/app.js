import dotenv from 'dotenv';
dotenv.config();
import './_helpers/db.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import protect from './middleware/authMiddleware.js';
import './cron/emailScheduler.js';

// Recreate __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Routes inclusion
import userRouter from './users/user.controller.js';
import contactRouter from './contacts/contact.controller.js';
import stageRouter from './stages/stage.controller.js';
import tagManagerRouter from './tag_manager/tag_manager.controller.js';
import contactStagesRouter from './contact_stages/contact_stages.controller.js';
import contactMessagesRouter from './contact_messages/contact_messages.controller.js';
import contactHistoryRouter from './contact_history/contact_history.controller.js';
import contactMailsRouter from './contact_mails/contact_mail.controller.js';
import contactSendMailsRouter from './contact_send_mails/contact_send_mail.controller.js';
import countryRouter from './countries/country.controller.js';
import stateRouter from './states/state.controller.js';
import cityRouter from './cities/city.controller.js';
import notificationMessageRouter from './notification_messages/notification_message.controller.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://prudent.thinksurfmedia.co.in',
    'https://api-prudent.thinksurfmedia.co.in',
];

app.use(cors({
   origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization, Origin, X-Requested-With, Accept, currency, timezone, country",
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use('/user', userRouter);
app.use('/contact', protect, contactRouter);
app.use('/stage', protect, stageRouter);
app.use('/tag-manager', protect, tagManagerRouter);
app.use('/contact-stage', protect, contactStagesRouter);
app.use('/contact-message', protect, contactMessagesRouter);
app.use('/contact-history', protect, contactHistoryRouter);
app.use('/contact-mail', protect, contactMailsRouter);
app.use('/contact-send-mail', protect, contactSendMailsRouter);
app.use('/country', protect, countryRouter);
app.use('/state', protect, stateRouter);
app.use('/city', protect, cityRouter);
app.use('/notification-message', protect, notificationMessageRouter);

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    status: statusCode,
    message: error.message || 'Internal server error'
  });
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

