import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addToCart, getCart, CART_COOKIE } from './actions'

process.env.NEXT_PUBLIC_MEDUSA_URL = 'http://localhost:9000'

const cookieStore: any = {
  get: vi.fn(),
  set: vi.fn(),
}

vi.mock('next/headers', () => ({
  cookies: () => cookieStore,
}))

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

describe('cart server actions', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    cookieStore.get.mockReset()
    cookieStore.set.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('creates a new cart when none exists', async () => {
    cookieStore.get.mockReturnValue(undefined)
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ cart: { id: 'cart1' } }) })

    const cart = await getCart()

    expect(fetchMock).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_MEDUSA_URL}/store/carts`, { method: 'POST' })
    expect(cookieStore.set).toHaveBeenCalledWith(CART_COOKIE, 'cart1', expect.objectContaining({ httpOnly: true }))
    expect(cart.id).toBe('cart1')
  })

  it('adds an item to existing cart', async () => {
    cookieStore.get.mockReturnValue({ value: 'cart1' })
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ cart: { id: 'cart1' } }) })

    const cart = await addToCart({ variantId: 'var_1', quantity: 2 })

    expect(fetchMock).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_MEDUSA_URL}/store/carts/cart1/line-items`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    expect(cart.id).toBe('cart1')
  })

  it('validates input when adding items', async () => {
    await expect(addToCart({ variantId: '', quantity: 0 } as any)).rejects.toThrow()
  })
})
