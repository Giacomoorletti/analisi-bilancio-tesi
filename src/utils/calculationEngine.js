// src/utils/calculationEngine.js

// --- FUNZIONE HELPER PER CREARE AGGREGATI DESCRITTIVI ---
const creaAggregato = (componenti) => {
  const valore = Object.values(componenti).reduce((acc, v) => {
    const val = (typeof v === 'object' && v !== null && typeof v.valore !== 'undefined') ? v.valore : (parseFloat(v) || 0);
    return acc + val;
  }, 0);
  return { valore, componenti };
};

const sumValues = (obj) => {
  if (!obj) return 0;
  return Object.values(obj).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
};

// --- FUNZIONI DI RICLASSIFICAZIONE ---

export function riclassificaSPFinanziario(datiInput) {
  const sp = datiInput.sp;
  if (!sp) return { aggregati: {}, quadratura: false };

  const LI = creaAggregato(sp.attivo.attivoCircolante.disponibilitaLiquide);
  const LD = creaAggregato({
    "C.II.1) Crediti v/Clienti (e/12m)": sp.attivo.attivoCircolante.crediti.versoClienti.entro12Mesi,
    "C.II.2) Crediti v/Controllate (e/12m)": sp.attivo.attivoCircolante.crediti.versoControllate.entro12Mesi,
    "C.II.3) Crediti v/Collegate (e/12m)": sp.attivo.attivoCircolante.crediti.versoCollegate.entro12Mesi,
    "C.II.4) Crediti v/Controllanti (e/12m)": sp.attivo.attivoCircolante.crediti.versoControllanti.entro12Mesi,
    "C.II.4-bis) Crediti tributari": sp.attivo.attivoCircolante.crediti.tributari,
    "C.II.4-quater) Crediti v/Altri": sp.attivo.attivoCircolante.crediti.versoAltri,
  });
  const R = creaAggregato(sp.attivo.attivoCircolante.rimanenze);
  const AC = creaAggregato({ "Liquidità Immediate (LI)": LI, "Liquidità Differite (LD)": LD, "Rimanenze (R)": R, "C.III) Attività Finanziarie non Imm.": sp.attivo.attivoCircolante.attivitaFinanziarieNonImmobilizzate, "D) Ratei e Risconti Attivi": sp.attivo.rateiERiscontiAttivi });
  const AI_immateriali = creaAggregato(sp.attivo.immobilizzazioni.immateriali);
  const AI_materiali = creaAggregato(sp.attivo.immobilizzazioni.materiali);
  const AI_finanziarie = creaAggregato(sp.attivo.immobilizzazioni.finanziarie);
  const creditiOltre12Mesi = (parseFloat(sp.attivo.attivoCircolante.crediti.versoClienti.oltre12Mesi) || 0) + (parseFloat(sp.attivo.attivoCircolante.crediti.versoControllate.oltre12Mesi) || 0) + (parseFloat(sp.attivo.attivoCircolante.crediti.versoCollegate.oltre12Mesi) || 0) + (parseFloat(sp.attivo.attivoCircolante.crediti.versoControllanti.oltre12Mesi) || 0);
  const AI = creaAggregato({ "Immobilizzazioni Immateriali": AI_immateriali, "Immobilizzazioni Materiali": AI_materiali, "Immobilizzazioni Finanziarie": AI_finanziarie, "Crediti commerciali oltre 12 mesi": creditiOltre12Mesi, "Crediti v/Soci": sumValues(sp.attivo.creditiVersoSoci), "C.II.4-ter) Imposte anticipate": sp.attivo.attivoCircolante.crediti.perImposteAnticipate });
  const CI = creaAggregato({ "Attivo Corrente (AC)": AC, "Attivo Immobilizzato (AI)": AI });
  
  const PC_componenti = {};
  Object.keys(sp.passivo.debiti).forEach(key => { if(sp.passivo.debiti[key]?.entro12Mesi) PC_componenti[`D) ${key} (e/12m)`] = sp.passivo.debiti[key].entro12Mesi; });
  PC_componenti["D.6) Acconti"] = sp.passivo.debiti.accontiDaClienti;
  PC_componenti["D.12) Debiti tributari"] = sp.passivo.debiti.debitiTributari;
  PC_componenti["D.13) Debiti v/Istituti di previdenza"] = sp.passivo.debiti.debitiVersoIstitutiPrevidenza;
  PC_componenti["D.14) Altri debiti"] = sp.passivo.debiti.altriDebiti;
  PC_componenti["E) Ratei e Risconti Passivi"] = sp.passivo.rateiERiscontiPassivi;
  const PC = creaAggregato(PC_componenti);

  const Pml_componenti = {};
  Object.keys(sp.passivo.debiti).forEach(key => { if(sp.passivo.debiti[key]?.oltre12Mesi) Pml_componenti[`D) ${key} (o/12m)`] = sp.passivo.debiti[key].oltre12Mesi; });
  Pml_componenti["C) TFR"] = sp.passivo.TFR;
  Pml_componenti["B) Fondi rischi e oneri"] = sp.passivo.fondiPerRischiEOneri;
  const Pml = creaAggregato(Pml_componenti);

  const CN = creaAggregato(sp.passivo.patrimonioNetto);
  const CF = creaAggregato({ "Passività Correnti (PC)": PC, "Passività Consolidate (Pml)": Pml, "Capitale Netto (CN)": CN });
  const quadratura = Math.abs(CI.valore - CF.valore) < 1.0;

  return { aggregati: { LI, LD, R, AC, AI, CI, PC, Pml, CN, CF, AI_materiali, AI_immateriali, AI_finanziarie }, quadratura };
}

