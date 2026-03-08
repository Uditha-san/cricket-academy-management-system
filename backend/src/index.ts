import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/data-source';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import bookingRoutes from './routes/booking';
import adminRoutes from './routes/admin';
import coachRoutes from './routes/coach';
import facilityRoutes from './routes/facility';
import rentalRoutes from './routes/rental';
import guestReviewRoutes from './routes/guestReview';
import orderRoutes from './routes/order';
import equipmentRoutes from './routes/equipment';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/facility", facilityRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/guest-reviews", guestReviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/equipment", equipmentRoutes);

app.get('/', (req, res) => {
    res.send('Cricket Academy API is running');
});

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
    });
