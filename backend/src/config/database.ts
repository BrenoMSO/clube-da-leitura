import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ [Database] MONGODB_URI não foi definida nas variáveis de ambiente (.env).');
    process.exit(1);
  }

  try {
    console.log('🔄 [Database] Conectando ao MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('✅ [Database] Conexão com MongoDB estabelecida com sucesso!');
  } catch (error) {
    console.error('❌ [Database] Erro ao conectar com o MongoDB:', error);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('❌ [Database] Erro na conexão do MongoDB:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ [Database] Conexão com MongoDB perdida.');
  });
};
