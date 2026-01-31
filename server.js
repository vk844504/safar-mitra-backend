import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/calculate-distance", async (req, res) => {
    const { from, to } = req.body;

    if (!from || !to) {
        return res.status(400).json({ error: "From and To are required" });
    }

    try {
        const response = await fetch(
            "https://routes.googleapis.com/directions/v2:computeRoutes",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": process.env.GOOGLE_API_KEY,
                    "X-Goog-FieldMask": "routes.distanceMeters"
                },
                body: JSON.stringify({
                    origin: { address: from },
                    destination: { address: to },
                    travelMode: "DRIVE"
                })
            }
        );

        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
            return res.status(404).json({ error: "Route not found" });
        }

        const distanceKm = data.routes[0].distanceMeters / 1000;
        res.json({ distanceKm });

    } catch (error) {
        res.status(500).json({ error: "Failed to calculate distance" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
