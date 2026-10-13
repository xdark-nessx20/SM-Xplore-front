import { useEffect, useState } from 'react'

/**
 * Hook genérico que sincroniza un estado de React con `localStorage`.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : initialValue
    } catch {
      // Si el valor guardado no es JSON válido usamos el valor inicial.
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // El almacenamiento puede no estar disponible (modo privado, cuota llena).
    }
  }, [key, value])

  return [value, setValue] as const
}