export function riclassificaSPFunzionale(datiInput) {
    const sp = datiInput.sp;
    if (!sp) return {};
    const impieghiCaratteristiciCorrenti = creaAggregato({ "Rimanenze": sumValues(sp.attivo.attivoCircolante.rimanenze), "Crediti v/Clienti (e/12m)": sp.attivo.attivoCircolante.crediti.versoClienti.entro12Mesi });
    const impieghiCaratteristiciFissi = creaAggregato({ "Immobilizzazioni Immateriali": sumValues(sp.attivo.immobilizzazioni.immateriali), "Immobilizzazioni Materiali": sumValues(sp.attivo.immobilizzazioni.materiali) });
    const capitaleInvestitoCaratteristico = creaAggregato({ "Impieghi Correnti": impieghiCaratteristiciCorrenti, "Impieghi Fissi": impieghiCaratteristiciFissi });
    const impieghiAccessori = creaAggregato({ "Disponibilità Liquide": sumValues(sp.attivo.attivoCircolante.disponibilitaLiquide), "Immobilizzazioni Finanziarie": sumValues(sp.attivo.immobilizzazioni.finanziarie), "Attività Fin. non Imm.": sp.attivo.attivoCircolante.attivitaFinanziarieNonImmobilizzate });
    const capitaleInvestitoNetto = creaAggregato({ "Capitale Investito Caratteristico": capitaleInvestitoCaratteristico, "Impieghi Accessori": impieghiAccessori });
    const fontiCorrentiCaratteristiche = creaAggregato({ "Debiti v/Fornitori (e/12m)": sp.passivo.debiti.debitiVersoFornitori.entro12Mesi, "Acconti da Clienti": sp.passivo.debiti.accontiDaClienti });
    const CCNC = creaAggregato({ "Impieghi Caratteristici Correnti": impieghiCaratteristiciCorrenti, "Fonti Correnti Caratteristiche": -fontiCorrentiCaratteristiche.valore });
    const patrimonioNetto = creaAggregato(sp.passivo.patrimonioNetto);
    const debitiFinanziari = creaAggregato({ "Debiti v/Banche": sumValues(sp.passivo.debiti.debitiVersoBanche), "Obbligazioni": sumValues(sp.passivo.debiti.obbligazioni) });
    const capitaleAcquisito = creaAggregato({ "Patrimonio Netto": patrimonioNetto, "Debiti Finanziari": debitiFinanziari, "TFR": sp.passivo.TFR });
    
    return { impieghiCaratteristiciCorrenti, impieghiCaratteristiciFissi, capitaleInvestitoCaratteristico, impieghiAccessori, capitaleInvestitoNetto, fontiCorrentiCaratteristiche, patrimonioNetto, debitiFinanziari, capitaleAcquisito, CCNC };
}

