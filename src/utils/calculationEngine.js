// src/utils/calculationEngine.js

const sumValues = (obj) => {
  if (!obj) return 0;
  return Object.values(obj).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
};

// --- FUNZIONI DI RICLASSIFICAZIONE DELLO STATO PATRIMONIALE ---

export function riclassificaSPFinanziario(datiInput) {
  const sp = datiInput.sp;
  if (!sp) return { aggregati: {}, quadratura: false };

  // 1. Calcolo Aggregati dell'ATTIVO
  const LI = sumValues(sp.attivo.attivoCircolante.disponibilitaLiquide);
  const LD = sumValues(sp.attivo.attivoCircolante.crediti) - (parseFloat(sp.attivo.attivoCircolante.crediti.perImposteAnticipate) || 0);
  const R = sumValues(sp.attivo.attivoCircolante.rimanenze);
  const AC = LI + LD + R + (parseFloat(sp.attivo.attivoCircolante.attivitaFinanziarieNonImmobilizzate) || 0) + (parseFloat(sp.attivo.rateiERiscontiAttivi) || 0);

  const AI_immateriali = sumValues(sp.attivo.immobilizzazioni.immateriali);
  const AI_materiali = sumValues(sp.attivo.immobilizzazioni.materiali);
  const AI_finanziarie = sumValues(sp.attivo.immobilizzazioni.finanziarie);
  const AI = AI_immateriali + AI_materiali + AI_finanziarie + (parseFloat(sp.attivo.attivoCircolante.crediti.perImposteAnticipate) || 0) + (parseFloat(sp.attivo.creditiVersoSoci) || 0);
  
  const CI = AC + AI;

  // 2. Calcolo Aggregati del PASSIVO (LOGICA CORRETTA)
  const PC = (parseFloat(sp.passivo.debiti.debitiVersoBanche) || 0) +
             (parseFloat(sp.passivo.debiti.accontiDaClienti) || 0) +
             (parseFloat(sp.passivo.debiti.debitiVersoFornitori) || 0) +
             (parseFloat(sp.passivo.debiti.debitiRappresentatiDaTitoliDiCredito) || 0) +
             (parseFloat(sp.passivo.debiti.debitiVersoImpreseControllate) || 0) +
             (parseFloat(sp.passivo.debiti.debitiVersoImpreseCollegate) || 0) +
             (parseFloat(sp.passivo.debiti.debitiVersoImpreseControllanti) || 0) +
             (parseFloat(sp.passivo.debiti.debitiTributari) || 0) +
             (parseFloat(sp.passivo.debiti.debitiVersoIstitutiPrevidenza) || 0) +
             (parseFloat(sp.passivo.debiti.altriDebiti) || 0) +
             (parseFloat(sp.passivo.rateiERiscontiPassivi) || 0);

  const Pml = (parseFloat(sp.passivo.debiti.obbligazioni) || 0) +
              (parseFloat(sp.passivo.debiti.obbligazioniConvertibili) || 0) +
              (parseFloat(sp.passivo.debiti.debitiVersoSociPerFinanziamenti) || 0) +
              (parseFloat(sp.passivo.debiti.debitiVersoAltriFinanziatori) || 0) +
              (parseFloat(sp.passivo.TFR) || 0) +
              (parseFloat(sp.passivo.fondiPerRischiEOneri) || 0);
  
  const CN = sumValues(sp.passivo.patrimonioNetto);
  const CF = PC + Pml + CN;
  
  const aggregati = { LI, LD, R, AC, AI, CI, PC, Pml, CN, CF, AI_materiali, AI_immateriali, AI_finanziarie };
  const quadratura = Math.abs(CI - CF) < 1.0;

  return { aggregati, quadratura };
}

