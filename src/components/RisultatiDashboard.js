// src/components/RisultatiDashboard.js
import React, { useContext } from 'react';
import { AnalysisContext } from '../context/AnalysisContext';
import { Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, ToggleButtonGroup, ToggleButton, Divider, Tooltip, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// --- FUNZIONI HELPER PER LA FORMATTAZIONE ---
const formatCurrency = (value) => {
  if (typeof value !== 'number' || !isFinite(value)) return 'N/A';
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
};
const formatNumber = (value, decimals = 2) => {
  if (typeof value !== 'number' || !isFinite(value)) return 'N/A';
  return value.toFixed(decimals);
};
const formatPercentage = (value) => {
  if (typeof value !== 'number' || !isFinite(value)) return 'N/A';
  return `${value.toFixed(2)} %`;
};

// --- COMPONENTE HELPER PER I TOOLTIP ---
const DettaglioTooltip = ({ data }) => {
  if (!data || typeof data.componenti !== 'object' || Object.keys(data.componenti).length === 0) return null;

  const dettaglio = Object.entries(data.componenti)
    .filter(([, valore]) => {
        if (typeof valore === 'object' && valore !== null) return valore.valore !== 0 && valore.valore !== '';
        return parseFloat(valore) !== 0 && valore !== '';
    })
    .map(([key, value]) => {
        const val = typeof value === 'object' && value !== null ? value.valore : parseFloat(value);
        return `${key}: ${formatCurrency(val)}`;
    })
    .join('\n');
  
  if (!dettaglio) return null;

  return (
    <Tooltip title={<pre style={{ whiteSpace: 'pre-wrap', fontSize: '11px', margin: 0, padding: 0 }}>{dettaglio}</pre>}>
      <IconButton size="small" sx={{ ml: 0.5, p: 0.2, verticalAlign: 'middle' }}><InfoOutlinedIcon fontSize="inherit" /></IconButton>
    </Tooltip>
  );
};

// --- COMPONENTE PRINCIPALE ---
function RisultatiDashboard() {
  const { state, dispatch } = useContext(AnalysisContext);

  const handleViewChange = (type, newView) => {
    if (newView !== null) dispatch({ type: 'SET_ACTIVE_VIEW', payload: { type, view: newView } });
  };

  if (!state.risultati) return null;
  if (!state.risultati.spFinanziario.quadratura) {
    return <Alert severity="error" sx={{ mt: 4 }}>Errore di quadratura nello Stato Patrimoniale Finanziario. Controllare i dati inseriti.</Alert>;
  }

  const { spFinanziario, spFunzionale, spMisto, ceValoreAggiunto, ceCostoVenduto, ceMargineContributo, indiciCompleti } = state.risultati;

  return (
    <Paper elevation={3} sx={{ padding: { xs: 1, sm: 3 }, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>Risultati dell'Analisi</Typography>
      
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" component="h3">Stato Patrimoniale Riclassificato</Typography>
          <ToggleButtonGroup color="primary" value={state.vistaAttiva.sp} exclusive onChange={(e, view) => handleViewChange('sp', view)}>
            <ToggleButton value="finanziario">Finanziario</ToggleButton>
            <ToggleButton value="funzionale">Funzionale</ToggleButton>
            <ToggleButton value="misto">Misto</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {state.vistaAttiva.sp === 'finanziario' && spFinanziario?.aggregati && (<TableContainer component={Paper}><Table size="small"><TableHead><TableRow><TableCell sx={{fontWeight: 'bold'}}>IMPIEGHI</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>Valore</TableCell><TableCell sx={{fontWeight: 'bold'}}>FONTI</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>Valore</TableCell></TableRow></TableHead><TableBody>
            <TableRow><TableCell>Liquidità Immediate (LI)<DettaglioTooltip data={spFinanziario.aggregati.LI} /></TableCell><TableCell align="right">{formatCurrency(spFinanziario.aggregati.LI.valore)}</TableCell><TableCell>Passività Correnti (PC)<DettaglioTooltip data={spFinanziario.aggregati.PC} /></TableCell><TableCell align="right">{formatCurrency(spFinanziario.aggregati.PC.valore)}</TableCell></TableRow>
            <TableRow><TableCell>Liquidità Differite (LD)<DettaglioTooltip data={spFinanziario.aggregati.LD} /></TableCell><TableCell align="right">{formatCurrency(spFinanziario.aggregati.LD.valore)}</TableCell><TableCell>Passività Consolidate (Pml)<DettaglioTooltip data={spFinanziario.aggregati.Pml} /></TableCell><TableCell align="right">{formatCurrency(spFinanziario.aggregati.Pml.valore)}</TableCell></TableRow>
            <TableRow><TableCell>Rimanenze (R)<DettaglioTooltip data={spFinanziario.aggregati.R} /></TableCell><TableCell align="right">{formatCurrency(spFinanziario.aggregati.R.valore)}</TableCell><TableCell sx={{fontWeight: 'bold'}}>TOTALE DEBITI</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(spFinanziario.aggregati.PC.valore + spFinanziario.aggregati.Pml.valore)}</TableCell></TableRow>
            <TableRow sx={{backgroundColor: '#f0f0f0'}}><TableCell sx={{fontWeight: 'bold'}}>ATTIVO CORRENTE (AC)<DettaglioTooltip data={spFinanziario.aggregati.AC} /></TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(spFinanziario.aggregati.AC.valore)}</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow>
            <TableRow><TableCell>Attivo Immobilizzato (AI)<DettaglioTooltip data={spFinanziario.aggregati.AI} /></TableCell><TableCell align="right">{formatCurrency(spFinanziario.aggregati.AI.valore)}</TableCell><TableCell>Capitale Netto (CN)<DettaglioTooltip data={spFinanziario.aggregati.CN} /></TableCell><TableCell align="right">{formatCurrency(spFinanziario.aggregati.CN.valore)}</TableCell></TableRow>
            <TableRow sx={{borderTop: '2px solid black', backgroundColor: '#e0e0e0'}}><TableCell sx={{fontWeight: 'bold'}}>TOTALE IMPIEGHI (CI)</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(spFinanziario.aggregati.CI.valore)}</TableCell><TableCell sx={{fontWeight: 'bold'}}>TOTALE FONTI (CF)</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(spFinanziario.aggregati.CF.valore)}</TableCell></TableRow>
        </TableBody></Table></TableContainer>)}
        {state.vistaAttiva.sp === 'funzionale' && spFunzionale && (<TableContainer component={Paper}><Table size="small"><TableHead><TableRow><TableCell sx={{fontWeight: 'bold'}}>IMPIEGHI</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>Valore</TableCell><TableCell sx={{fontWeight: 'bold'}}>FONTI</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>Valore</TableCell></TableRow></TableHead><TableBody><TableRow><TableCell sx={{pl:2}}>Impieghi Caratteristici Correnti<DettaglioTooltip data={spFunzionale.impieghiCaratteristiciCorrenti} /></TableCell><TableCell align="right">{formatCurrency(spFunzionale.impieghiCaratteristiciCorrenti.valore)}</TableCell><TableCell sx={{pl:2}}>Fonti Correnti Caratteristiche<DettaglioTooltip data={spFunzionale.fontiCorrentiCaratteristiche} /></TableCell><TableCell align="right">{formatCurrency(spFunzionale.fontiCorrentiCaratteristiche.valore)}</TableCell></TableRow><TableRow><TableCell sx={{pl:2}}>Impieghi Caratteristici Fissi<DettaglioTooltip data={spFunzionale.impieghiCaratteristiciFissi} /></TableCell><TableCell align="right">{formatCurrency(spFunzionale.impieghiCaratteristiciFissi.valore)}</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow><TableRow sx={{backgroundColor: '#f0f0f0'}}><TableCell sx={{fontWeight: 'bold'}}>= Capitale Investito Caratteristico<DettaglioTooltip data={spFunzionale.capitaleInvestitoCaratteristico} /></TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(spFunzionale.capitaleInvestitoCaratteristico.valore)}</TableCell><TableCell sx={{fontWeight: 'bold'}}>= Capitale Circolante Netto Caratt. (CCNC)</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(spFunzionale.CCNC.valore)}</TableCell></TableRow><TableRow><TableCell sx={{pl:2}}>+ Impieghi Accessori<DettaglioTooltip data={spFunzionale.impieghiAccessori} /></TableCell><TableCell align="right">{formatCurrency(spFunzionale.impieghiAccessori.valore)}</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow><TableRow sx={{borderTop: '2px solid black', backgroundColor: '#e0e0e0'}}><TableCell sx={{fontWeight: 'bold'}}>TOTALE CAPITALE INVESTITO NETTO</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(spFunzionale.capitaleInvestitoNetto.valore)}</TableCell><TableCell sx={{fontWeight: 'bold'}}>TOTALE CAPITALE ACQUISITO</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(spFunzionale.capitaleAcquisito.valore)}</TableCell></TableRow><TableRow><TableCell></TableCell><TableCell></TableCell><TableCell sx={{pl:2}}>di cui Patrimonio Netto<DettaglioTooltip data={spFunzionale.patrimonioNetto} /></TableCell><TableCell align="right">{formatCurrency(spFunzionale.patrimonioNetto.valore)}</TableCell></TableRow><TableRow><TableCell></TableCell><TableCell></TableCell><TableCell sx={{pl:2}}>di cui Debiti Finanziari<DettaglioTooltip data={spFunzionale.debitiFinanziari} /></TableCell><TableCell align="right">{formatCurrency(spFunzionale.debitiFinanziari.valore)}</TableCell></TableRow></TableBody></Table></TableContainer>)}
        {state.vistaAttiva.sp === 'misto' && spMisto && (<TableContainer component={Paper}><Table size="small"><TableHead><TableRow><TableCell sx={{fontWeight: 'bold'}}>CAPITALE INVESTITO</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>Valore</TableCell><TableCell sx={{fontWeight: 'bold'}}>FONTI DI COPERTURA</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>Valore</TableCell></TableRow></TableHead><TableBody><TableRow><TableCell sx={{pl:2}}>Attivo Corrente Caratteristico<DettaglioTooltip data={spMisto.attivoCorrenteCaratteristico} /></TableCell><TableCell align="right">{formatCurrency(spMisto.attivoCorrenteCaratteristico.valore)}</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow><TableRow><TableCell sx={{pl:4}}>- Passivo Corrente Caratteristico<DettaglioTooltip data={spMisto.passivoCorrenteCaratteristico} /></TableCell><TableCell align="right">{formatCurrency(spMisto.passivoCorrenteCaratteristico.valore)}</TableCell><TableCell></TableCell><TableCell></TableCell></TableRow><TableRow sx={{backgroundColor: '#f0f0f0'}}><TableCell sx={{fontWeight: 'bold'}}>= Capitale Circolante Netto Caratt. (CCNC)</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(spMisto.CCNC.valore)}</TableCell><TableCell sx={{fontWeight: 'bold'}}>Posizione Finanziaria Netta (PFN)<DettaglioTooltip data={spMisto.PFN} /></TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(spMisto.PFN.valore)}</TableCell></TableRow><TableRow><TableCell sx={{pl:2}}>+ Attivo Immobilizzato Netto<DettaglioTooltip data={spMisto.attivoImmobilizzatoNetto} /></TableCell><TableCell align="right">{formatCurrency(spMisto.attivoImmobilizzatoNetto.valore)}</TableCell><TableCell sx={{pl:2}}>Patrimonio Netto<DettaglioTooltip data={spMisto.patrimonioNetto} /></TableCell><TableCell align="right">{formatCurrency(spMisto.patrimonioNetto.valore)}</TableCell></TableRow><TableRow sx={{borderTop: '2px solid black', backgroundColor: '#e0e0e0'}}><TableCell sx={{fontWeight: 'bold'}}>TOTALE CAPITALE INVESTITO</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(spMisto.capitaleInvestito.valore)}</TableCell><TableCell sx={{fontWeight: 'bold'}}>TOTALE FONTI DI COPERTURA</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(spMisto.fontiDiCopertura.valore)}</TableCell></TableRow></TableBody></Table></TableContainer>)}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6" component="h3">Conto Economico Riclassificato</Typography>
          <ToggleButtonGroup color="primary" value={state.vistaAttiva.ce} exclusive onChange={(e, view) => handleViewChange('ce', view)}>
            <ToggleButton value="valoreAggiunto">Valore Aggiunto</ToggleButton>
            <ToggleButton value="costoVenduto">Costo Venduto</ToggleButton>
            <ToggleButton value="margineContributo">Margine Contribuzione</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {state.vistaAttiva.ce === 'valoreAggiunto' && ceValoreAggiunto && (<TableContainer component={Paper}><Table size="small"><TableBody><TableRow><TableCell>Valore della Produzione<DettaglioTooltip data={ceValoreAggiunto.valoreProduzione} /></TableCell><TableCell align="right">{formatCurrency(ceValoreAggiunto.valoreProduzione.valore)}</TableCell></TableRow><TableRow><TableCell sx={{pl:4}}>- Costi Esterni<DettaglioTooltip data={ceValoreAggiunto.costiEsterni} /></TableCell><TableCell align="right">{formatCurrency(ceValoreAggiunto.costiEsterni.valore)}</TableCell></TableRow><TableRow sx={{fontWeight: 'bold', backgroundColor: '#f0f0f0'}}><TableCell sx={{fontWeight: 'bold'}}>= Valore Aggiunto</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(ceValoreAggiunto.valoreAggiunto.valore)}</TableCell></TableRow><TableRow><TableCell sx={{pl:4}}>- Costo del Personale</TableCell><TableCell align="right">{formatCurrency(ceValoreAggiunto.sottoTotali.costoPersonale)}</TableCell></TableRow><TableRow sx={{fontWeight: 'bold', backgroundColor: '#f0f0f0'}}><TableCell sx={{fontWeight: 'bold'}}>= Margine Operativo Lordo (MOL)</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(ceValoreAggiunto.MOL.valore)}</TableCell></TableRow><TableRow><TableCell sx={{pl:4}}>- Ammortamenti e Accantonamenti<DettaglioTooltip data={ceValoreAggiunto.sottoTotali.ammortamentiEAccantonamenti} /></TableCell><TableCell align="right">{formatCurrency(ceValoreAggiunto.sottoTotali.ammortamentiEAccantonamenti.valore)}</TableCell></TableRow><TableRow sx={{fontWeight: 'bold', backgroundColor: '#e0e0e0'}}><TableCell sx={{fontWeight: 'bold'}}>= Reddito Operativo (EBIT)</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(ceValoreAggiunto.EBIT.valore)}</TableCell></TableRow><TableRow><TableCell sx={{pl:4}}>-/+ Risultato Finanziario<DettaglioTooltip data={ceValoreAggiunto.risultatoFinanziario} /></TableCell><TableCell align="right">{formatCurrency(ceValoreAggiunto.risultatoFinanziario.valore)}</TableCell></TableRow><TableRow sx={{fontWeight: 'bold'}}><TableCell sx={{fontWeight: 'bold'}}>= Risultato prima delle Imposte (EBT)</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(ceValoreAggiunto.EBT.valore)}</TableCell></TableRow><TableRow><TableCell sx={{pl:4}}>- Imposte sul Reddito</TableCell><TableCell align="right">{formatCurrency(ceValoreAggiunto.sottoTotali.imposte)}</TableCell></TableRow><TableRow sx={{fontWeight: 'bold', borderTop: '2px solid black', backgroundColor: '#e0e0e0'}}><TableCell sx={{fontWeight: 'bold'}}>= Reddito Netto</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(ceValoreAggiunto.redditoNetto.valore)}</TableCell></TableRow></TableBody></Table></TableContainer>)}
        {state.vistaAttiva.ce === 'costoVenduto' && ceCostoVenduto && (<TableContainer component={Paper}><Table size="small"><TableBody><TableRow><TableCell>Ricavi di Vendita<DettaglioTooltip data={ceCostoVenduto.ricavi} /></TableCell><TableCell align="right">{formatCurrency(ceCostoVenduto.ricavi.valore)}</TableCell></TableRow><TableRow><TableCell sx={{pl:4}}>- Costo del Venduto<DettaglioTooltip data={ceCostoVenduto.costoDelVenduto} /></TableCell><TableCell align="right">{formatCurrency(ceCostoVenduto.costoDelVenduto.valore)}</TableCell></TableRow><TableRow sx={{fontWeight: 'bold', backgroundColor: '#f0f0f0'}}><TableCell sx={{fontWeight: 'bold'}}>= Margine Lordo Industriale</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(ceCostoVenduto.margineLordoIndustriale.valore)}</TableCell></TableRow><TableRow><TableCell sx={{pl:4}}>- Costi Commerciali e Distribuzione<DettaglioTooltip data={ceCostoVenduto.costiCommerciali} /></TableCell><TableCell align="right">{formatCurrency(ceCostoVenduto.costiCommerciali.valore)}</TableCell></TableRow><TableRow><TableCell sx={{pl:4}}>- Costi Amministrativi e Generali<DettaglioTooltip data={ceCostoVenduto.costiAmministrativi} /></TableCell><TableCell align="right">{formatCurrency(ceCostoVenduto.costiAmministrativi.valore)}</TableCell></TableRow><TableRow sx={{fontWeight: 'bold', backgroundColor: '#e0e0e0'}}><TableCell sx={{fontWeight: 'bold'}}>= Reddito Operativo (EBIT)</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(ceCostoVenduto.EBIT.valore)}</TableCell></TableRow><TableRow><TableCell sx={{pl:4}}>-/+ Risultato Finanziario<DettaglioTooltip data={ceCostoVenduto.risultatoFinanziario} /></TableCell><TableCell align="right">{formatCurrency(ceCostoVenduto.risultatoFinanziario.valore)}</TableCell></TableRow><TableRow sx={{fontWeight: 'bold'}}><TableCell sx={{fontWeight: 'bold'}}>= Risultato prima delle Imposte (EBT)</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(ceCostoVenduto.EBT.valore)}</TableCell></TableRow><TableRow><TableCell sx={{pl:4}}>- Imposte sul Reddito</TableCell><TableCell align="right">{formatCurrency(ceCostoVenduto.sottoTotali.imposte)}</TableCell></TableRow><TableRow sx={{fontWeight: 'bold', borderTop: '2px solid black', backgroundColor: '#e0e0e0'}}><TableCell sx={{fontWeight: 'bold'}}>= Reddito Netto</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(ceCostoVenduto.redditoNetto.valore)}</TableCell></TableRow></TableBody></Table></TableContainer>)}
        {state.vistaAttiva.ce === 'margineContributo' && ceMargineContributo && (<TableContainer component={Paper}><Table size="small"><TableBody><TableRow><TableCell>Ricavi di Vendita<DettaglioTooltip data={ceMargineContributo.ricavi} /></TableCell><TableCell align="right">{formatCurrency(ceMargineContributo.ricavi.valore)}</TableCell></TableRow><TableRow><TableCell sx={{pl:4}}>- Costi Variabili Totali<DettaglioTooltip data={ceMargineContributo.costiVariabiliTotali} /></TableCell><TableCell align="right">{formatCurrency(ceMargineContributo.costiVariabiliTotali.valore)}</TableCell></TableRow><TableRow sx={{fontWeight: 'bold', backgroundColor: '#f0f0f0'}}><TableCell sx={{fontWeight: 'bold'}}>= Margine di Contribuzione</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(ceMargineContributo.margineContribuzione1.valore)}</TableCell></TableRow><TableRow><TableCell sx={{pl:4}}>- Costi Fissi Totali<DettaglioTooltip data={ceMargineContributo.costiFissiTotali} /></TableCell><TableCell align="right">{formatCurrency(ceMargineContributo.costiFissiTotali.valore)}</TableCell></TableRow><TableRow sx={{fontWeight: 'bold', backgroundColor: '#e0e0e0'}}><TableCell sx={{fontWeight: 'bold'}}>= Reddito Operativo (EBIT)</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(ceMargineContributo.EBIT.valore)}</TableCell></TableRow><TableRow><TableCell sx={{pl:4}}>-/+ Risultato Finanziario<DettaglioTooltip data={ceMargineContributo.risultatoFinanziario} /></TableCell><TableCell align="right">{formatCurrency(ceMargineContributo.risultatoFinanziario.valore)}</TableCell></TableRow><TableRow sx={{fontWeight: 'bold'}}><TableCell sx={{fontWeight: 'bold'}}>= Risultato prima delle Imposte (EBT)</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(ceMargineContributo.EBT.valore)}</TableCell></TableRow><TableRow><TableCell sx={{pl:4}}>- Imposte sul Reddito</TableCell><TableCell align="right">{formatCurrency(ceMargineContributo.sottoTotali.imposte)}</TableCell></TableRow><TableRow sx={{fontWeight: 'bold', borderTop: '2px solid black', backgroundColor: '#e0e0e0'}}><TableCell sx={{fontWeight: 'bold'}}>= Reddito Netto</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>{formatCurrency(ceMargineContributo.redditoNetto.valore)}</TableCell></TableRow></TableBody></Table></TableContainer>)}
      </Box>

      <Divider sx={{ my: 4 }} />
      
      {indiciCompleti && (<Box sx={{ my: 4 }}>
         <Typography variant="h6" component="h3" gutterBottom>Sistema Completo degli Indici di Bilancio</Typography>
        <TableContainer component={Paper}>
             <Table size="small">
                <TableHead><TableRow><TableCell sx={{fontWeight: 'bold'}}>Area di Analisi</TableCell><TableCell sx={{fontWeight: 'bold'}}>Indicatore</TableCell><TableCell align="right" sx={{fontWeight: 'bold'}}>Valore</TableCell></TableRow></TableHead>
                <TableBody>
                  <TableRow><TableCell rowSpan={6} sx={{fontWeight: 'bold', verticalAlign:'top'}}>Struttura Impieghi</TableCell><TableCell>Elasticità (AC / CI)</TableCell><TableCell align="right">{formatPercentage(indiciCompleti.struttura.elasticitaImpieghi)}</TableCell></TableRow>
                  <TableRow><TableCell>Rigidità (AI / CI)</TableCell><TableCell align="right">{formatPercentage(indiciCompleti.struttura.rigiditaImpieghi)}</TableCell></TableRow>
                  <TableRow><TableCell>Quoziente di Rigidità (AI / AC)</TableCell><TableCell align="right">{formatNumber(indiciCompleti.struttura.quozienteRigidita)}</TableCell></TableRow>
                  <TableRow><TableCell>Incidenza Imm. Materiali</TableCell><TableCell align="right">{formatPercentage(indiciCompleti.struttura.incidenzaImmMateriali)}</TableCell></TableRow>
                  <TableRow><TableCell>Incidenza Imm. Immateriali</TableCell><TableCell align="right">{formatPercentage(indiciCompleti.struttura.incidenzaImmImmateriali)}</TableCell></TableRow>
                  <TableRow><TableCell>Incidenza Imm. Finanziarie</TableCell><TableCell align="right">{formatPercentage(indiciCompleti.struttura.incidenzaImmFinanziarie)}</TableCell></TableRow>
                  <TableRow><TableCell rowSpan={6} sx={{fontWeight: 'bold', verticalAlign:'top'}}>Struttura Fonti</TableCell><TableCell>Autonomia Finanziaria (CN / CI)</TableCell><TableCell align="right">{formatPercentage(indiciCompleti.fonti.autonomiaFinanziaria)}</TableCell></TableRow>
                  <TableRow><TableCell>Dipendenza Finanziaria (Debiti / CI)</TableCell><TableCell align="right">{formatPercentage(indiciCompleti.fonti.dipendenzaFinanziaria)}</TableCell></TableRow>
                  <TableRow><TableCell>Leverage (Debiti / CN)</TableCell><TableCell align="right">{formatNumber(indiciCompleti.fonti.leverage)}</TableCell></TableRow>
                  <TableRow><TableCell>Consolidamento Passivo (Pml / Debiti)</TableCell><TableCell align="right">{formatPercentage(indiciCompleti.fonti.consolidamentoPassivo)}</TableCell></TableRow>
                  <TableRow><TableCell>Solidità Patrimoniale (CN / CS)</TableCell><TableCell align="right">{formatNumber(indiciCompleti.fonti.soliditaPatrimoniale)}</TableCell></TableRow>
                  <TableRow><TableCell>Protezione Capitale Sociale (Riserve / CS)</TableCell><TableCell align="right">{formatNumber(indiciCompleti.fonti.protezioneCapitaleSociale)}</TableCell></TableRow>
                  <TableRow><TableCell rowSpan={6} sx={{fontWeight: 'bold', verticalAlign:'top'}}>Liquidità e Correlazione</TableCell><TableCell>Quoziente di Disponibilità (Current Ratio)</TableCell><TableCell align="right">{formatNumber(indiciCompleti.liquidita.quozienteDisponibilita)}</TableCell></TableRow>
                  <TableRow><TableCell>Quoziente di Tesoreria (Quick Ratio)</TableCell><TableCell align="right">{formatNumber(indiciCompleti.liquidita.quozienteTesoreria)}</TableCell></TableRow>
                  <TableRow><TableCell>Margine di Struttura Primario</TableCell><TableCell align="right">{formatCurrency(indiciCompleti.liquidita.margineStrutturaPrimario)}</TableCell></TableRow>
                  <TableRow><TableCell>Margine di Struttura Secondario</TableCell><TableCell align="right">{formatCurrency(indiciCompleti.liquidita.margineStrutturaSecondario)}</TableCell></TableRow>
                  <TableRow><TableCell>Capitale Circolante Netto (CCN)</TableCell><TableCell align="right">{formatCurrency(indiciCompleti.liquidita.capitaleCircolanteNetto)}</TableCell></TableRow>
                  <TableRow><TableCell>Margine di Tesoreria</TableCell><TableCell align="right">{formatCurrency(indiciCompleti.liquidita.margineTesoreria)}</TableCell></TableRow>
                  <TableRow><TableCell rowSpan={4} sx={{fontWeight: 'bold', verticalAlign:'top'}}>Redditività</TableCell><TableCell>ROE (Return on Equity)</TableCell><TableCell align="right">{formatPercentage(indiciCompleti.redditivita.ROE)}</TableCell></TableRow>
                  <TableRow><TableCell>ROI (Return on Investment)</TableCell><TableCell align="right">{formatPercentage(indiciCompleti.redditivita.ROI)}</TableCell></TableRow>
                  <TableRow><TableCell>ROS (Return on Sales)</TableCell><TableCell align="right">{formatPercentage(indiciCompleti.redditivita.ROS)}</TableCell></TableRow>
                  <TableRow><TableCell>ROA (Return on Assets)</TableCell><TableCell align="right">{formatPercentage(indiciCompleti.redditivita.ROA)}</TableCell></TableRow>
                  <TableRow><TableCell rowSpan={6} sx={{fontWeight: 'bold', verticalAlign:'top'}}>Rotazione e Durata</TableCell><TableCell>Rotazione Capitale Investito</TableCell><TableCell align="right">{formatNumber(indiciCompleti.rotazione.rotazioneCI)}</TableCell></TableRow>
                  <TableRow><TableCell>Rotazione Attivo Corrente</TableCell><TableCell align="right">{formatNumber(indiciCompleti.rotazione.rotazioneAC)}</TableCell></TableRow>
                  <TableRow><TableCell>Rotazione Magazzino</TableCell><TableCell align="right">{formatNumber(indiciCompleti.rotazione.rotazioneRimanenze)}</TableCell></TableRow>
                  <TableRow><TableCell>Durata Magazzino (giorni)</TableCell><TableCell align="right">{formatNumber(indiciCompleti.rotazione.durataRimanenze, 0)}</TableCell></TableRow>
                  <TableRow><TableCell>Durata Crediti Commerciali (giorni)</TableCell><TableCell align="right">{formatNumber(indiciCompleti.rotazione.durataCrediti, 0)}</TableCell></TableRow>
                  <TableRow><TableCell>Durata Debiti Commerciali (giorni)</TableCell><TableCell align="right">{formatNumber(indiciCompleti.rotazione.durataDebiti, 0)}</TableCell></TableRow>
                </TableBody>
             </Table>
        </TableContainer>
      </Box>)}
    </Paper>
  );
}

export default RisultatiDashboard;