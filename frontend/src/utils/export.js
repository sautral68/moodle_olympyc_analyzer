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

// CSV — просто список студентов, это нормально
export function exportToCSV(students, filename = 'students') {
  if (!students.length) return

  const rows = students.map((s, i) => {
    const row = {
      '№': i + 1,
      'Фамилия': s.last_name,
      'Имя': s.first_name,
      'Учреждение': s.institution,
      'Отдел': s.department,
      'Email': s.email,
      'ID': s.individual_number,
      'Итоговый балл': s.final_grade,
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

// Excel — полноценный аналитический отчёт с 4 листами
export function exportToExcel(students, filename = 'olympiad_report') {
  if (!students.length) return

  const wb = XLSX.utils.book_new()
  const date = new Date().toLocaleDateString('ru-RU')

  // ─── Лист 1: Сводка ───────────────────────────────────────
  const grades = students.map(s => s.final_grade)
  const avg = grades.reduce((a, b) => a + b, 0) / grades.length
  const sorted = [...grades].sort((a, b) => a - b)
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length/2 - 1] + sorted[sorted.length/2]) / 2
    : sorted[Math.floor(sorted.length/2)]

  const dist = { 5: 0, 4: 0, 3: 0, 2: 0 }
  grades.forEach(g => { const r = Math.round(g); if (dist[r] !== undefined) dist[r]++ })

  const summaryData = [
    ['АНАЛИТИЧЕСКИЙ ОТЧЁТ ПО ОЛИМПИАДЕ', ''],
    ['Дата формирования:', date],
    ['', ''],
    ['ОБЩАЯ СТАТИСТИКА', ''],
    ['Всего участников:', students.length],
    ['Средний балл:', avg.toFixed(2)],
    ['Максимальный балл:', Math.max(...grades).toFixed(2)],
    ['Минимальный балл:', Math.min(...grades).toFixed(2)],
    ['Медиана:', median.toFixed(2)],
    ['', ''],
    ['РАСПРЕДЕЛЕНИЕ ОЦЕНОК', ''],
    ['Отлично (5):', dist[5]],
    ['Хорошо (4):', dist[4]],
    ['Средне (3):', dist[3]],
    ['Плохо (2):', dist[2]],
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
  ws1['!cols'] = [{ wch: 28 }, { wch: 16 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Сводка')

  // ─── Лист 2: Топ студентов ────────────────────────────────
  const topData = [
    ['№', 'Фамилия', 'Имя', 'Учреждение', 'Отдел', 'Итоговый балл', 'Оценка'],
    ...students
      .sort((a, b) => b.final_grade - a.final_grade)
      .map((s, i) => [
        i + 1,
        s.last_name,
        s.first_name,
        s.institution,
        s.department,
        s.final_grade,
        Math.round(s.final_grade) === 5 ? 'Отлично'
          : Math.round(s.final_grade) === 4 ? 'Хорошо'
          : Math.round(s.final_grade) === 3 ? 'Средне' : 'Плохо'
      ])
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(topData)
  ws2['!cols'] = [{ wch: 4 }, { wch: 16 }, { wch: 14 }, { wch: 28 }, { wch: 18 }, { wch: 14 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Рейтинг студентов')

  // ─── Лист 3: Статистика по предметам ─────────────────────
  const subjectMap = {}
  students.forEach(s => {
    Object.entries(s.subject_grades || {}).forEach(([subj, grade]) => {
      if (!subjectMap[subj]) subjectMap[subj] = []
      subjectMap[subj].push(grade)
    })
  })

  const subjectRows = [
    ['Предмет', 'Кол-во студентов', 'Средний балл', 'Мин', 'Макс', 'Отлично(5)', 'Хорошо(4)', 'Средне(3)', 'Плохо(2)'],
    ...Object.entries(subjectMap).map(([subj, grades]) => {
      const avg = grades.reduce((a, b) => a + b, 0) / grades.length
      const d = { 5: 0, 4: 0, 3: 0, 2: 0 }
      grades.forEach(g => { if (d[g] !== undefined) d[g]++ })
      return [
        subj,
        grades.length,
        avg.toFixed(2),
        Math.min(...grades),
        Math.max(...grades),
        d[5], d[4], d[3], d[2]
      ]
    }).sort((a, b) => b[2] - a[2])
  ]
  const ws3 = XLSX.utils.aoa_to_sheet(subjectRows)
  ws3['!cols'] = [{ wch: 20 }, { wch: 16 }, { wch: 14 }, { wch: 6 }, { wch: 6 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, ws3, 'По предметам')

  // ─── Лист 4: Статистика по учреждениям ───────────────────
  const instMap = {}
  students.forEach(s => {
    if (!instMap[s.institution]) instMap[s.institution] = []
    instMap[s.institution].push(s.final_grade)
  })

  const instRows = [
    ['Учреждение', 'Кол-во студентов', 'Средний балл', 'Мин', 'Макс'],
    ...Object.entries(instMap).map(([inst, grades]) => [
      inst,
      grades.length,
      (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2),
      Math.min(...grades).toFixed(2),
      Math.max(...grades).toFixed(2),
    ]).sort((a, b) => b[2] - a[2])
  ]
  const ws4 = XLSX.utils.aoa_to_sheet(instRows)
  ws4['!cols'] = [{ wch: 30 }, { wch: 16 }, { wch: 14 }, { wch: 8 }, { wch: 8 }]
  XLSX.utils.book_append_sheet(wb, ws4, 'По учреждениям')

  // ─── Сохраняем ────────────────────────────────────────────
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  downloadBlob(
    new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `${filename}_${date.replace(/\./g, '-')}.xlsx`
  )
}