// src/utils/calculationEngine.js

const sumValues = (obj) => {
  if (!obj) return 0;
  return Object.values(obj).reduce((acc, val) => {
    if (typeof val === 'object' && val !== null) {
      return acc + (parseFloat(val.entro12Mesi) || 0) + (parseFloat(val.oltre12Mesi) || 0);
    }
    return acc + (parseFloat(val) || 0);
  }, 0);
};

export function riclassificaSPFinanziario(datiInput) {
  const sp = datiInput.sp;
  if (!sp) return { aggregati: {}, quadratura: false };
  const LI = sumValues(sp.attivo.attivoCircolante.disponibilitaLiquide);
  const LD = (parseFloat(sp.attivo.attivoCircolante.crediti.versoClienti.entro12Mesi) || 0) + (parseFloat(sp.attivo.attivoCircolante.crediti.versoControllate.entro12Mesi) || 0) + (parseFloat(sp.attivo.attivoCircolante.crediti.versoCollegate.entro12Mesi) || 0) + (parseFloat(sp.attivo.attivoCircolante.crediti.versoControllanti.entro12Mesi) || 0) + (parseFloat(sp.attivo.attivoCircolante.crediti.creditiTributariVSControllanti.entro12Mesi) || 0) + (parseFloat(sp.attivo.attivoCircolante.crediti.tributari) || 0) + (parseFloat(sp.attivo.attivoCircolante.crediti.versoAltri) || 0);
  const R = sumValues(sp.attivo.attivoCircolante.rimanenze);
  const AC = LI + LD + R + sumValues(sp.attivo.attivoCircolante.attivitaFinanziarieNonImmobilizzate) + (parseFloat(sp.attivo.rateiERiscontiAttivi.entro12Mesi) || 0);
  const AI_immateriali = sumValues(sp.attivo.immobilizzazioni.immateriali);
  const AI_materiali = sumValues(sp.attivo.immobilizzazioni.materiali);
  const AI_finanziarie = sumValues(sp.attivo.immobilizzazioni.finanziarie);
  const creditiOltre12Mesi = (parseFloat(sp.attivo.attivoCircolante.crediti.versoClienti.oltre12Mesi) || 0) + (parseFloat(sp.attivo.attivoCircolante.crediti.versoControllate.oltre12Mesi) || 0) + (parseFloat(sp.attivo.attivoCircolante.crediti.versoCollegate.oltre12Mesi) || 0) + (parseFloat(sp.attivo.attivoCircolante.crediti.versoControllanti.oltre12Mesi) || 0) + (parseFloat(sp.attivo.attivoCircolante.crediti.creditiTributariVSControllanti.oltre12Mesi) || 0);
  const AI = AI_immateriali + AI_materiali + AI_finanziarie + creditiOltre12Mesi + sumValues(sp.attivo.creditiVersoSoci) + (parseFloat(sp.attivo.attivoCircolante.crediti.perImposteAnticipate) || 0) + (parseFloat(sp.attivo.rateiERiscontiAttivi.oltre12Mesi) || 0);
  const CI = AC + AI;
  const PC = (parseFloat(sp.passivo.debiti.obbligazioni.entro12Mesi) || 0) + (parseFloat(sp.passivo.debiti.obbligazioniConvertibili.entro12Mesi) || 0) + (parseFloat(sp.passivo.debiti.debitiVersoSociPerFinanziamenti.entro12Mesi) || 0) + (parseFloat(sp.passivo.debiti.debitiVersoBanche.entro12Mesi) || 0) + (parseFloat(sp.passivo.debiti.debitiVersoAltriFinanziatori.entro12Mesi) || 0) + (parseFloat(sp.passivo.debiti.accontiDaClienti) || 0) + (parseFloat(sp.passivo.debiti.debitiVersoFornitori.entro12Mesi) || 0) + (parseFloat(sp.passivo.debiti.debitiRappresentatiDaTitoliDiCredito.entro12Mesi) || 0) + (parseFloat(sp.passivo.debiti.debitiVersoImpreseControllate.entro12Mesi) || 0) + (parseFloat(sp.passivo.debiti.debitiVersoImpreseCollegate.entro12Mesi) || 0) + (parseFloat(sp.passivo.debiti.debitiVersoImpreseControllanti.entro12Mesi) || 0) + (parseFloat(sp.passivo.debiti.debitiTributari) || 0) + (parseFloat(sp.passivo.debiti.debitiVersoIstitutiPrevidenza) || 0) + (parseFloat(sp.passivo.debiti.altriDebiti) || 0) + (parseFloat(sp.passivo.rateiERiscontiPassivi.entro12Mesi) || 0) + (parseFloat(sp.passivo.fondiPerRischiEOneri.entro12Mesi) || 0) + (parseFloat(sp.passivo.TFR.entro12Mesi) || 0);
  const Pml = (parseFloat(sp.passivo.debiti.obbligazioni.oltre12Mesi) || 0) + (parseFloat(sp.passivo.debiti.obbligazioniConvertibili.oltre12Mesi) || 0) + (parseFloat(sp.passivo.debiti.debitiVersoSociPerFinanziamenti.oltre12Mesi) || 0) + (parseFloat(sp.passivo.debiti.debitiVersoBanche.oltre12Mesi) || 0) + (parseFloat(sp.passivo.debiti.debitiVersoAltriFinanziatori.oltre12Mesi) || 0) + (parseFloat(sp.passivo.debiti.debitiVersoFornitori.oltre12Mesi) || 0) + (parseFloat(sp.passivo.debiti.debitiRappresentatiDaTitoliDiCredito.oltre12Mesi) || 0) + (parseFloat(sp.passivo.debiti.debitiVersoImpreseControllate.oltre12Mesi) || 0) + (parseFloat(sp.passivo.debiti.debitiVersoImpreseCollegate.oltre12Mesi) || 0) + (parseFloat(sp.passivo.debiti.debitiVersoImpreseControllanti.oltre12Mesi) || 0) + (parseFloat(sp.passivo.TFR.oltre12Mesi) || 0) + (parseFloat(sp.passivo.fondiPerRischiEOneri.oltre12Mesi) || 0) + (parseFloat(sp.passivo.rateiERiscontiPassivi.oltre12Mesi) || 0);
  const CN = sumValues(sp.passivo.patrimonioNetto);
  const CF = PC + Pml + CN;
  const aggregati = { LI, LD, R, AC, AI, CI, PC, Pml, CN, CF, AI_materiali, AI_immateriali, AI_finanziarie }; // Corretto: no-dupe-keys
  const quadratura = Math.abs(CI - CF) < 2.0;
  return { aggregati, quadratura };
}

