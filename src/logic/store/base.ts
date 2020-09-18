export type StatePartial<T> = Partial<Omit<T, 'id'>> & { id: string }
