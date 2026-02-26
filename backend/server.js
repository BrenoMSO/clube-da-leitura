import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = 3000;

const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Conectado ao banco com sucesso");
    } catch (error) {
        console.log("Não conseguimos conectao ao banco", error);
    }
}

dbConnection();

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));