export function riclassificaSPMisto(datiInput) {
    const sp = datiInput.sp;
    if (!sp) return { quadratura: false };
    const attivoCorrenteCaratteristico = creaAggregato({ "Rimanenze": sumValues(sp.attivo.attivoCircolante.rimanenze), "Crediti v/Clienti (e/12m)": sp.attivo.attivoCircolante.crediti.versoClienti.entro12Mesi });
    const passivoCorrenteCaratteristico = creaAggregato({ "Debiti v/Fornitori (e/12m)": sp.passivo.debiti.debitiVersoFornitori.entro12Mesi, "Acconti da Clienti": sp.passivo.debiti.accontiDaClienti });
    const CCNC = creaAggregato({ "Attivo Corrente Caratteristico": attivoCorrenteCaratteristico, "Passivo Corrente Caratteristico": -passivoCorrenteCaratteristico.valore });
    const liquidita = creaAggregato(sp.attivo.attivoCircolante.disponibilitaLiquide);
    const debitiFinanziari = creaAggregato({ "Debiti v/Banche": sumValues(sp.passivo.debiti.debitiVersoBanche), "Obbligazioni": sumValues(sp.passivo.debiti.obbligazioni) });
    const PFN = creaAggregato({ "Debiti Finanziari": debitiFinanziari, "Liquidità": -liquidita.valore });
    const attivoImmobilizzatoNetto = creaAggregato({ "Immobilizzazioni Materiali": sumValues(sp.attivo.immobilizzazioni.materiali), "Immobilizzazioni Immateriali": sumValues(sp.attivo.immobilizzazioni.immateriali) });
    const patrimonioNetto = creaAggregato(sp.passivo.patrimonioNetto);
    const capitaleInvestito = creaAggregato({ "CCNC": CCNC, "Attivo Immobilizzato Netto": attivoImmobilizzatoNetto });
    const fontiDiCopertura = creaAggregato({ "PFN": PFN, "Patrimonio Netto": patrimonioNetto, "TFR": sp.passivo.TFR });
    const quadratura = Math.abs(capitaleInvestito.valore - fontiDiCopertura.valore) < 1.0;

    return { attivoCorrenteCaratteristico, passivoCorrenteCaratteristico, CCNC, PFN, attivoImmobilizzatoNetto, patrimonioNetto, capitaleInvestito, fontiDiCopertura, quadratura };
}

export function riclassificaCEValoreAggiunto(datiInput) {
    const ce = datiInput.ce;
    if (!ce) return {};
    const valoreProduzione = creaAggregato(ce.valoreProduzione);
    const costiEsterni = creaAggregato({ "B.6) Materie prime": ce.costiProduzione.perMateriePrime, "B.7) Servizi": ce.costiProduzione.perServizi, "B.8) Godimento beni terzi": ce.costiProduzione.perGodimentoBeniTerzi, "B.11) Var. rimanenze materie": ce.costiProduzione.variazioniRimanenzeMaterie, "B.14) Oneri diversi gestione": ce.costiProduzione.oneriDiversiGestione });
    const valoreAggiunto = creaAggregato({ "Valore Produzione": valoreProduzione, "Costi Esterni": -costiEsterni.valore });
    const costoPersonale = parseFloat(ce.costiProduzione.perPersonale) || 0;
    const MOL = creaAggregato({ "Valore Aggiunto": valoreAggiunto, "Costo del Personale": -costoPersonale });
    const ammortamentiEAccantonamenti = creaAggregato({ "B.10) Ammortamenti": ce.costiProduzione.ammortamentiESvalutazioni, "B.12) Accantonamenti rischi": ce.costiProduzione.accantonamentiPerRischi, "B.13) Altri accantonamenti": ce.costiProduzione.altriAccantonamenti });
    const EBIT = creaAggregato({ "MOL": MOL, "Ammortamenti e Accantonamenti": -ammortamentiEAccantonamenti.valore });
    const risultatoFinanziario = creaAggregato({ "Proventi Finanz.": (parseFloat(ce.proventiEOneriFinanziari.proventiDaPartecipazioni) || 0) + (parseFloat(ce.proventiEOneriFinanziari.altriProventiFinanziari) || 0) + (parseFloat(ce.proventiEOneriFinanziari.utilePerditeSuCambi) || 0), "Oneri Finanz.": -(parseFloat(ce.proventiEOneriFinanziari.interessiEAltriOneri) || 0) });
    const EBT = creaAggregato({ "EBIT": EBIT, "Risultato Finanziario": risultatoFinanziario, "D) Rettifiche Finanz.": ce.rettificheValoreAttivitaPassivitaFinanziarie });
    const imposte = parseFloat(ce.imposteSulReddito) || 0;
    const redditoNetto = creaAggregato({ "EBT": EBT, "Imposte": -imposte });

    return { valoreProduzione, costiEsterni, valoreAggiunto, MOL, EBIT, EBT, redditoNetto, risultatoFinanziario, sottoTotali: { costoPersonale, ammortamentiEAccantonamenti, imposte } };
}

