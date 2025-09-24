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

const initialState = {
  datiInput: {
    sp: {
      attivo: {
        creditiVersoSoci: { entro12Mesi: '', oltre12Mesi: '' },
        immobilizzazioni: {
          immateriali: { costiImpiantoEAmpliamento: '', costiRicercaESviluppo: '', dirittiBrevetti: '', concessioniLicenzeMarchi: '', avviamento: '', immobilizzazioniInCorso: '', altri: '' },
          materiali: { terreniEFabbricati: '', impiantiEMacchinari: '', attrezzature: '', altriBeni: '', immobilizzazioniInCorsoEAcconti: '' },
          finanziarie: { partecipazioniInControllate: '', partecipazioniInCollegate: '', partecipazioniInControllanti: '', altrePartecipazioni: '', creditiVersoControllate: '', creditiVersoCollegate: '', creditiVersoControllanti: '', altriCreditiFinanziari: '', altriTitoli: '', azioniProprie: '' }
        },
        attivoCircolante: {
          rimanenze: { materiePrimeSussidiarieConsumo: '', prodottiInCorsoESemilavorati: '', lavoriInCorsoSuOrdinazione: '', prodottiFinitiEMerci: '', accontiARimanenze: '' },
          crediti: {
            versoClienti: { entro12Mesi: '', oltre12Mesi: '' },
            versoControllate: { entro12Mesi: '', oltre12Mesi: '' },
            versoCollegate: { entro12Mesi: '', oltre12Mesi: '' },
            versoControllanti: { entro12Mesi: '', oltre12Mesi: '' },
            tributari: '', perImposteAnticipate: '', versoAltri: ''
          },
          attivitaFinanziarieNonImmobilizzate: '',
          disponibilitaLiquide: { depositiBancariEPostali: '', assegni: '', denaroEValoriInCassa: '' }
        },
        rateiERiscontiAttivi: ''
      },
      passivo: {
        patrimonioNetto: {
          capitale: '', riservaSovrapprezzoAzioni: '', riservaDaRivalutazione: '', riservaLegale: '',
          riserveStatutarie: '', altreRiserve: '', riservaPerOperazioniCoperturaFlussiFinanziariAttesi: '',
          utilePerditaPortataANuovo: '', utilePerditaEsercizio: '', riservaNegativaAzioniProprie: ''
        },
        fondiPerRischiEOneri: '',
        TFR: '',
        debiti: {
          obbligazioni: { entro12Mesi: '', oltre12Mesi: '' },
          obbligazioniConvertibili: { entro12Mesi: '', oltre12Mesi: '' },
          debitiVersoSociPerFinanziamenti: { entro12Mesi: '', oltre12Mesi: '' },
          debitiVersoBanche: { entro12Mesi: '', oltre12Mesi: '' },
          debitiVersoAltriFinanziatori: { entro12Mesi: '', oltre12Mesi: '' },
          accontiDaClienti: '',
          debitiVersoFornitori: { entro12Mesi: '', oltre12Mesi: '' },
          debitiRappresentatiDaTitoliDiCredito: { entro12Mesi: '', oltre12Mesi: '' },
          debitiVersoImpreseControllate: { entro12Mesi: '', oltre12Mesi: '' },
          debitiVersoImpreseCollegate: { entro12Mesi: '', oltre12Mesi: '' },
          debitiVersoImpreseControllanti: { entro12Mesi: '', oltre12Mesi: '' },
          debitiTributari: '',
          debitiVersoIstitutiPrevidenza: '',
          altriDebiti: ''
        },
        rateiERiscontiPassivi: ''
      }
    },
    ce: {
      valoreProduzione: { ricaviVendite: '', variazioniRimanenzeProdotti: '', variazioniLavoriInCorso: '', incrementiImmobilizzazioniPerLavoriInterni: '', altriRicaviEProventi: '' },
      costiProduzione: {
        perMateriePrime: '', perServizi: '',
        perGodimentoBeniTerzi: '', perPersonale: '',
        ammortamentiESvalutazioni: '', variazioniRimanenzeMaterie: '',
        accantonamentiPerRischi: '', altriAccantonamenti: '',
        oneriDiversiGestione: ''
      },
      proventiEOneriFinanziari: { proventiDaPartecipazioni: '', altriProventiFinanziari: '', interessiEAltriOneri: '', utilePerditeSuCambi: '' },
      rettificheValoreAttivitaPassivitaFinanziarie: '',
      imposteSulReddito: '',
    }
  },
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
      const risultatiCE_CDV = riclassificaCECostoVenduto(datiInput);
      const risultatiCE_MC = riclassificaCEMargineContributo(datiInput);
      const indici = calcolaIndiciCompleti(risultatiSPFinanziario, risultatiCE_VA, risultatiCE_CDV, datiInput);
      return {
        ...state,
        risultati: {
            spFinanziario: risultatiSPFinanziario, spFunzionale: risultatiSPFunzionale, spMisto: risultatiSPMisto,
            ceValoreAggiunto: risultatiCE_VA, ceCostoVenduto: risultatiCE_CDV, ceMargineContributo: risultatiCE_MC,
            indiciCompleti: indici,
        },
      };
    
    case 'RESET_ANALYSIS':
        return JSON.parse(JSON.stringify(initialState));

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