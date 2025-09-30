// src/context/AnalysisContext.js
import React, { createContext, useReducer } from 'react';
import { 
  riclassificaSPFinanziario, 
  riclassificaSPFunzionale,
  riclassificaSPMisto,
  riclassificaCEValoreAggiunto,
  riclassificaCECostoVenduto,
  riclassificaCEMargineContributo,
  calcolaIndiciCompleti
} from '../utils/calculationEngine';

const emptyStateData = {
    sp: {
      attivo: {
        creditiVersoSoci: { entro12Mesi: '', oltre12Mesi: '' },
        immobilizzazioni: { immateriali: { costiImpiantoEAmpliamento: '', costiRicercaESviluppo: '', dirittiBrevetti: '', concessioniLicenzeMarchi: '', avviamento: '', immobilizzazioniInCorso: '', altri: '' }, materiali: { terreniEFabbricati: '', impiantiEMacchinari: '', attrezzature: '', altriBeni: '', immobilizzazioniInCorsoEAcconti: '' }, finanziarie: { partecipazioniInControllate: '', partecipazioniInCollegate: '', partecipazioniInControllanti: '', altrePartecipazioni: '', creditiVersoControllate: '', creditiVersoCollegate: '', creditiVersoControllanti: '', altriCreditiFinanziari: '', altriTitoli: '', azioniProprie: '' } },
        attivoCircolante: { rimanenze: { materiePrimeSussidiarieConsumo: '', prodottiInCorsoESemilavorati: '', lavoriInCorsoSuOrdinazione: '', prodottiFinitiEMerci: '', accontiARimanenze: '' }, crediti: { versoClienti: { entro12Mesi: '', oltre12Mesi: '' }, versoControllate: { entro12Mesi: '', oltre12Mesi: '' }, versoCollegate: { entro12Mesi: '', oltre12Mesi: '' }, versoControllanti: { entro12Mesi: '', oltre12Mesi: '' }, creditiTributariVSControllanti: { entro12Mesi: '', oltre12Mesi: '' }, tributari: '', perImposteAnticipate: '', versoAltri: '' }, attivitaFinanziarieNonImmobilizzate: { partecipazioniInControllate: '', partecipazioniInCollegate: '', partecipazioniInControllanti: '', altrePartecipazioni: '', partecipazioniInImpreseControllanti: '', azioniProprie: '', strumentiFinanziariDerivatiAttivi: '', altriTitoli: '' }, disponibilitaLiquide: { depositiBancariEPostali: '', assegni: '', denaroEValoriInCassa: '' } },
        rateiERiscontiAttivi: { entro12Mesi: '', oltre12Mesi: '' }
      },
      passivo: {
        patrimonioNetto: { capitale: '', riservaSovrapprezzoAzioni: '', riservaDaRivalutazione: '', riservaLegale: '', riserveStatutarie: '', altreRiserve: '', riservaPerOperazioniCoperturaFlussiFinanziariAttesi: '', utilePerditaPortataANuovo: '', utilePerditaEsercizio: '', riservaNegativaAzioniProprie: '' },
        fondiPerRischiEOneri: { entro12Mesi: '', oltre12Mesi: '' }, TFR: { entro12Mesi: '', oltre12Mesi: '' },
        debiti: { obbligazioni: { entro12Mesi: '', oltre12Mesi: '' }, obbligazioniConvertibili: { entro12Mesi: '', oltre12Mesi: '' }, debitiVersoSociPerFinanziamenti: { entro12Mesi: '', oltre12Mesi: '' }, debitiVersoBanche: { entro12Mesi: '', oltre12Mesi: '' }, debitiVersoAltriFinanziatori: { entro12Mesi: '', oltre12Mesi: '' }, accontiDaClienti: '', debitiVersoFornitori: { entro12Mesi: '', oltre12Mesi: '' }, debitiRappresentatiDaTitoliDiCredito: { entro12Mesi: '', oltre12Mesi: '' }, debitiVersoImpreseControllate: { entro12Mesi: '', oltre12Mesi: '' }, debitiVersoImpreseCollegate: { entro12Mesi: '', oltre12Mesi: '' }, debitiVersoImpreseControllanti: { entro12Mesi: '', oltre12Mesi: '' }, debitiTributari: '', debitiVersoIstitutiPrevidenza: '', altriDebiti: '' },
        rateiERiscontiPassivi: { entro12Mesi: '', oltre12Mesi: '' }
      }
    },
    ce: {
      valoreProduzione: { ricaviVendite: '', variazioniRimanenzeProdotti: '', variazioniLavoriInCorso: '', incrementiImmobilizzazioniPerLavoriInterni: '', altriRicaviEProventi: '' },
      costiProduzione: { perMateriePrime: '', perServizi: '', perGodimentoBeniTerzi: '', perPersonale: '', ammortamentiESvalutazioni: '', variazioniRimanenzeMaterie: '', accantonamentiPerRischi: '', altriAccantonamenti: '', oneriDiversiGestione: '' },
      proventiEOneriFinanziari: { proventiDaPartecipazioni: '', altriProventiFinanziari: '', interessiEAltriOneri: '', utilePerditeSuCambi: '' },
      rettificheValoreAttivitaPassivitaFinanziarie: '', imposteSulReddito: '',
    },
    destinazioneUtile: { aRiservaLegale: '', aRiservaStatutaria: '', aDividendi: '', portatoANuovo: '' }
};