export function riclassificaSPFunzionale(datiInput) {
    const sp = datiInput.sp;
    if (!sp) return {};
    const impieghiCaratteristiciCorrenti = sumValues(sp.attivo.attivoCircolante.rimanenze) + (parseFloat(sp.attivo.attivoCircolante.crediti.versoClienti) || 0);
    const impieghiCaratteristiciFissi = sumValues(sp.attivo.immobilizzazioni.immateriali) + sumValues(sp.attivo.immobilizzazioni.materiali);
    const capitaleInvestitoCaratteristico = impieghiCaratteristiciCorrenti + impieghiCaratteristiciFissi;
    const impieghiAccessori = sumValues(sp.attivo.attivoCircolante.disponibilitaLiquide) + sumValues(sp.attivo.immobilizzazioni.finanziarie) + (parseFloat(sp.attivo.attivoCircolante.attivitaFinanziarieNonImmobilizzate) || 0);
    const capitaleInvestitoNetto = capitaleInvestitoCaratteristico + impieghiAccessori;
    const fontiCorrentiCaratteristiche = (parseFloat(sp.passivo.debiti.debitiVersoFornitori) || 0) + (parseFloat(sp.passivo.debiti.accontiDaClienti) || 0);
    const CCNC = impieghiCaratteristiciCorrenti - fontiCorrentiCaratteristiche;
    const patrimonioNetto = sumValues(sp.passivo.patrimonioNetto);
    const debitiFinanziari = (parseFloat(sp.passivo.debiti.debitiVersoBanche) || 0) + (parseFloat(sp.passivo.debiti.obbligazioni) || 0) + (parseFloat(sp.passivo.debiti.debitiVersoAltriFinanziatori) || 0);
    const capitaleAcquisito = patrimonioNetto + debitiFinanziari + (parseFloat(sp.passivo.TFR) || 0);
    return { impieghiCaratteristiciCorrenti, impieghiCaratteristiciFissi, capitaleInvestitoCaratteristico, impieghiAccessori, capitaleInvestitoNetto, fontiCorrentiCaratteristiche, patrimonioNetto, debitiFinanziari, capitaleAcquisito, CCNC };
}

export function riclassificaSPMisto(datiInput) {
    const sp = datiInput.sp;
    if (!sp) return { quadratura: false };
    const attivoCorrenteCaratteristico = sumValues(sp.attivo.attivoCircolante.rimanenze) + (parseFloat(sp.attivo.attivoCircolante.crediti.versoClienti) || 0);
    const passivoCorrenteCaratteristico = (parseFloat(sp.passivo.debiti.debitiVersoFornitori) || 0) + (parseFloat(sp.passivo.debiti.accontiDaClienti) || 0);
    const CCNC = attivoCorrenteCaratteristico - passivoCorrenteCaratteristico;
    const liquidita = sumValues(sp.attivo.attivoCircolante.disponibilitaLiquide);
    const debitiFinanziari = (parseFloat(sp.passivo.debiti.debitiVersoBanche) || 0) + (parseFloat(sp.passivo.debiti.obbligazioni) || 0) + (parseFloat(sp.passivo.debiti.debitiVersoAltriFinanziatori) || 0);
    const PFN = debitiFinanziari - liquidita;
    const attivoImmobilizzatoNetto = sumValues(sp.attivo.immobilizzazioni.materiali) + sumValues(sp.attivo.immobilizzazioni.immateriali);
    const patrimonioNetto = sumValues(sp.passivo.patrimonioNetto);
    const capitaleInvestito = CCNC + attivoImmobilizzatoNetto;
    const fontiDiCopertura = PFN + patrimonioNetto + (parseFloat(sp.passivo.TFR) || 0);
    const quadratura = Math.abs(capitaleInvestito - fontiDiCopertura) < 1.0;
    return { attivoCorrenteCaratteristico, passivoCorrenteCaratteristico, CCNC, PFN, attivoImmobilizzatoNetto, patrimonioNetto, capitaleInvestito, fontiDiCopertura, quadratura };
}

export function riclassificaCEValoreAggiunto(datiInput) {
    const ce = datiInput.ce;
    if (!ce) return {};
    const valoreProduzione = sumValues(ce.valoreProduzione);
    const costiEsterni = (parseFloat(ce.costiProduzione.perMateriePrime.valore) || 0) + (parseFloat(ce.costiProduzione.perServizi.valore) || 0) + (parseFloat(ce.costiProduzione.perGodimentoBeniTerzi.valore) || 0) + (parseFloat(ce.costiProduzione.variazioniRimanenzeMaterie) || 0);
    const valoreAggiunto = valoreProduzione - costiEsterni;
    const MOL = valoreAggiunto - (parseFloat(ce.costiProduzione.perPersonale.valore) || 0);
    const EBIT = MOL - (parseFloat(ce.costiProduzione.ammortamentiESvalutazioni.valore) || 0) - (parseFloat(ce.costiProduzione.accantonamentiPerRischi) || 0) - (parseFloat(ce.costiProduzione.altriAccantonamenti) || 0);
    const risultatoFinanziario = sumValues(ce.proventiEOneriFinanziari) - (parseFloat(ce.proventiEOneriFinanziari.interessiEAltriOneri) || 0) * 2;
    const EBT = EBIT + risultatoFinanziario;
    const redditoNetto = EBT - (parseFloat(ce.imposteSulReddito) || 0);
    return { valoreProduzione, costiEsterni, valoreAggiunto, MOL, EBIT, EBT, redditoNetto };
}

