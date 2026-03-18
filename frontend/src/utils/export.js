import * as XLSX from 'xlsx'

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 100)
}

export function exportToCSV(students, filename = 'students', t) {
  if (!students.length) return

  const colNum    = t?.students?.colNum          || '№'
  const colLast   = t?.students?.colStudent      || 'Last name'
  const colFirst  = t?.top?.colStudent           || 'First name'
  const colInst   = t?.students?.colInstitution  || 'Institution'
  const colDept   = t?.students?.colDept         || 'Department'
  const colId     = t?.students?.colId           || 'ID'
  const colGrade  = t?.students?.colGrade        || 'Grade'

  const rows = students.map((s, i) => {
    const row = {
      [colNum]:   i + 1,
      [colLast]:  s.last_name,
      [colFirst]: s.first_name,
      [colInst]:  s.institution,
      [colDept]:  s.department,
      'Email':    s.email,
      [colId]:    s.individual_number,
      [colGrade]: s.final_grade,
    }
    for (const [subject, grade] of Object.entries(s.subject_grades || {})) {
      row[subject] = grade
    }
    return row
  })

  const headers = Object.keys(rows[0])
  const lines = rows.map(row =>
    headers.map(h => {
      const val = row[h] ?? ''
      return typeof val === 'string' && (val.includes(',') || val.includes('"'))
        ? `"${val.replace(/"/g, '""')}"` : val
    }).join(',')
  )
  const csv = '\uFEFF' + [headers.join(','), ...lines].join('\n')
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`)
}

export function exportToExcel(students, filename = 'olympiad_report', t) {
  if (!students.length) return

  const wb   = XLSX.utils.book_new()
  const date = new Date().toLocaleDateString('ru-RU')

  // Все тексты из переводов
  const txt = {
    appName:      t?.nav?.appName          || 'Olympic Analyzer',
    appSubject:   t?.nav?.appSubject       || 'Olympiad Results Analyzer',
    reportDate:   date,

    // Лист 1
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

    // Лист 2
    ratingTitle:  t?.top?.title            || 'Rating',
    colNum:       t?.students?.colNum      || '№',
    colLast:      t?.students?.colStudent  || 'Last name',
    colFirst:     t?.top?.colStudent       || 'First name',
    colInst:      t?.students?.colInstitution || 'Institution',
    colDept:      t?.students?.colDept     || 'Department',
    colGrade:     t?.students?.colGrade    || 'Grade',
    colStatus:    'Status',

    // Лист 3
    subjectsTitle:   t?.subjects?.title       || 'Subjects',
    colSubject:      t?.subjects?.title       || 'Subject',
    colStudents:     t?.subjects?.colStudents || 'Students',
    colAvg:          t?.subjects?.colAvg      || 'Average',
    colMin:          t?.subjects?.colMin      || 'Min',
    colMax:          t?.subjects?.colMax      || 'Max',

    // Лист 4
    instTitle:       t?.institutions?.title      || 'Institutions',
    colInstName:     t?.institutions?.title      || 'Institution',
    colInstStudents: t?.institutions?.colStudents || 'Students',
    colInstAvg:      t?.institutions?.colAvg      || 'Average',
    colInstMin:      t?.subjects?.colMin          || 'Min',
    colInstMax:      t?.subjects?.colMax          || 'Max',
  }

  // ─── Считаем статистику ───────────────────────────────────
  const grades = students.map(s => s.final_grade)
  const avg    = grades.reduce((a, b) => a + b, 0) / grades.length
  const sorted = [...grades].sort((a, b) => a - b)
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)]
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0 }
  grades.forEach(g => {
    const r = Math.round(g)
    if (dist[r] !== undefined) dist[r]++
  })

  // ─── Лист 1: Сводная статистика ──────────────────────────
  const sheet1 = [
    [txt.appName],
    [txt.appSubject],
    [''],
    [txt.summaryTitle.toUpperCase()],
    [''],
    [txt.totalSt,  students.length],
    [txt.avgGrade, avg.toFixed(2)],
    [txt.maxGrade, Math.max(...grades).toFixed(2)],
    [txt.minGrade, Math.min(...grades).toFixed(2)],
    [txt.median,   median.toFixed(2)],
    [''],
    [txt.gradeDist.toUpperCase()],
    [''],
    [`5 — ${txt.excellent}`, dist[5], `${((dist[5] / students.length) * 100).toFixed(1)}%`],
    [`4 — ${txt.good}`,      dist[4], `${((dist[4] / students.length) * 100).toFixed(1)}%`],
    [`3 — ${txt.medium}`,    dist[3], `${((dist[3] / students.length) * 100).toFixed(1)}%`],
    [`2 — ${txt.bad}`,       dist[2], `${((dist[2] / students.length) * 100).toFixed(1)}%`],
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(sheet1)
  ws1['!cols'] = [{ wch: 40 }, { wch: 16 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, ws1, txt.summaryTitle)

  // ─── Лист 2: Рейтинг студентов ────────────────────────────
  const sheet2 = [
    [txt.colNum, txt.colLast, txt.colFirst, txt.colInst, txt.colDept, txt.colGrade, txt.colStatus],
    ...students
      .sort((a, b) => b.final_grade - a.final_grade)
      .map((s, i) => [
        i + 1,
        s.last_name,
        s.first_name,
        s.institution,
        s.department,
        s.final_grade,
        Math.round(s.final_grade) === 5 ? txt.excellent
          : Math.round(s.final_grade) === 4 ? txt.good
          : Math.round(s.final_grade) === 3 ? txt.medium
          : txt.bad,
      ])
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(sheet2)
  ws2['!cols'] = [{ wch: 4 },{ wch: 16 },{ wch: 14 },{ wch: 28 },{ wch: 18 },{ wch: 10 },{ wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws2, txt.ratingTitle)

  // ─── Лист 3: По предметам ─────────────────────────────────
  const subjectMap = {}
  students.forEach(s => {
    Object.entries(s.subject_grades || {}).forEach(([subj, grade]) => {
      if (!subjectMap[subj]) subjectMap[subj] = []
      subjectMap[subj].push(grade)
    })
  })

  const sheet3 = [
    [
      txt.colSubject,
      txt.colStudents,
      txt.colAvg,
      txt.colMin,
      txt.colMax,
      `5 — ${txt.excellent}`,
      `4 — ${txt.good}`,
      `3 — ${txt.medium}`,
      `2 — ${txt.bad}`,
    ],
    ...Object.entries(subjectMap)
      .map(([subj, sgrades]) => {
        const savg = sgrades.reduce((a, b) => a + b, 0) / sgrades.length
        const sd = { 5: 0, 4: 0, 3: 0, 2: 0 }
        sgrades.forEach(g => { if (sd[g] !== undefined) sd[g]++ })
        return [
          subj,
          sgrades.length,
          savg.toFixed(2),
          Math.min(...sgrades),
          Math.max(...sgrades),
          sd[5], sd[4], sd[3], sd[2],
        ]
      })
      .sort((a, b) => b[2] - a[2])
  ]
  const ws3 = XLSX.utils.aoa_to_sheet(sheet3)
  ws3['!cols'] = [{ wch: 22 },{ wch: 10 },{ wch: 10 },{ wch: 6 },{ wch: 6 },{ wch: 14 },{ wch: 12 },{ wch: 12 },{ wch: 10 }]
  XLSX.utils.book_append_sheet(wb, ws3, txt.subjectsTitle)

  // ─── Лист 4: По учреждениям ───────────────────────────────
  const instMap = {}
  students.forEach(s => {
    if (!instMap[s.institution]) instMap[s.institution] = []
    instMap[s.institution].push(s.final_grade)
  })

  const sheet4 = [
    [txt.colInstName, txt.colInstStudents, txt.colInstAvg, txt.colInstMin, txt.colInstMax],
    ...Object.entries(instMap)
      .map(([inst, igrades]) => [
        inst,
        igrades.length,
        (igrades.reduce((a, b) => a + b, 0) / igrades.length).toFixed(2),
        Math.min(...igrades).toFixed(2),
        Math.max(...igrades).toFixed(2),
      ])
      .sort((a, b) => b[2] - a[2])
  ]
  const ws4 = XLSX.utils.aoa_to_sheet(sheet4)
  ws4['!cols'] = [{ wch: 30 },{ wch: 12 },{ wch: 12 },{ wch: 8 },{ wch: 8 }]
  XLSX.utils.book_append_sheet(wb, ws4, txt.instTitle)

  // ─── Сохраняем ────────────────────────────────────────────
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  downloadBlob(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `${filename}_${date.replace(/\./g, '-')}.xlsx`
  )
}