// Polyfill for TextEncoder/TextDecoder which is required by Mongoose
import { TextEncoder, TextDecoder } from 'util'
Object.assign(global, { TextDecoder, TextEncoder })
