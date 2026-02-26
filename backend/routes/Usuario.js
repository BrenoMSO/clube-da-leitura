import mongoose from "mongoose";
import { useDeferredValue } from "react";

const UsuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    senha: {
        type: String,
        required: true,
    }

})

export default mongoose.model("Usuario", UsuarioSchema);