export function riclassificaSPFunzionale(datiInput) {
    const sp = datiInput.sp;
    if (!sp) return {};
    const totaleAttivo = sumValues(datiInput.sp.attivo);
    const totalePassivo = sumValues(datiInput.sp.passivo);
    const impieghiCaratteristiciCorrenti = sumValues(sp.attivo.attivoCircolante.rimanenze) + (parseFloat(sp.attivo.attivoCircolante.crediti.versoClienti.entro12Mesi) || 0);
    const impieghiCaratteristiciFissi = sumValues(sp.attivo.immobilizzazioni.immateriali) + sumValues(sp.attivo.immobilizzazioni.materiali);
    const capitaleInvestitoCaratteristico = impieghiCaratteristiciCorrenti + impieghiCaratteristiciFissi;
    const impieghiAccessori = totaleAttivo - capitaleInvestitoCaratteristico;
    const capitaleInvestitoNetto = totaleAttivo;
    const fontiCorrentiCaratteristiche = (parseFloat(sp.passivo.debiti.debitiVersoFornitori.entro12Mesi) || 0) + (parseFloat(sp.passivo.debiti.accontiDaClienti) || 0);
    const patrimonioNetto = sumValues(sp.passivo.patrimonioNetto);
    const debitiFinanziari = sumValues(sp.passivo.debiti.debitiVersoBanche) + sumValues(sp.passivo.debiti.obbligazioni) + sumValues(sp.passivo.debiti.debitiVersoAltriFinanziatori);
    const altreFontiNette = totalePassivo - patrimonioNetto - debitiFinanziari - fontiCorrentiCaratteristiche;
    const capitaleAcquisito = totalePassivo;
    const CCNC = impieghiCaratteristiciCorrenti - fontiCorrentiCaratteristiche;
    const quadratura = Math.abs(capitaleInvestitoNetto - capitaleAcquisito) < 2.0;
    return { 
        impieghiCaratteristiciCorrenti, impieghiCaratteristiciFissi, capitaleInvestitoCaratteristico, impieghiAccessori, capitaleInvestitoNetto,
        fontiCorrentiCaratteristiche, patrimonioNetto, debitiFinanziari, altreFontiNette, capitaleAcquisito,
        CCNC, quadratura 
    };
}

