import { Schema, model, Document, Types } from 'mongoose';

export interface IGrupo extends Document {
  nome: string;
  descricao?: string;
  codigoConvite: string;
  criadorId: Types.ObjectId;
  membros: Types.ObjectId[];
  createdAt: Date;
}

// Função utilitária para gerar código de 6 caracteres alfanuméricos maiúsculos
export const gerarCodigoConvite = (): string => {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sem caracteres ambíguos como 0, O, 1, I
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * caracteres.length);
    codigo += caracteres[randomIndex];
  }
  return codigo;
};

const GrupoSchema = new Schema<IGrupo>(
  {
    nome: {
      type: String,
      required: [true, 'O nome do grupo é obrigatório.'],
      trim: true,
      minlength: [3, 'O nome do grupo deve ter pelo menos 3 caracteres.'],
    },
    descricao: {
      type: String,
      trim: true,
      default: '',
    },
    codigoConvite: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      default: gerarCodigoConvite,
    },
    criadorId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'O criador do grupo é obrigatório.'],
    },
    membros: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
    collection: 'groups',
  }
);

export const Grupo = model<IGrupo>('Grupo', GrupoSchema);
