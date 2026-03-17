import axios from 'axios'

const BASE = '/api'

export const api = {
  // Здоровье бэка
  health: () => axios.get(`${BASE}/health`),
  
  // Студенты
  getStudents: () => axios.get(`${BASE}/students`),
  getStudent: (id) => axios.get(`${BASE}/students/${id}`),
  
  // Предметы
  getSubjects: () => axios.get(`${BASE}/subjects`),
  
  // Статистика
  getStats: () => axios.get(`${BASE}/stats`),
  getSubjectsStats: () => axios.get(`${BASE}/stats/subjects`),
  getSubjectStats: (name) => axios.get(`${BASE}/stats/subject/${name}`),
  getInstitutionsStats: () => axios.get(`${BASE}/stats/institutions`),
  
  // Топ студентов
  getTop: (n) => axios.get(`${BASE}/top/${n}`),
  
  // Загрузка файла
  uploadExcel: (file) => {
    const form = new FormData()
    form.append('file', file)
    return axios.post(`${BASE}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}