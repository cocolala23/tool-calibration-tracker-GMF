// db.js (Sesudah Perbaikan)
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL

// Tambahkan opsi 'transform' untuk mengubah snake_case menjadi camelCase
const sql = postgres(connectionString, {
  transform: {
    column: postgres.fromSnake
  }
})

export default sql