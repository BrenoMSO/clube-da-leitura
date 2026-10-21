import { Schema, model, Document } from 'mongoose';

export interface IUsuario extends Document {
  nome: string;
  email: string;
  senha: string;
  createdAt: Date;
}

const UsuarioSchema = new Schema<IUsuario>(
  {
    nome: {
      type: String,
      required: [true, 'O nome é obrigatório.'],
      trim: true,
      minlength: [2, 'O nome deve ter pelo menos 2 caracteres.'],
    },
    email: {
      type: String,
      required: [true, 'O email é obrigatório.'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Por favor, informe um email válido.'],
    },
    senha: {
      type: String,
      required: [true, 'A senha é obrigatória.'],
      minlength: [6, 'A senha deve ter pelo menos 6 caracteres.'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
    collection: 'users',
    toJSON: {
      transform: (_, ret: Record<string, unknown>) => {
        delete ret.senha;
        return ret;
      },
    },
  }
);

export const Usuario = model<IUsuario>('Usuario', UsuarioSchema);
