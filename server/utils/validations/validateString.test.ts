import { optionalString } from './validateString'
import { createSchema } from '../../middleware/validation/validationMiddleware'

describe('optionalString', () => {
  const schema = createSchema({ text: optionalString() })

  it('allow undefined input', () => {
    const result = schema.safeParse({})
    expect(result.success).toBeTruthy()
    expect(result.data?.text).toBeNull()
  })

  it('allow string input', () => {
    const result = schema.safeParse({ text: ' Some text ' })
    expect(result.success).toBeTruthy()
    expect(result.data?.text).toBe(' Some text ')
  })

  it('parse empty string into null', () => {
    const result = schema.safeParse({ text: '' })
    expect(result.success).toBeTruthy()
    expect(result.data?.text).toBeNull()
  })

  it('parse whitespace-only string into null', () => {
    const result = schema.safeParse({ text: '   ' })
    expect(result.success).toBeTruthy()
    expect(result.data?.text).toBeNull()
  })
})

describe('optionalString with max character count', () => {
  const schema = createSchema({ text: optionalString({ maxChar: { count: 10, errorMessage: 'Max 10 char allowed' } }) })

  it('allow undefined input', () => {
    const result = schema.safeParse({})
    expect(result.success).toBeTruthy()
    expect(result.data?.text).toBeNull()
  })

  it('allow string input', () => {
    const result = schema.safeParse({ text: 'Some text ' })
    expect(result.success).toBeTruthy()
    expect(result.data?.text).toBe('Some text ')
  })

  it('parse empty string into null', () => {
    const result = schema.safeParse({ text: '' })
    expect(result.success).toBeTruthy()
    expect(result.data?.text).toBeNull()
  })

  it('parse whitespace-only string into null', () => {
    const result = schema.safeParse({ text: '   ' })
    expect(result.success).toBeTruthy()
    expect(result.data?.text).toBeNull()
  })

  it('return failure when string character count is over the limit', () => {
    const result = schema.safeParse({ text: 'too long string' })
    expect(result.success).toBeFalsy()
    expect(result.error?.issues[0]?.message).toBe('Max 10 char allowed')
  })
})
