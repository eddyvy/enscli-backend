import { Injectable } from '@nestjs/common'
import fs from 'fs'
import path from 'path'
import sqlite3 from 'sqlite3'
import { ConfigService } from '../config'

@Injectable()
export class DatabaseService {
  private readonly databasePath: string
  private readonly migrationsPath: string
  private db: sqlite3.Database

  constructor(config: ConfigService) {
    this.databasePath = config.DB.PATH
    this.migrationsPath = config.DB.MIGRATIONS_PATH
    this.setUpDb()
  }

  async setUpDb(): Promise<void> {
    this.db = new sqlite3.Database(this.databasePath)

    // TODO Implement when a db is needed
    // let migrationFiles = fs.readdirSync(this.migrationsPath)
    // migrationFiles = migrationFiles.sort((a, b) => {
    //   const aNum = parseInt(a.split('_')[0], 10)
    //   const bNum = parseInt(b.split('_')[0], 10)
    //   return aNum - bNum
    // })

    // for (const file of migrationFiles) {
    //   const filePath = path.join(this.migrationsPath, file)
    //   const sql = fs.readFileSync(filePath, 'utf-8')

    //   this.db.run(sql, (err) => {
    //     if (err) throw err
    //   })
    // }
  }

  getDb(): sqlite3.Database {
    return this.db
  }
}