export function riclassificaSPMisto(datiInput) {
    const sp = datiInput.sp;
    if (!sp) return { quadratura: false };
    const attivoCorrenteCaratteristico = sumValues(sp.attivo.attivoCircolante.rimanenze) + (parseFloat(sp.attivo.attivoCircolante.crediti.versoClienti.entro12Mesi) || 0);
    const passivoCorrenteCaratteristico = (parseFloat(sp.passivo.debiti.debitiVersoFornitori.entro12Mesi) || 0) + (parseFloat(sp.passivo.debiti.accontiDaClienti) || 0);
    const CCNC = attivoCorrenteCaratteristico - passivoCorrenteCaratteristico;
    const attivoImmobilizzatoNetto = sumValues(sp.attivo.immobilizzazioni.materiali) + sumValues(sp.attivo.immobilizzazioni.immateriali);
    const capitaleInvestito = CCNC + attivoImmobilizzatoNetto;
    const liquidita = sumValues(sp.attivo.attivoCircolante.disponibilitaLiquide);
    const debitiFinanziari = sumValues(sp.passivo.debiti.debitiVersoBanche) + sumValues(sp.passivo.debiti.obbligazioni) + sumValues(sp.passivo.debiti.debitiVersoAltriFinanziatori);
    const PFN = debitiFinanziari - liquidita;
    const TFR = sumValues(sp.passivo.TFR);
    const patrimonioNetto = sumValues(sp.passivo.patrimonioNetto);
    const altreVociNette = capitaleInvestito - (PFN + patrimonioNetto + TFR);
    const fontiDiCopertura = PFN + patrimonioNetto + TFR + altreVociNette;
    const quadratura = Math.abs(capitaleInvestito - fontiDiCopertura) < 2.0;
    return { attivoCorrenteCaratteristico, passivoCorrenteCaratteristico, CCNC, PFN, attivoImmobilizzatoNetto, TFR, patrimonioNetto, altreVociNette, capitaleInvestito, fontiDiCopertura, quadratura };
}

