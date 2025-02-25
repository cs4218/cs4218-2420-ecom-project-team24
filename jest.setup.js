// Polyfill for TextEncoder/TextDecoder which is required by Mongoose
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