export function riclassificaCECostoVenduto(datiInput) {
    const ce = datiInput.ce;
    if (!ce) return {};
    const ricavi = creaAggregato({ "A.1) Ricavi vendite": ce.valoreProduzione.ricaviVendite });
    const costoDelVenduto = creaAggregato({ "B.6) Costi materie prime": ce.costiProduzione.perMateriePrime, "B.9) Costi personale (70%)": (parseFloat(ce.costiProduzione.perPersonale) || 0) * 0.7, "B.7) Costi servizi (50%)": (parseFloat(ce.costiProduzione.perServizi) || 0) * 0.5, "B.10) Ammortamenti (80%)": (parseFloat(ce.costiProduzione.ammortamentiESvalutazioni) || 0) * 0.8, "B.11) Var. rimanenze materie": ce.costiProduzione.variazioniRimanenzeMaterie });
    const margineLordoIndustriale = creaAggregato({ "Ricavi": ricavi, "Costo del Venduto": -costoDelVenduto.valore });
    const costiCommerciali = creaAggregato({ "B.7) Costi servizi (50%)": (parseFloat(ce.costiProduzione.perServizi) || 0) * 0.5 });
    const costiAmministrativi = creaAggregato({ "B.9) Costi personale (30%)": (parseFloat(ce.costiProduzione.perPersonale) || 0) * 0.3, "B.10) Ammortamenti (20%)": (parseFloat(ce.costiProduzione.ammortamentiESvalutazioni) || 0) * 0.2 });
    const EBIT = creaAggregato({ "Margine Lordo": margineLordoIndustriale, "Costi Commerciali": -costiCommerciali.valore, "Costi Amministrativi": -costiAmministrativi.valore });
    const risultatoFinanziario = creaAggregato({ "Proventi Finanz.": (parseFloat(ce.proventiEOneriFinanziari.proventiDaPartecipazioni) || 0) + (parseFloat(ce.proventiEOneriFinanziari.altriProventiFinanziari) || 0) + (parseFloat(ce.proventiEOneriFinanziari.utilePerditeSuCambi) || 0), "Oneri Finanz.": -(parseFloat(ce.proventiEOneriFinanziari.interessiEAltriOneri) || 0) });
    const EBT = creaAggregato({ "EBIT": EBIT, "Risultato Finanziario": risultatoFinanziario });
    const imposte = parseFloat(ce.imposteSulReddito) || 0;
    const redditoNetto = creaAggregato({ "EBT": EBT, "Imposte": -imposte });
    
    return { ricavi, costoDelVenduto, margineLordoIndustriale, costiCommerciali, costiAmministrativi, EBIT, EBT, redditoNetto, risultatoFinanziario, sottoTotali: { imposte } };
}