export function riclassificaCEValoreAggiunto(datiInput) {
    const ce = datiInput.ce;
    if (!ce) return {};
    const valoreProduzione = sumValues(ce.valoreProduzione);
    const costiEsterni = (parseFloat(ce.costiProduzione.perMateriePrime) || 0) + (parseFloat(ce.costiProduzione.perServizi) || 0) + (parseFloat(ce.costiProduzione.perGodimentoBeniTerzi) || 0) + (parseFloat(ce.costiProduzione.variazioniRimanenzeMaterie) || 0) + (parseFloat(ce.costiProduzione.oneriDiversiGestione) || 0);
    const valoreAggiunto = valoreProduzione - costiEsterni;
    const MOL = valoreAggiunto - (parseFloat(ce.costiProduzione.perPersonale) || 0);
    const EBIT = MOL - (parseFloat(ce.costiProduzione.ammortamentiESvalutazioni) || 0) - (parseFloat(ce.costiProduzione.accantonamentiPerRischi) || 0) - (parseFloat(ce.costiProduzione.altriAccantonamenti) || 0);
    const proventiFinanziariTotali = (parseFloat(ce.proventiEOneriFinanziari.proventiDaPartecipazioni) || 0) + (parseFloat(ce.proventiEOneriFinanziari.altriProventiFinanziari) || 0) + (parseFloat(ce.proventiEOneriFinanziari.utilePerditeSuCambi) || 0);
    const oneriFinanziariTotali = (parseFloat(ce.proventiEOneriFinanziari.interessiEAltriOneri) || 0);
    const risultatoFinanziario = proventiFinanziariTotali - oneriFinanziariTotali;
    const EBT = EBIT + risultatoFinanziario + (parseFloat(ce.rettificheValoreAttivitaPassivitaFinanziarie) || 0);
    const redditoNetto = EBT - (parseFloat(ce.imposteSulReddito) || 0);
    return { valoreProduzione, costiEsterni, valoreAggiunto, MOL, EBIT, EBT, redditoNetto };
}

export function riclassificaCECostoVenduto(datiInput, EBIT_TARGET) {
    const ce = datiInput.ce;
    if (!ce) return {};
    const ricavi = (parseFloat(ce.valoreProduzione.ricaviVendite) || 0);
    const costoPersonaleVal = parseFloat(ce.costiProduzione.perPersonale) || 0;
    const costoServiziVal = parseFloat(ce.costiProduzione.perServizi) || 0;
    const ammortamentiVal = parseFloat(ce.costiProduzione.ammortamentiESvalutazioni) || 0;
    const costoDelVenduto = (parseFloat(ce.costiProduzione.perMateriePrime) || 0) + (costoPersonaleVal * 0.7) + (costoServiziVal * 0.5) + (ammortamentiVal * 0.8) + (parseFloat(ce.costiProduzione.variazioniRimanenzeMaterie) || 0);
    const margineLordoIndustriale = ricavi - costoDelVenduto;
    const costiCommerciali = (costoServiziVal * 0.5);
    const costiAmministrativi = (costoPersonaleVal * 0.3) + (ammortamentiVal * 0.2);
    const EBIT_calcolato = margineLordoIndustriale - costiCommerciali - costiAmministrativi;
    const oneriNonRipartiti = EBIT_calcolato - EBIT_TARGET;
    const proventiFinanziariTotali = (parseFloat(ce.proventiEOneriFinanziari.proventiDaPartecipazioni) || 0) + (parseFloat(ce.proventiEOneriFinanziari.altriProventiFinanziari) || 0) + (parseFloat(ce.proventiEOneriFinanziari.utilePerditeSuCambi) || 0);
    const oneriFinanziariTotali = (parseFloat(ce.proventiEOneriFinanziari.interessiEAltriOneri) || 0);
    const risultatoFinanziario = proventiFinanziariTotali - oneriFinanziariTotali;
    const EBT = EBIT_TARGET + risultatoFinanziario;
    const redditoNetto = EBT - (parseFloat(ce.imposteSulReddito) || 0);
    return { ricavi, costoDelVenduto, margineLordoIndustriale, costiCommerciali, costiAmministrativi, oneriNonRipartiti, EBIT: EBIT_TARGET, EBT, redditoNetto };
}

