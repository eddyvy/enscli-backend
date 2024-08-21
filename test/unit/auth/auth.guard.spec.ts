import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthGuard } from '../../../src/auth'

describe('AuthGuard', () => {
  const mockAuthService = { validateUser: jest.fn() }
  const mockHttp = { getRequest: jest.fn() }
  const mockContext = { switchToHttp: jest.fn(() => mockHttp) }

  const token = Buffer.from('eddy:testpassword').toString('base64')

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return true if user is authenticated', async () => {
    const req = { headers: { authorization: 'Basic ' + token } }
    mockAuthService.validateUser.mockReturnValueOnce('eddy')
    mockHttp.getRequest.mockReturnValueOnce(req)

    const guard = new AuthGuard(mockAuthService as any)
    const result = await guard.canActivate(mockContext as any)

    expect(result).toBe(true)
    expect(req['user']).toBeDefined()
    expect(req['user']).toBe('eddy')

    expect(mockAuthService.validateUser).toHaveBeenCalledTimes(1)
    expect(mockAuthService.validateUser).toHaveBeenNthCalledWith(
      1,
      'eddy',
      'testpassword'
    )
  })

  it('should throw UnauthorizedException if authorization header is missing', async () => {
    const req = { headers: {} }
    mockHttp.getRequest.mockReturnValueOnce(req)

    const guard = new AuthGuard(mockAuthService as any)

    let err = null
    let result = null

    try {
      result = await guard.canActivate(mockContext as any)
    } catch (error) {
      err = error
    }

    expect(result).toBeNull()
    expect(req['user']).toBeUndefined()

    expect(err).toEqual(new UnauthorizedException())
  })

  it('should throw UnauthorizedException if authorization header is invalid', async () => {
    const req = { headers: { authorization: 'wrong auth' } }
    mockHttp.getRequest.mockReturnValueOnce(req)

    const guard = new AuthGuard(mockAuthService as any)

    let err = null
    let result = null

    try {
      result = await guard.canActivate(mockContext as any)
    } catch (error) {
      err = error
    }

    expect(result).toBeNull()
    expect(req['user']).toBeUndefined()

    expect(err).toEqual(new UnauthorizedException())
  })

  it('should throw UnauthorizedException if username or password is missing', async () => {
    const req = {
      headers: { authorization: Buffer.from('eddy:').toString('base64') },
    }
    mockHttp.getRequest.mockReturnValueOnce(req)

    const guard = new AuthGuard(mockAuthService as any)

    let err = null
    let result = null

    try {
      result = await guard.canActivate(mockContext as any)
    } catch (error) {
      err = error
    }

    expect(result).toBeNull()
    expect(req['user']).toBeUndefined()

    expect(err).toEqual(new UnauthorizedException())
  })

  it('should throw UnauthorizedException if user validation fails', async () => {
    const req = { headers: { authorization: 'Basic ' + token } }
    mockAuthService.validateUser.mockReturnValueOnce(null)
    mockHttp.getRequest.mockReturnValueOnce(req)

    const guard = new AuthGuard(mockAuthService as any)

    let err = null
    let result = null

    try {
      result = await guard.canActivate(mockContext as any)
    } catch (error) {
      err = error
    }

    expect(result).toBeNull()
    expect(req['user']).toBeUndefined()

    expect(err).toEqual(new UnauthorizedException())

    expect(mockAuthService.validateUser).toHaveBeenCalledTimes(1)
    expect(mockAuthService.validateUser).toHaveBeenNthCalledWith(
      1,
      'eddy',
      'testpassword'
    )
  })
})