export function riclassificaCECostoVenduto(datiInput) {
    const ce = datiInput.ce;
    if (!ce) return {};
    const ricavi = (parseFloat(ce.valoreProduzione.ricaviVendite) || 0);
    const costoPersonaleVal = parseFloat(ce.costiProduzione.perPersonale.valore) || 0;
    const costoServiziVal = parseFloat(ce.costiProduzione.perServizi.valore) || 0;
    const ammortamentiVal = parseFloat(ce.costiProduzione.ammortamentiESvalutazioni.valore) || 0;
    const costoDelVenduto = (parseFloat(ce.costiProduzione.perMateriePrime.valore) || 0) + (costoPersonaleVal * 0.7) + (costoServiziVal * 0.5) + (ammortamentiVal * 0.8) + (parseFloat(ce.costiProduzione.variazioniRimanenzeMaterie) || 0);
    const margineLordoIndustriale = ricavi - costoDelVenduto;
    const costiCommerciali = (costoServiziVal * 0.5);
    const costiAmministrativi = (costoPersonaleVal * 0.3) + (ammortamentiVal * 0.2);
    const EBIT = margineLordoIndustriale - costiCommerciali - costiAmministrativi;
    const risultatoFinanziario = sumValues(ce.proventiEOneriFinanziari) - (parseFloat(ce.proventiEOneriFinanziari.interessiEAltriOneri) || 0) * 2;
    const EBT = EBIT + risultatoFinanziario;
    const redditoNetto = EBT - (parseFloat(ce.imposteSulReddito) || 0);
    return { ricavi, costoDelVenduto, margineLordoIndustriale, costiCommerciali, costiAmministrativi, EBIT, EBT, redditoNetto };
}

export function riclassificaCEMargineContributo(datiInput) {
    const ce = datiInput.ce;
    if (!ce) return {};
    const ricavi = (parseFloat(ce.valoreProduzione.ricaviVendite) || 0);
    let costiVariabiliTotali = 0;
    const costiOperativiVar = ['perMateriePrime', 'perServizi', 'perPersonale', 'ammortamentiESvalutazioni', 'perGodimentoBeniTerzi'];
    costiOperativiVar.forEach(key => {
        const costo = ce.costiProduzione[key];
        if (costo && typeof costo === 'object') {
            costiVariabiliTotali += (parseFloat(costo.valore) || 0) * ((parseFloat(costo.pVar) || 0) / 100);
        }
    });
    const margineContribuzione1 = ricavi - costiVariabiliTotali;
    let costiFissiTotali = 0;
    costiOperativiVar.forEach(key => {
        const costo = ce.costiProduzione[key];
        if (costo && typeof costo === 'object') {
            costiFissiTotali += (parseFloat(costo.valore) || 0) * (1 - ((parseFloat(costo.pVar) || 0) / 100));
        }
    });
    costiFissiTotali += parseFloat(ce.costiProduzione.variazioniRimanenzeMaterie) || 0;
    costiFissiTotali += parseFloat(ce.costiProduzione.accantonamentiPerRischi) || 0;
    costiFissiTotali += parseFloat(ce.costiProduzione.altriAccantonamenti) || 0;
    costiFissiTotali += parseFloat(ce.costiProduzione.oneriDiversiGestione) || 0;
    const EBIT = margineContribuzione1 - costiFissiTotali;
    const risultatoFinanziario = sumValues(ce.proventiEOneriFinanziari) - (parseFloat(ce.proventiEOneriFinanziari.interessiEAltriOneri) || 0) * 2;
    const EBT = EBIT + risultatoFinanziario;
    const redditoNetto = EBT - (parseFloat(ce.imposteSulReddito) || 0);
    return { ricavi, costiVariabiliTotali, margineContribuzione1, costiFissiTotali, EBIT, EBT, redditoNetto };
}

