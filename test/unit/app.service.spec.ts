import { AppService } from '../../src/app.service'

describe('AppService', () => {
  let appService: AppService

  beforeEach(() => {
    appService = new AppService()
  })

  describe('getHealth', () => {
    it('should return an object with a status property set to "UP"', () => {
      expect(appService.getHealth()).toEqual({ status: 'UP' })
    })
  })
})