const datiEsercitazione2023 = JSON.parse(JSON.stringify(emptyStateData));

// STATO PATRIMONIALE - ATTIVO
/*
datiEsercitazione2023.sp.attivo.immobilizzazioni.immateriali.dirittiBrevetti = '9538';
datiEsercitazione2023.sp.attivo.immobilizzazioni.immateriali.concessioniLicenzeMarchi = '1437382';
datiEsercitazione2023.sp.attivo.immobilizzazioni.immateriali.immobilizzazioniInCorso = '403734';
datiEsercitazione2023.sp.attivo.immobilizzazioni.immateriali.altri = '6581283'; // con correzione di 200€ per allinearsi al PDF
datiEsercitazione2023.sp.attivo.immobilizzazioni.materiali.altriBeni = '125767';
datiEsercitazione2023.sp.attivo.immobilizzazioni.materiali.immobilizzazioniInCorsoEAcconti = '214804';
datiEsercitazione2023.sp.attivo.attivoCircolante.rimanenze.materiePrimeSussidiarieConsumo = '1912427';
datiEsercitazione2023.sp.attivo.attivoCircolante.crediti.versoClienti.entro12Mesi = '2232515';
datiEsercitazione2023.sp.attivo.attivoCircolante.crediti.versoControllanti.entro12Mesi = '18614888';
datiEsercitazione2023.sp.attivo.attivoCircolante.crediti.tributari = '527243';
datiEsercitazione2023.sp.attivo.attivoCircolante.crediti.versoAltri = '270086';
datiEsercitazione2023.sp.attivo.attivoCircolante.disponibilitaLiquide.depositiBancariEPostali = '20290946';
datiEsercitazione2023.sp.attivo.attivoCircolante.disponibilitaLiquide.denaroEValoriInCassa = '912';
datiEsercitazione2023.sp.attivo.rateiERiscontiAttivi.entro12Mesi = '521823';
// STATO PATRIMONIALE - PASSIVO
datiEsercitazione2023.sp.passivo.patrimonioNetto.capitale = '5100000';
datiEsercitazione2023.sp.passivo.patrimonioNetto.riservaLegale = '731066';
datiEsercitazione2023.sp.passivo.patrimonioNetto.altreRiserve = '1431356';
datiEsercitazione2023.sp.passivo.patrimonioNetto.utilePerditaPortataANuovo = '6069608';
datiEsercitazione2023.sp.passivo.patrimonioNetto.utilePerditaEsercizio = '405496';
datiEsercitazione2023.sp.passivo.patrimonioNetto.riservaNegativaAzioniProprie = '-51000';
datiEsercitazione2023.sp.passivo.fondiPerRischiEOneri.entro12Mesi = '543034';
datiEsercitazione2023.sp.passivo.fondiPerRischiEOneri.oltre12Mesi = '11433659';
datiEsercitazione2023.sp.passivo.TFR.entro12Mesi = '274494';
datiEsercitazione2023.sp.passivo.TFR.oltre12Mesi = '2000000';
datiEsercitazione2023.sp.passivo.debiti.debitiVersoFornitori.entro12Mesi = '20437174';
datiEsercitazione2023.sp.passivo.debiti.debitiVersoImpreseControllanti.entro12Mesi = '57889';
datiEsercitazione2023.sp.passivo.debiti.debitiTributari = '318228';
datiEsercitazione2023.sp.passivo.debiti.debitiVersoIstitutiPrevidenza = '1605559';
datiEsercitazione2023.sp.passivo.debiti.altriDebiti = '2641034';
datiEsercitazione2023.sp.passivo.rateiERiscontiPassivi.entro12Mesi = '145751';
// CONTO ECONOMICO
datiEsercitazione2023.ce.valoreProduzione.ricaviVendite = '104515107';
datiEsercitazione2023.ce.valoreProduzione.altriRicaviEProventi = '2864119';
datiEsercitazione2023.ce.costiProduzione.perMateriePrime = '25152448';
datiEsercitazione2023.ce.costiProduzione.perServizi = '50397051';
datiEsercitazione2023.ce.costiProduzione.perGodimentoBeniTerzi = '280147';
datiEsercitazione2023.ce.costiProduzione.perPersonale = '25309308';
datiEsercitazione2023.ce.costiProduzione.ammortamentiESvalutazioni = '1056997';
datiEsercitazione2023.ce.costiProduzione.variazioniRimanenzeMaterie = '-365548';
datiEsercitazione2023.ce.costiProduzione.altriAccantonamenti = '4000000';
datiEsercitazione2023.ce.costiProduzione.oneriDiversiGestione = '1418207';
datiEsercitazione2023.ce.proventiEOneriFinanziari.altriProventiFinanziari = '354880';
datiEsercitazione2023.ce.proventiEOneriFinanziari.interessiEAltriOneri = '19241';
datiEsercitazione2023.ce.imposteSulReddito = '60759';
*/
const initialState = {
  datiInput: datiEsercitazione2023,
  risultati: null,
  vistaAttiva: { sp: 'finanziario', ce: 'valoreAggiunto' },
};

function analysisReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_INPUT_VALUE':
      const { path, value, subField } = action.payload;
      const newState = JSON.parse(JSON.stringify(state));
      let current = newState.datiInput;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      const finalKey = path[path.length - 1];
      if (subField) {
        current[finalKey][subField] = value;
      } else {
        current[finalKey] = value;
      }
      return newState;

    case 'CALCULATE_RESULTS':
      const datiInput = state.datiInput;
      
      const risultatiSPFinanziario = riclassificaSPFinanziario(datiInput);
      const risultatiSPFunzionale = riclassificaSPFunzionale(datiInput);
      const risultatiSPMisto = riclassificaSPMisto(datiInput);
      
      const risultatiCE_VA = riclassificaCEValoreAggiunto(datiInput);
      const EBIT_TARGET = risultatiCE_VA.EBIT; // Calcola l'EBIT di riferimento una sola volta
      
      // Passa l'EBIT di riferimento alle altre funzioni per garantire coerenza
      const risultatiCE_CDV = riclassificaCECostoVenduto(datiInput, EBIT_TARGET); 
      const risultatiCE_MC = riclassificaCEMargineContributo(datiInput, EBIT_TARGET);
      
      const indici = calcolaIndiciCompleti(risultatiSPFinanziario, risultatiCE_VA, datiInput);

      return {
        ...state,
        risultati: {
            spFinanziario: risultatiSPFinanziario, 
            spFunzionale: risultatiSPFunzionale, 
            spMisto: risultatiSPMisto,
            ceValoreAggiunto: risultatiCE_VA, 
            ceCostoVenduto: risultatiCE_CDV, 
            ceMargineContributo: risultatiCE_MC,
            indiciCompleti: indici,
        },
      };
    
    case 'RESET_ANALYSIS':
        return {
            ...initialState,
            datiInput: JSON.parse(JSON.stringify(emptyStateData))
        };

    case 'SET_ACTIVE_VIEW':
        return { ...state, vistaAttiva: { ...state.vistaAttiva, [action.payload.type]: action.payload.view } };

    default:
      return state;
  }
}

export const AnalysisContext = createContext();

export function AnalysisProvider({ children }) {
  const [state, dispatch] = useReducer(analysisReducer, initialState);
  return (
    <AnalysisContext.Provider value={{ state, dispatch }}>
      {children}
    </AnalysisContext.Provider>
  );
}