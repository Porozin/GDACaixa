const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Configure as coleções que deseja fazer backup
const COLLECTIONS = [
  'gda_usuarios',
  'gda_metas_doceria',
  'gda_metas_vendas',
  'gda_caixa',
  'gda_unidades',
  'gda_metas_clube',
  'gda_metas_unidade',
  'gda_privado'
];

async function runBackup() {
  console.log('🚀 Iniciando backup do Firestore...');
  
  // Verifica se temos as credenciais
  let serviceAccount;
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    console.error('❌ Erro: Variável de ambiente FIREBASE_SERVICE_ACCOUNT não encontrada.');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const db = admin.firestore();
  const backupData = {};
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  for (const collectionName of COLLECTIONS) {
    console.log(`📦 Lendo coleção: ${collectionName}...`);
    const snapshot = await db.collection(collectionName).get();
    
    backupData[collectionName] = [];
    snapshot.forEach(doc => {
      backupData[collectionName].push({
        id: doc.id,
        ...doc.data()
      });
    });
    console.log(`✅ ${backupData[collectionName].length} documentos encontrados.`);
  }

  const fileName = `backup-${timestamp}.json`;
  const filePath = path.join(backupDir, fileName);

  fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
  console.log(`\n🎉 Backup concluído com sucesso!`);
  console.log(`📄 Arquivo salvo em: ${filePath}`);
}

runBackup().catch(err => {
  console.error('❌ Erro durante o backup:', err);
  process.exit(1);
});
