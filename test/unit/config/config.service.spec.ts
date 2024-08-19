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

  it('should have valid Azure Storage configuration', async () => {
    setEnv()
    const service = await getService()

    expect(service.AZURE_STORAGE.CONNECTION_STRING).toEqual('connection-string')
    expect(service.AZURE_STORAGE.CONTAINER_NAME).toEqual('container-name')
  })

  it('should have valid Llama Cloud configuration', async () => {
    setEnv()
    const service = await getService()

    expect(service.LLAMA_CLOUD.API_KEY).toEqual('api-key')
    expect(service.LLAMA_CLOUD.API_URL).toEqual('api-url')
  })
})
