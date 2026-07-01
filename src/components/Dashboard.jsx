import { useState, useMemo } from 'react';
import { color, font } from '../lib/tokens.js';
import { budgetTotals } from '../lib/useStore.js';
import { useIsMobile } from '../lib/useIsMobile.js';
import Sidebar from './dashboard/Sidebar.jsx';
import HeroRow from './dashboard/HeroRow.jsx';
import ScheduleStepper from './dashboard/ScheduleStepper.jsx';
import BudgetByCategory from './dashboard/BudgetByCategory.jsx';
import DocumentsReceipts from './dashboard/DocumentsReceipts.jsx';
import Tasks from './dashboard/Tasks.jsx';
import Vendors from './dashboard/Vendors.jsx';
import PhotoLog from './dashboard/PhotoLog.jsx';
import EditProjectModal from './dashboard/EditProjectModal.jsx';
import { LoadingState, ErrorState } from './StatusStates.jsx';

export default function Dashboard({ store }) {
  const {
    active, tasks, docs, schedule, budget, vendors,
    dataLoading, dataError, reloadData,
    backToProjects, toggleTask, addTask, removeTask, addDoc, removeDoc, updateProject,
    addPhase, removePhase, cyclePhaseStatus,
    addBudgetCategory, removeBudgetCategory, setContingency,
    addVendor, removeVendor,
  } = store;
  const [docFormOpen, setDocFormOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [docQuery, setDocQuery] = useState('');
  const mobile = useIsMobile();

  // KPI counters — derived live from the tasks/docs arrays (HANDOFF §2).
  const kpis = useMemo(() => {
    const openCount = tasks.filter((t) => !t.done).length;
    const urgentCount = tasks.filter((t) => !t.done && t.urgent).length;
    return {
      docCount: docs.length,
      receiptCount: docs.filter((d) => d.type === 'Receipt').length,
      permitCount: docs.filter((d) => d.type === 'Permit').length,
      openCount,
      urgentLabel: urgentCount > 0 ? `${urgentCount} due this week` : 'all on schedule',
    };
  }, [tasks, docs]);

  // Budget roll-ups — derived from the categories; feeds the hero KPI + card.
  const totals = useMemo(() => budgetTotals(budget), [budget]);

  return (
    <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', minHeight: '100vh', color: color.ink }}>
      <Sidebar active={active} onBack={backToProjects} />

      <main style={{ flex: 1, minWidth: 0 }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: mobile ? '18px 16px 40px' : '30px 40px 56px' }}>
          {/* Topbar */}
          <div style={{ display: 'flex', alignItems: mobile ? 'stretch' : 'center', flexDirection: mobile ? 'column' : 'row', justifyContent: 'space-between', gap: mobile ? 14 : 0, marginBottom: 26 }}>
            <div>
              <div style={{ fontFamily: font.mono, fontSize: 11, letterSpacing: '0.06em', color: color.faint, marginBottom: 6 }}>{active.code || 'PROJECT'}</div>
              <h1 style={{ margin: 0, fontSize: mobile ? 23 : 27, fontWeight: 700, letterSpacing: '-0.02em' }}>Project Overview</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 13px', background: '#fff', border: `1px solid ${color.hairline}`, borderRadius: 10, flex: 1, minWidth: mobile ? 0 : 188 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color.faint} strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
                <input
                  value={docQuery}
                  onChange={(e) => setDocQuery(e.target.value)}
                  placeholder="Search documents…"
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: color.ink, width: '100%' }}
                />
              </div>
              <button className="rt-btn-primary" onClick={() => setDocFormOpen(true)} style={{ height: 38, padding: '0 16px', background: color.accent, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><path d="M12 5v14M5 12h14" /></svg>Add document
              </button>
            </div>
          </div>

          {dataError ? (
            <div style={{ background: '#fff', border: `1px solid ${color.hairline}`, borderRadius: 16 }}>
              <ErrorState message={dataError} onRetry={reloadData} />
            </div>
          ) : dataLoading ? (
            <div style={{ background: '#fff', border: `1px solid ${color.hairline}`, borderRadius: 16 }}>
              <LoadingState label="Loading project" pad="90px 24px" />
            </div>
          ) : (
            <>
              <HeroRow active={active} budget={totals} onEdit={() => setEditOpen(true)} {...kpis} />
              <ScheduleStepper schedule={schedule} addPhase={addPhase} removePhase={removePhase} cyclePhaseStatus={cyclePhaseStatus} />

              {/* Lower grid */}
              <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1.5fr 1fr', gap: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <BudgetByCategory budget={budget} totals={totals} addBudgetCategory={addBudgetCategory} removeBudgetCategory={removeBudgetCategory} setContingency={setContingency} />
                  <DocumentsReceipts docs={docs} addDoc={addDoc} removeDoc={removeDoc} open={docFormOpen} setOpen={setDocFormOpen} query={docQuery} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <Tasks tasks={tasks} toggleTask={toggleTask} addTask={addTask} removeTask={removeTask} />
                  <Vendors vendors={vendors} addVendor={addVendor} removeVendor={removeVendor} />
                  <PhotoLog projectId={active.id} />
                </div>
              </div>

              {/* Prototype note */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24, fontFamily: font.mono, fontSize: 10.5, color: color.fainter, letterSpacing: '0.03em' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color.fainter} strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
                PROTOTYPE — EVERY SECTION IS SCOPED TO THIS PROJECT AND SAVED LOCALLY IN THIS BROWSER. SEE docs/DATA-MODEL.md.
              </div>
            </>
          )}
        </div>
      </main>

      {editOpen && (
        <EditProjectModal
          project={active}
          onSave={(patch) => updateProject(active.id, patch)}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}
