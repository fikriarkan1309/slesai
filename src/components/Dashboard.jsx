import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Star,
  Clock,
  TrendingUp,
  PieChart as PieIcon,
  Calendar,
  X,
  ArrowRight,
} from 'lucide-react';

export default function Dashboard({
  tasks,
  projectsList,
  setActiveTab,
  setActiveProjectId,
}) {
  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleString('id-ID', {
    month: 'long',
  });
  const currentYear = currentDate.getFullYear();

  const [showYearModal, setShowYearModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [chartView, setChartView] = useState('overall');
  const getLastStage = (projectId) => {
    const proj = projectsList.find(p => p.id === projectId);
    return proj && proj.columns && proj.columns.length > 0 ? proj.columns[proj.columns.length - 1] : 'Slesai';
  };
  
  // 1. DATA FOKUS HARI INI (Sembunyikan yang sudah Slesai atau Diarsipkan)
  const starredTasks = tasks.filter(t => t.isStarred && t.status !== getLastStage(t.projectId) && !t.isArchived);

  // 2. DATA PIE CHART (Hitung status 'Slesai' ATAU 'isArchived')
  const generatePieData = (isCurrentMonth) => {
    return projectsList.map(proj => {
      const lastStage = getLastStage(proj.id);
      const projTasksDone = tasks.filter(t => t.projectId === proj.id && (t.status === lastStage || t.isArchived));
      if (!isCurrentMonth) return { name: proj.name, value: 0, color: proj.color };

      const totalRevenue = projTasksDone.reduce((sum, task) => sum + (parseInt((task.fee || '0').replace(/[^0-9]/g, '')) || 0), 0);
      return { name: proj.name, value: totalRevenue, color: proj.color };
    }).filter(data => data.value > 0);
  };

  const pieDataThisMonth = generatePieData(true);
  const pieDataLastMonth = generatePieData(false);

  // 3. DATA GRAFIK ARUS KAS
  const totalPotensiSemua = tasks.reduce((sum, t) => sum + (parseInt((t.fee || '0').replace(/[^0-9]/g, '')) || 0), 0);
  const totalPendapatanRiil = tasks.reduce((sum, t) => {
    const lastStage = getLastStage(t.projectId);
    return (t.status === lastStage || t.isArchived) ? sum + (parseInt((t.fee || '0').replace(/[^0-9]/g, '')) || 0) : sum;
  }, 0);

  const dataMingguan = [
    { name: 'Mg 1', masuk: 0, potensi: 0 }, { name: 'Mg 2', masuk: 0, potensi: 0 },
    { name: 'Mg 3', masuk: 0, potensi: 0 }, { name: 'Mg 4', masuk: totalPendapatanRiil, potensi: totalPotensiSemua }, 
  ];

  // Data Khusus Grafik Multi-Project
  let mg4DataMulti = { name: 'Mg 4' };
  projectsList.forEach(p => {
    const lastStage = getLastStage(p.id);
    const projTasks = tasks.filter(t => t.projectId === p.id);
    const projRev = projTasks.reduce((sum, t) => (t.status === lastStage || t.isArchived) ? sum + (parseInt((t.fee || '0').replace(/[^0-9]/g, '')) || 0) : sum, 0);
    mg4DataMulti[p.name] = projRev;
  });

  const emptyProjects = projectsList.reduce((acc, p) => ({ ...acc, [p.name]: 0 }), {});
  const dataMingguanMulti = [
    { name: 'Mg 1', ...emptyProjects }, { name: 'Mg 2', ...emptyProjects }, { name: 'Mg 3', ...emptyProjects }, mg4DataMulti
  ];

  const namaBulan = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Ags',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ];
  const yearlyData = namaBulan.map((bulan, index) => {
    const isCurrentMonthIndex = currentDate.getMonth() === index;
    return {
      name: bulan,
      pendapatan:
        isCurrentMonthIndex && selectedYear === currentYear
          ? totalPendapatanRiil
          : 0,
    };
  });

  const handleLihatSemua = () => {
    if (projectsList.length > 0) {
      setActiveProjectId(projectsList[0].id);
      setActiveTab('project');
    }
  };

  return (
    <div style={{ paddingBottom: '2rem', minWidth: 0, overflow: 'hidden' }}>
      <h1 className="page-title">
        Dashboard Overview - {currentMonthName} {currentYear}
      </h1>

      <div className="dashboard-grid" style={{ minWidth: 0 }}>
        {/* WIDGET 1: FOKUS HARI INI (Desain Mini & Scrollable) */}
        <div
          className="widget-card"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <h2 className="widget-title">
            <Star size={20} color="#f59e0b" /> Fokus Hari Ini
          </h2>

          {/* Kontainer dengan Max-Height dan Scroll */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              maxHeight: '320px',
              overflowY: 'auto',
              paddingRight: '0.5rem',
              flex: 1,
            }}
          >
            {starredTasks.length === 0 ? (
              <div
                style={{
                  padding: '2rem 0',
                  textAlign: 'center',
                  color: 'var(--text-gray)',
                  fontSize: '0.9rem',
                }}
              >
                Tidak ada tugas prioritas.
              </div>
            ) : (
              starredTasks.map((task) => {
                const projectColor =
                  projectsList.find((p) => p.id === task.projectId)?.color ||
                  'var(--text-gray)';
                return (
                  // KARTU VERSI MINI
                  <div
                    key={task.id}
                    style={{
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderLeft: `4px solid ${projectColor}`,
                      borderRadius: '6px',
                      padding: '0.75rem',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: 'var(--text-dark)',
                            marginBottom: '4px',
                          }}
                        >
                          {task.title}
                        </div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-gray)',
                          }}
                        >
                          {task.client}
                        </div>
                      </div>
                      <Star
                        size={14}
                        fill={projectColor}
                        color={projectColor}
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#ef4444',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        marginTop: '0.5rem',
                      }}
                    >
                      <Clock size={12} /> {task.deadline}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <button
            onClick={handleLihatSemua}
            style={{
              padding: '0.75rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              color: 'var(--text-gray)',
              cursor: 'pointer',
              marginTop: '1rem',
              fontWeight: '500',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            Lihat Semua Tugas <ArrowRight size={16} />
          </button>
        </div>

        {/* WIDGET 2: PIE CHART */}
        <div
          className="widget-card"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem',
            }}
          >
            <h2 className="widget-title" style={{ margin: 0 }}>
              <PieIcon size={20} color="var(--sky-blue)" /> Distribusi
              Pendapatan
            </h2>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flex: 1,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <h3
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-gray)',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                }}
              >
                Bulan Lalu
              </h3>
              {pieDataLastMonth.length === 0 ? (
                <div
                  style={{
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#cbd5e1',
                    fontSize: '0.8rem',
                  }}
                >
                  Rp 0
                </div>
              ) : (
                <div style={{ width: '100%', height: 120 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieDataLastMonth}
                        innerRadius={30}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieDataLastMonth.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(val) => `Rp${val.toLocaleString('id-ID')}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div
              style={{ width: '1px', height: '80%', background: '#f1f5f9' }}
            ></div>
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <h3
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-dark)',
                  marginBottom: '0.5rem',
                  fontWeight: '600',
                }}
              >
                Bulan Ini
              </h3>
              {pieDataThisMonth.length === 0 ? (
                <div
                  style={{
                    height: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#cbd5e1',
                    fontSize: '0.8rem',
                  }}
                >
                  Belum ada data
                </div>
              ) : (
                <div style={{ width: '100%', height: 120 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieDataThisMonth}
                        innerRadius={35}
                        outerRadius={55}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieDataThisMonth.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(val) => `Rp${val.toLocaleString('id-ID')}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowYearModal(true)}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              color: 'var(--text-dark)',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Calendar size={16} color="var(--sky-blue)" /> Lihat Rekap Tahunan
          </button>
        </div>

        {/* WIDGET 3: GRAFIK ARUS KAS MINGGUAN */}
        

        {/* --- GANTI WIDGET 3 DENGAN INI --- */}
        <div className="widget-card" style={{ gridColumn: '1 / -1', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="widget-title" style={{ margin: 0 }}><TrendingUp size={20} color="#10b981" /> Tren Arus Kas Mingguan</h2>
            <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
              <button onClick={() => setChartView('overall')} style={{ padding: '4px 12px', border: 'none', borderRadius: '4px', background: chartView === 'overall' ? 'white' : 'transparent', boxShadow: chartView === 'overall' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: chartView === 'overall' ? 'var(--sky-blue)' : 'var(--text-gray)' }}>Keseluruhan</button>
              <button onClick={() => setChartView('perProject')} style={{ padding: '4px 12px', border: 'none', borderRadius: '4px', background: chartView === 'perProject' ? 'white' : 'transparent', boxShadow: chartView === 'perProject' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', color: chartView === 'perProject' ? 'var(--sky-blue)' : 'var(--text-gray)' }}>Per Project</button>
            </div>
          </div>

          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartView === 'overall' ? dataMingguan : dataMingguanMulti} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis width={85} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `Rp${val/1000}k`} />
                <RechartsTooltip formatter={(value) => `Rp ${(Number(value) || 0).toLocaleString('id-ID')}`} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                
                {chartView === 'overall' ? (
                  <>
                    <Line type="monotone" dataKey="masuk" stroke="var(--sky-blue)" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name="Pendapatan Riil" />
                    <Line type="monotone" dataKey="potensi" stroke="#cbd5e1" strokeWidth={3} strokeDasharray="6 6" dot={false} name="Potensi Total" />
                  </>
                ) : (
                  projectsList.map(proj => (
                    <Line key={proj.id} type="monotone" dataKey={proj.name} stroke={proj.color} strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} name={proj.name} />
                  ))
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {showYearModal && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div
            className="modal-content"
            style={{ maxWidth: '800px', width: '95%' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <h2
                  style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-dark)',
                    margin: 0,
                  }}
                >
                  Rekap Tahunan
                </h2>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--sky-blue)',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value={currentYear + 1}>{currentYear + 1}</option>
                  <option value={currentYear}>{currentYear}</option>
                  <option value={currentYear - 1}>{currentYear - 1}</option>
                  <option value={currentYear - 2}>{currentYear - 2}</option>
                </select>
              </div>
              <button
                onClick={() => setShowYearModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-gray)',
                }}
              >
                <X size={24} />
              </button>
            </div>
            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={yearlyData}
                  margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b' }}
                  />
                  <YAxis
                    width={85}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b' }}
                    tickFormatter={(val) => `Rp${val / 1000}k`}
                  />
                  <RechartsTooltip
                    formatter={(value) => `Rp ${(Number(value) || 0).toLocaleString('id-ID')}`}
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar
                    dataKey="pendapatan"
                    fill="var(--sky-blue)"
                    radius={[4, 4, 0, 0]}
                    name={`Total Pendapatan ${selectedYear}`}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
