const {clean}=require('./source-evidence.cjs');
const claimTypes=['identity','service','capability','audience','infrastructure','specialization','credential','contact','quantity','none'];
const normalized=value=>clean(value).toLocaleLowerCase('pt-BR').replace(/[\p{P}\p{S}]/gu,' ').replace(/\s+/g,' ').trim();
// This is a backstop, not a semantic classifier. Every text still needs an
// independent assertion assessment; unfamiliar claims must not default to copy.
function likelyClaim(text,facts=[]) {
 const t=normalized(text);
 if(/\d|@|\b(?:saas|cpr|inteligência artificial|especializa\w*|capacidade\w*|infraestrutura|instalações|equipamentos|certific\w*|premiad\w*|conferências|assembleias|crédito|atendemos|oferecemos|oferece|dispomos|fabricamos|realizamos|exportamos|sede própria)\b/iu.test(t))return true;
 return facts.filter(f=>['service','capability','infrastructure','specialization','audience'].includes(f.kind)).some(f=>normalized(f.value).length>5&&t.includes(normalized(f.value)));
}
function assessmentErrors(binding,text,facts) {
 const a=binding.claimAssessment,errors=[];
 if(!a||!claimTypes.includes(a.type)||!a.reason||a.reason.length<20)errors.push('Avaliação semântica de alegações ausente: '+text);
 if(['editorial','interface'].includes(binding.kind)) {
  if(a?.type!=='none'||likelyClaim(text,facts))errors.push('Alegação verificável não pode ser copy livre/interface: '+text);
  if(!['aspirational','navigation','section-label'].includes(binding.editorialScope))errors.push('Escopo editorial não delimitado: '+text);
 }
 return errors;
}
module.exports={claimTypes,normalized,likelyClaim,assessmentErrors};
