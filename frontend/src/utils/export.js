import * as XLSX from 'xlsx'

// Save file using Tauri dialog + fs (works in compiled .exe)
// Falls back to browser download in dev mode
async function saveFile(data, defaultFilename, mimeType) {
  try {
    const { save } = await import('@tauri-apps/plugin-dialog')
    const { writeFile } = await import('@tauri-apps/plugin-fs')

    const path = await save({
      defaultPath: defaultFilename,
      filters: mimeType.includes('csv')
        ? [{ name: 'CSV', extensions: ['csv'] }]
        : [{ name: 'Excel', extensions: ['xlsx'] }],
    })

    if (!path) return // user cancelled

    await writeFile(path, data)
  } catch {
    // Dev mode or plugin not available — fallback to browser download
    const blob = new Blob([data], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = defaultFilename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 100)
  }
}

export async function exportToExcel(students, filename = 'olympiad_report', t) {
  if (!students.length) return

  const wb   = XLSX.utils.book_new()
  const date = new Date().toLocaleDateString('ru-RU')

  const txt = {
    appName:      t?.nav?.appName          || 'Olympic Analyzer',
    appSubject:   t?.nav?.appSubject       || 'Olympiad Results Analyzer',
    summaryTitle: t?.dashboard?.title      || 'Summary',
    totalSt:      t?.dashboard?.totalStudents || 'Total students',
    avgGrade:     t?.dashboard?.avgGrade   || 'Average grade',
    maxGrade:     t?.dashboard?.maxGrade   || 'Max grade',
    minGrade:     t?.dashboard?.minGrade   || 'Min grade',
    median:       t?.dashboard?.median     || 'Median',
    gradeDist:    t?.dashboard?.gradeDist  || 'Grade distribution',
    excellent:    t?.grades?.excellent     || 'Excellent',
    good:         t?.grades?.good          || 'Good',
    medium:       t?.grades?.medium        || 'Average',
    bad:          t?.grades?.bad           || 'Poor',
    ratingTitle:  t?.top?.title            || 'Rating',
    colNum:       t?.students?.colNum      || '№',
    colLast:      t?.students?.colStudent  || 'Last name',
    colFirst:     t?.top?.colStudent       || 'First name',
    colInst:      t?.students?.colInstitution || 'Institution',
    colDept:      t?.students?.colDept     || 'Department',
    colGrade:     t?.students?.colGrade    || 'Grade',
    subjectsTitle:   t?.subjects?.title       || 'Subjects',
    colSubject:      t?.subjects?.title       || 'Subject',
    colStudents:     t?.subjects?.colStudents || 'Students',
    colAvg:          t?.subjects?.colAvg      || 'Average',
    colMin:          t?.subjects?.colMin      || 'Min',
    colMax:          t?.subjects?.colMax      || 'Max',
    instTitle:       t?.institutions?.title      || 'Institutions',
    colInstName:     t?.institutions?.title      || 'Institution',
    colInstStudents: t?.institutions?.colStudents || 'Students',
    colInstAvg:      t?.institutions?.colAvg      || 'Average',
  }

  // Stats
  const grades = students.map(s => s.final_grade)
  const avg    = grades.reduce((a, b) => a + b, 0) / grades.length
  const sorted = [...grades].sort((a, b) => a - b)
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)]
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0 }
  grades.forEach(g => { const r = Math.round(g); if (dist[r] !== undefined) dist[r]++ })

  // Sheet 1: Summary
  const ws1 = XLSX.utils.aoa_to_sheet([
    [txt.appName], [txt.appSubject], [''],
    [txt.summaryTitle.toUpperCase()], [''],
    [txt.totalSt,  students.length],
    [txt.avgGrade, avg.toFixed(2)],
    [txt.maxGrade, Math.max(...grades).toFixed(2)],
    [txt.minGrade, Math.min(...grades).toFixed(2)],
    [txt.median,   median.toFixed(2)],
    [''], [txt.gradeDist.toUpperCase()], [''],
    [`5 — ${txt.excellent}`, dist[5], `${((dist[5]/students.length)*100).toFixed(1)}%`],
    [`4 — ${txt.good}`,      dist[4], `${((dist[4]/students.length)*100).toFixed(1)}%`],
    [`3 — ${txt.medium}`,    dist[3], `${((dist[3]/students.length)*100).toFixed(1)}%`],
    [`2 — ${txt.bad}`,       dist[2], `${((dist[2]/students.length)*100).toFixed(1)}%`],
  ])
  ws1['!cols'] = [{ wch: 40 }, { wch: 16 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, ws1, txt.summaryTitle)

  // Sheet 2: Student ranking
  const ws2 = XLSX.utils.aoa_to_sheet([
    [txt.colNum, txt.colLast, txt.colFirst, txt.colInst, txt.colDept, txt.colGrade],
    ...[...students]
      .sort((a, b) => b.final_grade - a.final_grade)
      .map((s, i) => [i+1, s.last_name, s.first_name, s.institution, s.department, s.final_grade])
  ])
  ws2['!cols'] = [{ wch: 4 },{ wch: 16 },{ wch: 14 },{ wch: 28 },{ wch: 18 },{ wch: 10 }]
  XLSX.utils.book_append_sheet(wb, ws2, txt.ratingTitle)

  // Sheet 3: Subjects
  const subjectMap = {}
  students.forEach(s => {
    Object.entries(s.subject_grades || {}).forEach(([subj, grade]) => {
      if (!subjectMap[subj]) subjectMap[subj] = []
      subjectMap[subj].push(grade)
    })
  })
  const ws3 = XLSX.utils.aoa_to_sheet([
    [txt.colSubject, txt.colStudents, txt.colAvg, txt.colMin, txt.colMax],
    ...Object.entries(subjectMap)
      .map(([subj, sg]) => [
        subj, sg.length,
        (sg.reduce((a,b)=>a+b,0)/sg.length).toFixed(2),
        Math.min(...sg), Math.max(...sg),
      ])
      .sort((a, b) => b[2] - a[2])
  ])
  ws3['!cols'] = [{ wch: 22 },{ wch: 10 },{ wch: 10 },{ wch: 6 },{ wch: 6 }]
  XLSX.utils.book_append_sheet(wb, ws3, txt.subjectsTitle)

  // Sheet 4: Institutions
  const instMap = {}
  students.forEach(s => {
    if (!instMap[s.institution]) instMap[s.institution] = []
    instMap[s.institution].push(s.final_grade)
  })
  const ws4 = XLSX.utils.aoa_to_sheet([
    [txt.colInstName, txt.colInstStudents, txt.colInstAvg, txt.colMin, txt.colMax],
    ...Object.entries(instMap)
      .map(([inst, ig]) => [
        inst, ig.length,
        (ig.reduce((a,b)=>a+b,0)/ig.length).toFixed(2),
        Math.min(...ig).toFixed(2), Math.max(...ig).toFixed(2),
      ])
      .sort((a, b) => b[2] - a[2])
  ])
  ws4['!cols'] = [{ wch: 30 },{ wch: 12 },{ wch: 12 },{ wch: 8 },{ wch: 8 }]
  XLSX.utils.book_append_sheet(wb, ws4, txt.instTitle)

  // Save
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const defaultName = `${filename}_${date.replace(/\./g, '-')}.xlsx`
  await saveFile(
    new Uint8Array(buf),
    defaultName,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )
}