export function riclassificaCEMargineContributo(datiInput) {
    const ce = datiInput.ce;
    if (!ce) return {};
    const ricavi = creaAggregato({ "A.1) Ricavi vendite": ce.valoreProduzione.ricaviVendite });
    const costiVariabili = creaAggregato({ "Materie Prime (100%)": ce.costiProduzione.perMateriePrime, "Servizi (50%)": (parseFloat(ce.costiProduzione.perServizi) || 0) * 0.5, "Personale (20%)": (parseFloat(ce.costiProduzione.perPersonale) || 0) * 0.2 });
    const margineContribuzione1 = creaAggregato({ "Ricavi": ricavi, "Costi Variabili": -costiVariabili.valore });
    const costiFissi = creaAggregato({ "Servizi (50%)": (parseFloat(ce.costiProduzione.perServizi) || 0) * 0.5, "Personale (80%)": (parseFloat(ce.costiProduzione.perPersonale) || 0) * 0.8, "Godimento Beni Terzi": ce.costiProduzione.perGodimentoBeniTerzi, "Ammortamenti": ce.costiProduzione.ammortamentiESvalutazioni, "Altri costi": (parseFloat(ce.costiProduzione.variazioniRimanenzeMaterie) || 0) + (parseFloat(ce.costiProduzione.accantonamentiPerRischi) || 0) + (parseFloat(ce.costiProduzione.altriAccantonamenti) || 0) + (parseFloat(ce.costiProduzione.oneriDiversiGestione) || 0) });
    const EBIT = creaAggregato({ "Margine di Contribuzione": margineContribuzione1, "Costi Fissi": -costiFissi.valore });
    const risultatoFinanziario = creaAggregato(ce.proventiEOneriFinanziari);
    const EBT = creaAggregato({ "EBIT": EBIT, "Risultato Finanziario": risultatoFinanziario });
    const imposte = parseFloat(ce.imposteSulReddito) || 0;
    const redditoNetto = creaAggregato({ "EBT": EBT, "Imposte": -imposte });
    
    return { ricavi, costiVariabiliTotali: costiVariabili, margineContribuzione1, costiFissiTotali: costiFissi, EBIT, EBT, redditoNetto, risultatoFinanziario, sottoTotali: { imposte } };
}

export function calcolaIndiciCompleti(spFinanziario, ceVA, ceCDV, datiInput) {
  if (!spFinanziario?.aggregati || !ceVA) return {};
  const vociSP = datiInput.sp;
  const vociCE = datiInput.ce;
  const { AI, AC, CI, CN, PC, Pml, R, LI, LD, AI_materiali, AI_immateriali, AI_finanziarie } = spFinanziario.aggregati;
  const { EBIT, redditoNetto } = ceVA;
  const { costoDelVenduto } = ceCDV;
  const safeDivide = (numerator, denominator) => {
    const num = (typeof numerator === 'object') ? numerator.valore : numerator;
    const den = (typeof denominator === 'object') ? denominator.valore : denominator;
    if (!den || den === 0 || isNaN(den)) return 0;
    return num / den;
  };
  
  const elasticitaImpieghi = safeDivide(AC, CI) * 100;
  const rigiditaImpieghi = safeDivide(AI, CI) * 100;
  const quozienteRigidita = safeDivide(AI, AC);
  const incidenzaImmMateriali = safeDivide(AI_materiali, CI) * 100;
  const incidenzaImmImmateriali = safeDivide(AI_immateriali, CI) * 100;
  const incidenzaImmFinanziarie = safeDivide(AI_finanziarie, CI) * 100;
  const autonomiaFinanziaria = safeDivide(CN, CI) * 100;
  const dipendenzaFinanziaria = safeDivide(PC.valore + Pml.valore, CI.valore) * 100;
  const leverage = safeDivide(PC.valore + Pml.valore, CN.valore);
  const consolidamentoPassivo = safeDivide(Pml, (PC.valore + Pml.valore)) * 100;
  const soliditaPatrimoniale = safeDivide(CN, parseFloat(vociSP.passivo.patrimonioNetto.capitale) || 0);
  const protezioneCapitaleSociale = safeDivide(parseFloat(vociSP.passivo.patrimonioNetto.riservaLegale) || 0, parseFloat(vociSP.passivo.patrimonioNetto.capitale) || 0);
  const quozienteDisponibilita = safeDivide(AC, PC);
  const quozienteTesoreria = safeDivide(LI.valore + LD.valore, PC.valore);
  const margineStrutturaPrimario = CN.valore - AI.valore;
  const margineStrutturaSecondario = (CN.valore + Pml.valore) - AI.valore;
  const capitaleCircolanteNetto = AC.valore - PC.valore;
  const margineTesoreria = (LI.valore + LD.valore) - PC.valore;
  const ROE = safeDivide(redditoNetto, CN) * 100;
  const ROI = safeDivide(EBIT, CI) * 100;
  const ROS = safeDivide(EBIT, sumValues(vociCE.valoreProduzione)) * 100;
  const ROA = safeDivide(EBIT.valore + sumValues(vociCE.proventiEOneriFinanziari), CI.valore) * 100;
  const rotazioneCI = safeDivide(sumValues(vociCE.valoreProduzione), CI);
  const rotazioneAC = safeDivide(sumValues(vociCE.valoreProduzione), AC);
  const rotazioneRimanenze = safeDivide(costoDelVenduto.valore, R.valore);
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