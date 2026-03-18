export default {
  // Навигация
  nav: {
    dashboard:    'Обзор',
    students:     'Студенты',
    subjects:     'Предметы',
    top:          'Топ студентов',
    institutions: 'Учреждения',
    appName:      'Олимпиада',
    appSubject:   'Анализ результатов олимпиад Moodle',
    authorName:   'Бердиев Мергенхан',
    authorGroup:  '4.ИСТ "А"',
    authorYear:   'Выпускник 2026',
  },

  // Хедер
  header: {
    upload:      'Загрузить',
    report:      'Отчёт Excel',
    uploaded:    'Загружено',
    students:    'студентов',
  },

  // Дашборд
  dashboard: {
    title:           'Обзор',
    subtitle:        'Общая статистика олимпиады',
    totalStudents:   'Всего студентов',
    participants:    'Участников олимпиады',
    avgGrade:        'Средний балл',
    byFinalGrades:   'По итоговым оценкам',
    maxGrade:        'Максимальный',
    bestResult:      'Лучший результат',
    minGrade:        'Минимальный',
    worstResult:     'Низший результат',
    median:          'Медиана',
    medianValue:     'Серединное значение',
    gradeDist:       'Распределение оценок',
    bestStudents:    'Лучшие студенты',
    top5byGrade:     'Топ 5 по итоговому баллу',
    top5title:       'Топ 5 участников',
    winners:         'Победители олимпиады',
    noData:          'Не удалось загрузить данные. Запущен ли бэкенд?',
    noDataHint:      'cargo run в папке backend',
  },

  // Студенты
  students: {
    title:        'Студенты',
    subtitle:     'Список всех участников',
    search:       'Поиск по имени, учреждению, номеру...',
    allGrades:    'Все оценки',
    excellent:    'Отлично',
    good:         'Хорошо',
    medium:       'Средне',
    bad:          'Плохо',
    outOf:        'из',
    csvDownloaded:   'CSV скачан',
    excelDownloaded: 'Отчёт Excel скачан — 4 листа',
    exportError:     'Ошибка при экспорте',
    notFound:        'Ничего не найдено',
    colNum:          '#',
    colStudent:      'Студент',
    colInstitution:  'Учреждение',
    colDept:         'Отдел',
    colId:           'ID',
    colGrade:        'Итог',
  },

  // Предметы
  subjects: {
    title:        'Предметы',
    subtitle:     'Статистика по дисциплинам',
    avgBySubject: 'Средний балл по предметам',
    clickCard:    'Нажми на карточку предмета ниже чтобы увидеть детали',
    studentCount: 'студентов',
    detailed:     'Детальная статистика',
    distTitle:    'Распределение оценок',
    colStudents:  'Студентов',
    colAvg:       'Средний',
    colMin:       'Мин',
    colMax:       'Макс',
    grade5:       '5 — Отлично',
    grade4:       '4 — Хорошо',
    grade3:       '3 — Средне',
    grade2:       '2 — Плохо',
  },

  // Топ студентов
  top: {
    title:    'Топ студентов',
    subtitle: 'Лучшие участники олимпиады',
    rating:   'Рейтинг участников',
    byGrade:  'По итоговому баллу олимпиады',
    colNum:       '#',
    colStudent:   'Студент',
    colInst:      'Учреждение',
    colId:        'ID',
    colGrade:     'Итог',
  },

  // Учреждения
  institutions: {
    title:      'Учреждения',
    subtitle:   'Статистика по организациям',
    avgByInst:  'Средний балл по учреждениям',
    sortedDesc: 'Отсортировано по убыванию среднего балла',
    detailed:   'Детальная информация',
    departments:'Отделения',
    colStudents:'Студентов',
    colAvg:     'Средний',
    colDepts:   'Отделений',
    studShort:  'студ.',
    deptShort:  'отд.',
  },

  // Модалка профиля студента
  studentModal: {
    finalGrade:    'Итоговый балл',
    avgBySubjects: 'Средний по предметам',
    individualNum: 'Индивид. номер',
    gradesBySubj:  'Оценки по предметам',
  },

  // Модалка загрузки
  uploadModal: {
    title:       'Загрузить Excel',
    subtitle:    'Файл с результатами олимпиады',
    dragOrClick: 'Перетащи файл или нажми для выбора',
    supported:   'Поддерживается .xlsx, .xls',
    onlyExcel:   'Только Excel файлы (.xlsx, .xls)',
    cancel:      'Отмена',
    upload:      'Загрузить',
    uploading:   'Загрузка...',
    errorPrefix: 'Ошибка: ',
  },

  // Оценки
  grades: {
    excellent: 'Отлично',
    good:      'Хорошо',
    medium:    'Средне',
    bad:       'Плохо',
  },
}