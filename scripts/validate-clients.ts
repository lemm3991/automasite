import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ClientConfigSchema } from '../src/clients/schema.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '../src/clients/data');

async function main() {
  console.log('=== VALIDANDO CONFIGURAÇÕES DE CLIENTES (ZOD) ===\n');

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.ts'));
  let errorsCount = 0;
  let validCount = 0;

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    try {
      const fileUrl = 'file:///' + filePath.replace(/\\/g, '/');
      const mod = await import(fileUrl);
      const clientData = mod.default;

      const result = ClientConfigSchema.safeParse(clientData);

      if (!result.success) {
        errorsCount++;
        console.error(`❌ [FALHA] ${file}:`);
        result.error.issues.forEach(issue => {
          console.error(`   - Campo "${issue.path.join('.')}": ${issue.message}`);
        });
      } else {
        validCount++;
        console.log(`✅ [OK] ${file} -> Slug: "${result.data.slug}" | Status: [${result.data.status.toUpperCase()}]`);
      }
    } catch (err: any) {
      errorsCount++;
      console.error(`❌ [ERRO] Não foi possível carregar ${file}: ${err.message}`);
    }
  }

  console.log(`\nResumo: ${validCount} válidos, ${errorsCount} com erro.`);
  if (errorsCount > 0) {
    process.exit(1);
  } else {
    console.log('Todos os schemas validados com sucesso!');
  }
}

main().catch(err => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
