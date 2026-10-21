import { Schema, model, Document, Types } from 'mongoose';

export interface ILeitura extends Document {
  usuarioId: Types.ObjectId;
  grupoId: Types.ObjectId;
  googleBookId?: string;
  tituloLivro: string;
  autor: string;
  capaUrl?: string;
  totalPaginas: number;
  paginasLidas: number;
  concluido: boolean;
  avaliacao?: number;
  createdAt: Date;
}

const LeituraSchema = new Schema<ILeitura>(
  {
    usuarioId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'O usuário da leitura é obrigatório.'],
    },
    grupoId: {
      type: Schema.Types.ObjectId,
      ref: 'Grupo',
      required: [true, 'O grupo da leitura é obrigatório.'],
    },
    googleBookId: {
      type: String,
      default: '',
    },
    tituloLivro: {
      type: String,
      required: [true, 'O título do livro é obrigatório.'],
      trim: true,
    },
    autor: {
      type: String,
      default: 'Autor Desconhecido',
      trim: true,
    },
    capaUrl: {
      type: String,
      default: '',
    },
    totalPaginas: {
      type: Number,
      required: [true, 'O total de páginas é obrigatório.'],
      min: [1, 'O total de páginas deve ser maior que zero.'],
    },
    paginasLidas: {
      type: Number,
      default: 0,
      min: [0, 'As páginas lidas não podem ser negativas.'],
    },
    concluido: {
      type: Boolean,
      default: false,
    },
    avaliacao: {
      type: Number,
      min: [1, 'A avaliação mínima é 1 estrela.'],
      max: [5, 'A avaliação máxima é 5 estrelas.'],
      validate: {
        validator: Number.isInteger,
        message: 'A avaliação deve ser um número inteiro de 1 a 5.',
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
    collection: 'readings',
  }
);

export const Leitura = model<ILeitura>('Leitura', LeituraSchema);
