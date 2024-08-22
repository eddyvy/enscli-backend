import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '../../../src/config'
import { clearEnv, setEnv } from '../../helper/env'

describe('ConfigService', () => {
  async function getService() {
    return (
      await Test.createTestingModule({
        providers: [ConfigService],
      }).compile()
    ).get<ConfigService>(ConfigService)
  }

  afterEach(() => {
    clearEnv()
  })

  it('should be defined', async () => {
    setEnv()
    const service = await getService()
    expect(service).toBeDefined()
  })

  it('should throw', async () => {
    let service = null
    let error = null

    try {
      service = await getService()
    } catch (err) {
      error = err
    }

    expect(service).toBeNull()
    expect(error).toBeDefined()
  })
})
