//========================================================================
//
//  Interfaces
//
//========================================================================

type StatePartial<T> = Partial<Omit<T, 'id'>> & { id: string }

//========================================================================
//
//  Implementation
//
//========================================================================

function generateId(): string {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let autoId = ''
  for (let i = 0; i < 20; i++) {
    autoId += CHARS.charAt(Math.floor(Math.random() * CHARS.length))
  }
  return autoId
}

//========================================================================
//
//  Exports
//
//========================================================================

export { StatePartial }
export { generateId }
