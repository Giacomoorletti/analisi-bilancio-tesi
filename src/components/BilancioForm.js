// src/components/BilancioForm.js
import React, { useContext } from 'react';
import { AnalysisContext } from '../context/AnalysisContext';
import { TextField, Button, Box, Typography, Paper, Grid, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// --- COMPONENTI HELPER PER IL NUOVO FORM ---

const InputField = ({ path, label }) => {
    const { state, dispatch } = useContext(AnalysisContext);
    let value = state.datiInput;
    try { path.forEach(p => { value = value[p]; }); } catch (e) { console.error("Error accessing path:", path); return null; }
    
    const handleChange = (e) => {
        dispatch({ type: 'UPDATE_INPUT_VALUE', payload: { path, value: e.target.value } });
    };
    return (
        <Grid item xs={12} sm={6} md={4}>
            <Typography variant="caption" display="block" sx={{ mb: 0.5, height: '2.5em' }}>{label}</Typography>
            <TextField fullWidth size="small" type="number" value={value} onChange={handleChange} variant="outlined" />
        </Grid>
    );
};

const SplitField = ({ path, label }) => {
    const { state, dispatch } = useContext(AnalysisContext);
    let value = state.datiInput;
    try { path.forEach(p => { value = value[p]; }); } catch (e) { console.error("Error accessing path:", path); return null; }

    const handleChange = (e, subField) => {
        dispatch({ type: 'UPDATE_INPUT_VALUE', payload: { path, value: e.target.value, subField } });
    };
    return (
        <Grid item xs={12} sm={6} md={4}>
             <Typography variant="caption" display="block" sx={{ mb: 0.5, height: '2.5em' }}>{label}</Typography>
             <Box display="flex" gap={1}>
                <TextField fullWidth size="small" type="number" label="Entro 12 mesi" value={value.entro12Mesi} onChange={(e) => handleChange(e, 'entro12Mesi')} variant="outlined" />
                <TextField fullWidth size="small" type="number" label="Oltre 12 mesi" value={value.oltre12Mesi} onChange={(e) => handleChange(e, 'oltre12Mesi')} variant="outlined" />
             </Box>
        </Grid>
    );
};

// --- COMPONENTE PRINCIPALE ---
function BilancioForm() {
  const { dispatch } = useContext(AnalysisContext);
  const handleCalculate = () => dispatch({ type: 'CALCULATE_RESULTS' });
  const handleReset = () => dispatch({ type: 'RESET_ANALYSIS' });

  return (
    <Paper elevation={3} sx={{ padding: { xs: 1, sm: 3 }, borderRadius: 2, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Inserimento Dati (Schema Codice Civile)
      </Typography>
      
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#f0f0f0' }}>
          <Typography variant="h6">Stato Patrimoniale (Art. 2424 C.C.)</Typography>
        </AccordionSummary>
        <AccordionDetails>
            <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="subtitle1">ATTIVO</Typography></AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2} sx={{ mb: 2 }}><SplitField path={['sp', 'attivo', 'creditiVersoSoci']} label="A) Crediti v/ soci per versamenti" /></Grid>
                    <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>B) Immobilizzazioni</Typography></AccordionSummary>
                        <AccordionDetails>
                            <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>B.I) Immobilizzazioni immateriali</Typography></AccordionSummary>
                                <AccordionDetails><Grid container spacing={2}>
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'immateriali', 'costiImpiantoEAmpliamento']} label="1) Costi di impianto e ampliamento" />
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'immateriali', 'costiRicercaESviluppo']} label="2) Costi di ricerca e sviluppo" />
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'immateriali', 'dirittiBrevetti']} label="3) Diritti di brevetto e opere ingegno" />
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'immateriali', 'concessioniLicenzeMarchi']} label="4) Concessioni, licenze, marchi" />
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'immateriali', 'avviamento']} label="5) Avviamento" />
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'immateriali', 'immobilizzazioniInCorso']} label="6) Immobilizzazioni in corso e acconti" />
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'immateriali', 'altri']} label="7) Altre" />
                                </Grid></AccordionDetails>
                            </Accordion>
                            <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>B.II) Immobilizzazioni materiali</Typography></AccordionSummary>
                                <AccordionDetails><Grid container spacing={2}>
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'materiali', 'terreniEFabbricati']} label="1) Terreni e fabbricati" />
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'materiali', 'impiantiEMacchinari']} label="2) Impianti e macchinari" />
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'materiali', 'attrezzature']} label="3) Attrezzature industriali e comm." />
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'materiali', 'altriBeni']} label="4) Altri beni" />
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'materiali', 'immobilizzazioniInCorsoEAcconti']} label="5) Immobilizzazioni in corso e acconti" />
                                </Grid></AccordionDetails>
                            </Accordion>
                            <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>B.III) Immobilizzazioni finanziarie</Typography></AccordionSummary>
                                <AccordionDetails><Grid container spacing={2}>
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'finanziarie', 'partecipazioniInControllate']} label="1.a) Partecipazioni in controllate" />
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'finanziarie', 'partecipazioniInCollegate']} label="1.b) Partecipazioni in collegate" />
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'finanziarie', 'partecipazioniInControllanti']} label="1.c) Partecipazioni in controllanti" />
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'finanziarie', 'altrePartecipazioni']} label="1.d) Altre partecipazioni" />
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'finanziarie', 'creditiVersoControllate']} label="2.a) Crediti verso controllate (fin.)" />
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'finanziarie', 'creditiVersoCollegate']} label="2.b) Crediti verso collegate (fin.)" />
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'finanziarie', 'creditiVersoControllanti']} label="2.c) Crediti verso controllanti (fin.)" />
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'finanziarie', 'altriCreditiFinanziari']} label="2.d) Crediti verso altri (fin.)" />
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'finanziarie', 'altriTitoli']} label="3) Altri titoli" />
                                    <InputField path={['sp', 'attivo', 'immobilizzazioni', 'finanziarie', 'azioniProprie']} label="4) Azioni proprie" />
                                </Grid></AccordionDetails>
                            </Accordion>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>C) Attivo Circolante</Typography></AccordionSummary>
                        <AccordionDetails>
                            <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>C.I) Rimanenze</Typography></AccordionSummary>
                                <AccordionDetails><Grid container spacing={2}>
                                    <InputField path={['sp', 'attivo', 'attivoCircolante', 'rimanenze', 'materiePrimeSussidiarieConsumo']} label="1) Materie prime, sussidiarie e di consumo" />
                                    <InputField path={['sp', 'attivo', 'attivoCircolante', 'rimanenze', 'prodottiInCorsoESemilavorati']} label="2) Prodotti in corso e semilavorati" />
                                    <InputField path={['sp', 'attivo', 'attivoCircolante', 'rimanenze', 'lavoriInCorsoSuOrdinazione']} label="3) Lavori in corso su ordinazione" />
                                    <InputField path={['sp', 'attivo', 'attivoCircolante', 'rimanenze', 'prodottiFinitiEMerci']} label="4) Prodotti finiti e merci" />
                                    <InputField path={['sp', 'attivo', 'attivoCircolante', 'rimanenze', 'accontiARimanenze']} label="5) Acconti" />
                                </Grid></AccordionDetails>
                            </Accordion>
                            <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>C.II) Crediti</Typography></AccordionSummary>
                                <AccordionDetails><Grid container spacing={2}>
                                    <SplitField path={['sp', 'attivo', 'attivoCircolante', 'crediti', 'versoClienti']} label="1) Verso Clienti" />
                                    <SplitField path={['sp', 'attivo', 'attivoCircolante', 'crediti', 'versoControllate']} label="2) Verso imprese controllate" />
                                    <SplitField path={['sp', 'attivo', 'attivoCircolante', 'crediti', 'versoCollegate']} label="3) Verso imprese collegate" />
                                    <SplitField path={['sp', 'attivo', 'attivoCircolante', 'crediti', 'versoControllanti']} label="4) Verso imprese controllanti" />
                                    <InputField path={['sp', 'attivo', 'attivoCircolante', 'crediti', 'tributari']} label="4-bis) Crediti tributari" />
                                    <InputField path={['sp', 'attivo', 'attivoCircolante', 'crediti', 'perImposteAnticipate']} label="4-ter) Imposte anticipate" />
                                    <InputField path={['sp', 'attivo', 'attivoCircolante', 'crediti', 'versoAltri']} label="4-quater) Verso altri" />
                                </Grid></AccordionDetails>
                            </Accordion>
                             <Grid container spacing={2} sx={{my: 2}}><InputField path={['sp', 'attivo', 'attivoCircolante', 'attivitaFinanziarieNonImmobilizzate']} label="C.III) Attività finanziarie non immobilizzate" /></Grid>
                            <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>C.IV) Disponibilità liquide</Typography></AccordionSummary>
                                <AccordionDetails><Grid container spacing={2}>
                                    <InputField path={['sp', 'attivo', 'attivoCircolante', 'disponibilitaLiquide', 'depositiBancariEPostali']} label="1) Depositi bancari e postali" />
                                    <InputField path={['sp', 'attivo', 'attivoCircolante', 'disponibilitaLiquide', 'assegni']} label="2) Assegni" />
                                    <InputField path={['sp', 'attivo', 'attivoCircolante', 'disponibilitaLiquide', 'denaroEValoriInCassa']} label="3) Denaro e valori in cassa" />
                                </Grid></AccordionDetails>
                            </Accordion>
                        </AccordionDetails>
                    </Accordion>
                    <Grid container spacing={2} sx={{mt: 1}}><InputField path={['sp', 'attivo', 'rateiERiscontiAttivi']} label="D) Ratei e risconti attivi" /></Grid>
                </AccordionDetails>
            </Accordion>
            <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography variant="subtitle1">PASSIVO</Typography></AccordionSummary>
                <AccordionDetails>
                    <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>A) Patrimonio Netto</Typography></AccordionSummary>
                        <AccordionDetails><Grid container spacing={2}>
                            <InputField path={['sp', 'passivo', 'patrimonioNetto', 'capitale']} label="A.I) Capitale" />
                            <InputField path={['sp', 'passivo', 'patrimonioNetto', 'riservaSovrapprezzoAzioni']} label="A.II) Riserva da sovrapprezzo azioni" />
                            <InputField path={['sp', 'passivo', 'patrimonioNetto', 'riservaDaRivalutazione']} label="A.III) Riserve di rivalutazione" />
                            <InputField path={['sp', 'passivo', 'patrimonioNetto', 'riservaLegale']} label="A.IV) Riserva legale" />
                            <InputField path={['sp', 'passivo', 'patrimonioNetto', 'riserveStatutarie']} label="A.V) Riserve statutarie" />
                            <InputField path={['sp', 'passivo', 'patrimonioNetto', 'altreRiserve']} label="A.VI) Altre riserve" />
                            <InputField path={['sp', 'passivo', 'patrimonioNetto', 'riservaPerOperazioniCoperturaFlussiFinanziariAttesi']} label="A.VII) Riserva per operazioni di copertura" />
                            <InputField path={['sp', 'passivo', 'patrimonioNetto', 'utilePerditaPortataANuovo']} label="A.VIII) Utile (perdita) a nuovo" />
                            <InputField path={['sp', 'passivo', 'patrimonioNetto', 'utilePerditaEsercizio']} label="A.IX) Utile (perdita) d'esercizio" />
                            <InputField path={['sp', 'passivo', 'patrimonioNetto', 'riservaNegativaAzioniProprie']} label="A.X) Riserva negativa per azioni proprie" />
                        </Grid></AccordionDetails>
                    </Accordion>
                    <Grid container spacing={2} sx={{mt: 2}}>
                        <InputField path={['sp', 'passivo', 'fondiPerRischiEOneri']} label="B) Fondi per rischi e oneri" />
                        <InputField path={['sp', 'passivo', 'TFR']} label="C) TFR di lavoro subordinato" />
                    </Grid>
                    <Accordion sx={{mt: 2}}><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>D) Debiti</Typography></AccordionSummary>
                        <AccordionDetails><Grid container spacing={2}>
                            <SplitField path={['sp', 'passivo', 'debiti', 'obbligazioni']} label="D.1) Obbligazioni" />
                            <SplitField path={['sp', 'passivo', 'debiti', 'obbligazioniConvertibili']} label="D.2) Obbligazioni convertibili" />
                            <SplitField path={['sp', 'passivo', 'debiti', 'debitiVersoSociPerFinanziamenti']} label="D.3) Debiti verso soci per finanziamenti" />
                            <SplitField path={['sp', 'passivo', 'debiti', 'debitiVersoBanche']} label="D.4) Debiti verso banche" />
                            <SplitField path={['sp', 'passivo', 'debiti', 'debitiVersoAltriFinanziatori']} label="D.5) Debiti verso altri finanziatori" />
                            <InputField path={['sp', 'passivo', 'debiti', 'accontiDaClienti']} label="D.6) Acconti" />
                            <SplitField path={['sp', 'passivo', 'debiti', 'debitiVersoFornitori']} label="D.7) Debiti verso fornitori" />
                            <SplitField path={['sp', 'passivo', 'debiti', 'debitiRappresentatiDaTitoliDiCredito']} label="D.8) Debiti rappresentati da titoli di credito" />
                            <SplitField path={['sp', 'passivo', 'debiti', 'debitiVersoImpreseControllate']} label="D.9) Debiti verso imprese controllate" />
                            <SplitField path={['sp', 'passivo', 'debiti', 'debitiVersoImpreseCollegate']} label="D.10) Debiti verso imprese collegate" />
                            <SplitField path={['sp', 'passivo', 'debiti', 'debitiVersoImpreseControllanti']} label="D.11) Debiti verso imprese controllanti" />
                            <InputField path={['sp', 'passivo', 'debiti', 'debitiTributari']} label="D.12) Debiti tributari" />
                            <InputField path={['sp', 'passivo', 'debiti', 'debitiVersoIstitutiPrevidenza']} label="D.13) Debiti v/ istituti di previdenza" />
                            <InputField path={['sp', 'passivo', 'debiti', 'altriDebiti']} label="D.14) Altri debiti" />
                        </Grid></AccordionDetails>
                    </Accordion>
                    <Grid container spacing={2} sx={{mt: 1}}><InputField path={['sp', 'passivo', 'rateiERiscontiPassivi']} label="E) Ratei e risconti passivi" /></Grid>
                </AccordionDetails>
            </Accordion>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: '#f0f0f0' }}>
          <Typography variant="h6">Conto Economico (Art. 2425 C.C.)</Typography>
        </AccordionSummary>
        <AccordionDetails>
            <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>A) Valore della Produzione</Typography></AccordionSummary>
                <AccordionDetails><Grid container spacing={2}>
                    <InputField path={['ce', 'valoreProduzione', 'ricaviVendite']} label="A.1) Ricavi delle vendite e delle prestazioni" />
                    <InputField path={['ce', 'valoreProduzione', 'variazioniRimanenzeProdotti']} label="A.2) Variazioni rimanenze prodotti" />
                    <InputField path={['ce', 'valoreProduzione', 'variazioniLavoriInCorso']} label="A.3) Variazioni lavori in corso" />
                    <InputField path={['ce', 'valoreProduzione', 'incrementiImmobilizzazioniPerLavoriInterni']} label="A.4) Incrementi immobilizzazioni per lavori interni" />
                    <InputField path={['ce', 'valoreProduzione', 'altriRicaviEProventi']} label="A.5) Altri ricavi e proventi" />
                </Grid></AccordionDetails>
            </Accordion>
             <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>B) Costi della Produzione</Typography></AccordionSummary>
                <AccordionDetails><Grid container spacing={2}>
                    <InputField path={['ce', 'costiProduzione', 'perMateriePrime']} label="B.6) Per materie prime, suss., di consumo" />
                    <InputField path={['ce', 'costiProduzione', 'perServizi']} label="B.7) Per servizi" />
                    <InputField path={['ce', 'costiProduzione', 'perGodimentoBeniTerzi']} label="B.8) Per godimento beni di terzi" />
                    <InputField path={['ce', 'costiProduzione', 'perPersonale']} label="B.9) Per il personale" />
                    <InputField path={['ce', 'costiProduzione', 'ammortamentiESvalutazioni']} label="B.10) Ammortamenti e svalutazioni" />
                    <InputField path={['ce', 'costiProduzione', 'variazioniRimanenzeMaterie']} label="B.11) Var. rimanenze di materie prime" />
                    <InputField path={['ce', 'costiProduzione', 'accantonamentiPerRischi']} label="B.12) Accantonamenti per rischi" />
                    <InputField path={['ce', 'costiProduzione', 'altriAccantonamenti']} label="B.13) Altri accantonamenti" />
                    <InputField path={['ce', 'costiProduzione', 'oneriDiversiGestione']} label="B.14) Oneri diversi di gestione" />
                </Grid></AccordionDetails>
            </Accordion>
            <Accordion><AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>C) Proventi e Oneri Finanziari</Typography></AccordionSummary>
                <AccordionDetails><Grid container spacing={2}>
                    <InputField path={['ce', 'proventiEOneriFinanziari', 'proventiDaPartecipazioni']} label="C.15) Proventi da partecipazioni" />
                    <InputField path={['ce', 'proventiEOneriFinanziari', 'altriProventiFinanziari']} label="C.16) Altri proventi finanziari" />
                    <InputField path={['ce', 'proventiEOneriFinanziari', 'interessiEAltriOneri']} label="C.17) Interessi e altri oneri finanziari" />
                    <InputField path={['ce', 'proventiEOneriFinanziari', 'utilePerditeSuCambi']} label="C.17-bis) Utili e perdite su cambi" />
                </Grid></AccordionDetails>
            </Accordion>
            <Grid container spacing={2} sx={{mt: 2}}>
                <InputField path={['ce', 'rettificheValoreAttivitaPassivitaFinanziarie']} label="D) Rettifiche di valore di attività finanziarie" />
                <InputField path={['ce', 'imposteSulReddito']} label="20) Imposte sul reddito d'esercizio" />
            </Grid>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ marginTop: 3, display: 'flex', gap: 2 }}>
        <Button variant="contained" color="primary" onClick={handleCalculate}>Analizza Bilancio</Button>
        <Button variant="outlined" color="secondary" onClick={handleReset}>Nuova Analisi</Button>
      </Box>
    </Paper>
  );
}

export default BilancioForm;