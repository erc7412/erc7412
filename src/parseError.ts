import * as viem from 'viem'

export function parseError(error: any): viem.Hex {
  try {
    if (viem.isHex(error)) {
      return error
    }
    if (viem.isHex(error.raw)) {
      return error.raw
    }
    if (viem.isHex(error.data)) {
      return error.data
    }
    if (viem.isHex(error.error?.data)) {
      return error.error.data
    }
    if (error.cause) {
      return parseError(error.cause)
    }
  } catch (err) {
    // console.error('exception in erc7412 error parser:', err)
  }
  // rethrow the error (and log it so we can see the original)
  // console.error('got unknown error in erc7412 parse', error)
  throw error
}
