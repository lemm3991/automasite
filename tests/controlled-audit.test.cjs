const {test}=require('node:test'),assert=require('node:assert/strict');
const {digest}=require('../scripts/lib/source-evidence.cjs');
const {factualReviewErrors,referenceErrors,requiredComparisons}=require('../scripts/lib/review-evidence.cjs');
const {validatePalette}=require('../scripts/lib/asset-evidence.cjs');
function check(text,binding,facts=[]){const t={selector:'p',text};return factualReviewErrors('','',{status:'approved',textReviews:[{id:digest('p\n'+text),reason:'Revisão contextual independente',...binding}]},{captures:[{observations:{texts:[t],images:[]}}]},{assets:[]},facts);}
const editorial={kind:'editorial',editorialScope:'aspirational',claimAssessment:{type:'none',reason:'Mensagem aspiracional sem promessa verificável de entrega'}};
test('novos serviços e capacidade não passam disfarçados de editorial ou interface',()=>{
 for(const text of ['Estrutura para assembleias societárias e conferências internacionais.','Atuação com SaaS e inteligência artificial.','Operações de crédito rural (CPR).','Oferecemos equipamentos para empresas.'])for(const kind of ['editorial','interface'])assert(check(text,{...editorial,kind}).some(e=>e.includes('não pode ser copy livre')));
});
test('criatividade editorial continua permitida com avaliação explícita',()=>{assert.deepEqual(check('Um novo olhar para o seu próximo passo.',editorial),[]);});
test('alegação desconhecida exige avaliação semântica, sem fallback positivo',()=>{assert(check('Tratamento robótico exclusivo.',{kind:'editorial',reason:'Copy nova'}).some(e=>e.includes('semântica')));});
test('fonte ampla de um serviço não comprova capacidade adicional',()=>{assert(check('Direito Digital com inteligência artificial.',{kind:'factual',factIds:['digital'],claimAssessment:{type:'service',reason:'Conferência do escopo da atuação declarada'}},[{id:'digital',kind:'service',value:'Direito Digital'}]).some(e=>e.includes('diverge')));assert.deepEqual(check('Direito Digital',{kind:'factual',factIds:['digital'],claimAssessment:{type:'service',reason:'Denominação literal da área documentada'}},[{id:'digital',kind:'service',value:'Direito Digital'}]),[]);});
test('WordPress preset sem uso não é cor institucional; logo tem prioridade',()=>{
 const c={value:'#0693e3',source:'css',status:'official',path:'site.html',sha256:'a',reason:'Cor encontrada'},candidate={...c,origin:'wordpress-preset',usageVerified:false};
 const errors=validatePalette({primary:c},{colors:[candidate]},{assets:[]});assert(errors.some(e=>e.includes('oficial exige logo')));assert(errors.some(e=>e.includes('não comprova uso')));
 const logo={value:'#e15927',source:'logo',status:'official',path:'/logo.png',sha256:'b',reason:'Pixel do logo'};
 const palette=Object.fromEntries(['background','primary','secondary','accent','text'].map(k=>[k,logo]));assert.deepEqual(validatePalette(palette,{colors:[logo]},{assets:[]}),[]);
});
test('fonte, scroll e radius isolados nunca comprovam referência forte',()=>{
 for(const codeExcerpt of ["font-family: 'Playfair Display', serif;",'scroll-behavior: smooth;','border-radius: 12px;'])assert(referenceErrors({classification:'STRONG',benefit:'Efeito visual',limitations:'Nenhuma',patterns:[]},{referenceId:'ref',codeExcerpt},[{exists:true,rendered:true}]).some(e=>e.includes('STRONG')));
});
test('referência não materializada pode ser declarada honestamente sem forçar implementação',()=>{assert.deepEqual(referenceErrors({classification:'NOT_MATERIALIZED',benefit:'Referência estudada e descartada',limitations:'Nenhum padrão implementado'},{referenceId:'ref'}),[]);});
test('PARTIAL exige presença real mas não recebe crédito STRONG',()=>{const v={classification:'PARTIAL',benefit:'Hierarquia tipográfica',limitations:'Apenas tipografia'};assert.deepEqual(referenceErrors(v,{referenceId:'ref'},[{exists:true,rendered:true}]),[]);assert(referenceErrors(v,{referenceId:'ref'},[]).length);});
test('heurística baixa não dispensa comparação perceptiva dos três mais próximos',()=>{
 const available=[{slug:'a',structuralSimilarity:12},{slug:'b',structuralSimilarity:8},{slug:'c',structuralSimilarity:15},{slug:'d',structuralSimilarity:3}];
 assert.deepEqual(requiredComparisons(available),['c','a','b']);
 assert.deepEqual(requiredComparisons(available,['d']),['d','c','a','b']);
 assert.equal(available[0].slug,'a');
});
test('toda semelhança alta exige comparação, inclusive além dos três primeiros',()=>{
 assert.deepEqual(requiredComparisons([{slug:'a',structuralSimilarity:90},{slug:'b',structuralSimilarity:85},{slug:'c',structuralSimilarity:80},{slug:'d',structuralSimilarity:65}]),['a','b','c','d']);
});
