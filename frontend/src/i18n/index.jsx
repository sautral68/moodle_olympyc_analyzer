import { createContext, useContext, useState } from 'react'
import ru from './ru'
import en from './en'
import tk from './tk'

const translations = { ru, en, tk }

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState('ru')
  const t = translations[lang]

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}