export function calcolaIndiciCompleti(spFinanziario, ceVA, ceCDV, datiInput) {
  if (!spFinanziario?.aggregati || !ceVA || !ceCDV) return {};
  const vociSP = datiInput.sp;
  const vociCE = datiInput.ce;
  const { AI, AC, CI, CN, PC, Pml, R, LI, LD, AI_materiali, AI_immateriali, AI_finanziarie } = spFinanziario.aggregati;
  const { EBIT, redditoNetto } = ceVA;
  const { costoDelVenduto } = ceCDV;
  const safeDivide = (numerator, denominator) => {
    if (!denominator || denominator === 0 || isNaN(denominator)) return 0;
    return numerator / denominator;
  };
  
  const elasticitaImpieghi = safeDivide(AC, CI) * 100;
  const rigiditaImpieghi = safeDivide(AI, CI) * 100;
  const quozienteRigidita = safeDivide(AI, AC);
  const incidenzaImmMateriali = safeDivide(AI_materiali, CI) * 100;
  const incidenzaImmImmateriali = safeDivide(AI_immateriali, CI) * 100;
  const incidenzaImmFinanziarie = safeDivide(AI_finanziarie, CI) * 100;
  const autonomiaFinanziaria = safeDivide(CN, CI) * 100;
  const dipendenzaFinanziaria = safeDivide(PC + Pml, CI) * 100;
  const leverage = safeDivide(PC + Pml, CN);
  const consolidamentoPassivo = safeDivide(Pml, (PC + Pml)) * 100;
  const soliditaPatrimoniale = safeDivide(CN, parseFloat(vociSP.passivo.patrimonioNetto.capitale) || 0);
  const protezioneCapitaleSociale = safeDivide(parseFloat(vociSP.passivo.patrimonioNetto.riservaLegale) || 0, parseFloat(vociSP.passivo.patrimonioNetto.capitale) || 0);
  const quozienteDisponibilita = safeDivide(AC, PC);
  const quozienteTesoreria = safeDivide(LI + LD, PC);
  const margineStrutturaPrimario = CN - AI;
  const margineStrutturaSecondario = (CN + Pml) - AI;
  const capitaleCircolanteNetto = AC - PC;
  const margineTesoreria = (LI + LD) - PC;
  const ROE = safeDivide(redditoNetto, CN) * 100;
  const ROI = safeDivide(EBIT, CI) * 100;
  const ROS = safeDivide(EBIT, parseFloat(vociCE.valoreProduzione.ricaviVendite) || 0) * 100;
  const ROA = safeDivide(EBIT + sumValues(vociCE.proventiEOneriFinanziari), CI) * 100;
  const rotazioneCI = safeDivide(parseFloat(vociCE.valoreProduzione.ricaviVendite) || 0, CI);
  const rotazioneAC = safeDivide(parseFloat(vociCE.valoreProduzione.ricaviVendite) || 0, AC);
  const rotazioneRimanenze = safeDivide(costoDelVenduto, R);
  const rotazioneCrediti = safeDivide(parseFloat(vociCE.valoreProduzione.ricaviVendite) || 0, parseFloat(vociSP.attivo.attivoCircolante.crediti.versoClienti) || 0);
  const rotazioneDebiti = safeDivide(parseFloat(vociCE.costiProduzione.perMateriePrime.valore) || 0, parseFloat(vociSP.passivo.debiti.debitiVersoFornitori) || 0);
  const durataRimanenze = safeDivide(365, rotazioneRimanenze);
  const durataCrediti = safeDivide(365, rotazioneCrediti);
  const durataDebiti = safeDivide(365, rotazioneDebiti);
  
  return {
    struttura: { elasticitaImpieghi, rigiditaImpieghi, quozienteRigidita, incidenzaImmMateriali, incidenzaImmImmateriali, incidenzaImmFinanziarie },
    fonti: { autonomiaFinanziaria, dipendenzaFinanziaria, leverage, consolidamentoPassivo, soliditaPatrimoniale, protezioneCapitaleSociale },
    liquidita: { quozienteDisponibilita, quozienteTesoreria, margineStrutturaPrimario, margineStrutturaSecondario, capitaleCircolanteNetto, margineTesoreria },
    redditivita: { ROE, ROI, ROS, ROA },
    rotazione: { rotazioneCI, rotazioneAC, rotazioneRimanenze, rotazioneCrediti, rotazioneDebiti, durataRimanenze, durataCrediti, durataDebiti },
  };
}