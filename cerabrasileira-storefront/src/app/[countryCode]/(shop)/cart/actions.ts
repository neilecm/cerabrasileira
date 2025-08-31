'use server'

import { cookies } from 'next/headers'
import { z } from 'zod'

const MEDUSA_API = process.env.NEXT_PUBLIC_MEDUSA_URL || ''
export const CART_COOKIE = 'cb_cart_id'

async function createCart(cookieStore: ReturnType<typeof cookies>) {
  const res = await fetch(`${MEDUSA_API}/store/carts`, { method: 'POST' })
  if (!res.ok) {
    throw new Error('Failed to create cart')
  }
  const { cart } = await res.json()
  cookieStore.set(CART_COOKIE, cart.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
  return cart
}

export async function getCart() {
  const cookieStore = cookies()
  let cartId = cookieStore.get(CART_COOKIE)?.value
  if (!cartId) {
    return await createCart(cookieStore)
  }
  const res = await fetch(`${MEDUSA_API}/store/carts/${cartId}`)
  if (!res.ok) {
    throw new Error('Failed to retrieve cart')
  }
  const { cart } = await res.json()
  return cart
}

const AddItemSchema = z.object({
  variantId: z.string(),
  quantity: z.number().int().positive().default(1),
})

export async function addToCart(input: z.infer<typeof AddItemSchema>) {
  const { variantId, quantity } = AddItemSchema.parse(input)
  const cookieStore = cookies()
  let cartId = cookieStore.get(CART_COOKIE)?.value
  if (!cartId) {
    const cart = await createCart(cookieStore)
    cartId = cart.id
  }
  const res = await fetch(`${MEDUSA_API}/store/carts/${cartId}/line-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ variant_id: variantId, quantity }),
  })
  if (!res.ok) {
    throw new Error('Failed to add line item')
  }
  const { cart } = await res.json()
  return cart
}

const UpdateItemSchema = z.object({
  lineId: z.string(),
  quantity: z.number().int().positive(),
})

export async function updateLineItem(input: z.infer<typeof UpdateItemSchema>) {
  const { lineId, quantity } = UpdateItemSchema.parse(input)
  const cookieStore = cookies()
  const cartId = cookieStore.get(CART_COOKIE)?.value
  if (!cartId) {
    throw new Error('Missing cart id')
  }
  const res = await fetch(`${MEDUSA_API}/store/carts/${cartId}/line-items/${lineId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  })
  if (!res.ok) {
    throw new Error('Failed to update line item')
  }
  const { cart } = await res.json()
  return cart
}

const RemoveItemSchema = z.object({
  lineId: z.string(),
})

export async function removeLineItem(input: z.infer<typeof RemoveItemSchema>) {
  const { lineId } = RemoveItemSchema.parse(input)
  const cookieStore = cookies()
  const cartId = cookieStore.get(CART_COOKIE)?.value
  if (!cartId) {
    throw new Error('Missing cart id')
  }
  const res = await fetch(`${MEDUSA_API}/store/carts/${cartId}/line-items/${lineId}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    throw new Error('Failed to remove line item')
  }
  const { cart } = await res.json()
  return cart
}