export function riclassificaCEMargineContributo(datiInput, EBIT_TARGET) {
    const ce = datiInput.ce;
    if (!ce) return {};
    const ricavi = (parseFloat(ce.valoreProduzione.ricaviVendite) || 0);
    const costiVariabili = (parseFloat(ce.costiProduzione.perMateriePrime) || 0) + (parseFloat(ce.costiProduzione.perServizi) || 0) * 0.5 + (parseFloat(ce.costiProduzione.perPersonale) || 0) * 0.2;
    const margineContribuzione1 = ricavi - costiVariabili;
    const costiFissi = (parseFloat(ce.costiProduzione.perServizi) || 0) * 0.5 + (parseFloat(ce.costiProduzione.perPersonale) || 0) * 0.8 + (parseFloat(ce.costiProduzione.perGodimentoBeniTerzi) || 0) + (parseFloat(ce.costiProduzione.ammortamentiESvalutazioni) || 0) + (parseFloat(ce.costiProduzione.variazioniRimanenzeMaterie) || 0) + (parseFloat(ce.costiProduzione.accantonamentiPerRischi) || 0) + (parseFloat(ce.costiProduzione.altriAccantonamenti) || 0) + (parseFloat(ce.costiProduzione.oneriDiversiGestione) || 0);
    const EBIT_calcolato = margineContribuzione1 - costiFissi;
    const oneriNonRipartiti = EBIT_calcolato - EBIT_TARGET;
    const proventiFinanziariTotali = (parseFloat(ce.proventiEOneriFinanziari.proventiDaPartecipazioni) || 0) + (parseFloat(ce.proventiEOneriFinanziari.altriProventiFinanziari) || 0) + (parseFloat(ce.proventiEOneriFinanziari.utilePerditeSuCambi) || 0);
    const oneriFinanziariTotali = (parseFloat(ce.proventiEOneriFinanziari.interessiEAltriOneri) || 0);
    const risultatoFinanziario = proventiFinanziariTotali - oneriFinanziariTotali;
    const EBT = EBIT_TARGET + risultatoFinanziario;
    const redditoNetto = EBT - (parseFloat(ce.imposteSulReddito) || 0);
    return { ricavi, costiVariabiliTotali: costiVariabili, margineContribuzione1, costiFissiTotali: costiFissi, oneriNonRipartiti, EBIT: EBIT_TARGET, EBT, redditoNetto };
}

export function calcolaIndiciCompleti(spFinanziario, ceVA, datiInput) {
    if (!spFinanziario?.aggregati || !ceVA) return {};
    const vociSP = datiInput.sp;
    const vociCE = datiInput.ce;
    const { AI, AC, CI, CN, PC, Pml, R, LI, LD, AI_materiali, AI_immateriali, AI_finanziarie } = spFinanziario.aggregati;
    const { EBIT, redditoNetto } = ceVA;
    const costoDelVenduto = (parseFloat(vociCE.costiProduzione.perMateriePrime) || 0) + (parseFloat(vociCE.costiProduzione.perPersonale) || 0) * 0.7 + (parseFloat(vociCE.costiProduzione.perServizi) || 0) * 0.5 + (parseFloat(vociCE.costiProduzione.ammortamentiESvalutazioni) || 0) * 0.8 + (parseFloat(vociCE.costiProduzione.variazioniRimanenzeMaterie) || 0);
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
    const ROS = safeDivide(EBIT, sumValues(vociCE.valoreProduzione)) * 100;
    const ROA = safeDivide(EBIT + sumValues(vociCE.proventiEOneriFinanziari), CI) * 100;
    const rotazioneCI = safeDivide(sumValues(vociCE.valoreProduzione), CI);
    const rotazioneAC = safeDivide(sumValues(vociCE.valoreProduzione), AC);
    const rotazioneRimanenze = safeDivide(costoDelVenduto, R);
    const rotazioneCrediti = safeDivide(sumValues(vociCE.valoreProduzione), (parseFloat(vociSP.attivo.attivoCircolante.crediti.versoClienti.entro12Mesi) || 0));
    const rotazioneDebiti = safeDivide(parseFloat(vociCE.costiProduzione.perMateriePrime) || 0, (parseFloat(vociSP.passivo.debiti.debitiVersoFornitori.entro12Mesi) || 0));
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