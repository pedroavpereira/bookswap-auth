const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { login, signup, verifyToken, restrictTo } = require('../../../controllers/users')
const Users = require('../../../models/User')

jest.mock('bcrypt')
jest.mock('jsonwebtoken')
jest.mock('../../../models/User.js')

const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  send: jest.fn(),
};

describe('login', () => {
    it('should authenticate and return a token', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        }
      }
  
      const user = {
        user_id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
      }
  
      Users.findByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, 'token123');
      })
  
      await login(req, res);
  
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'token123',
        user: {
          user_id: user.user_id,
          email: user.email,
          first_name: undefined,
          last_name: undefined,
          lat: undefined,
          lng: undefined,
        }
      })
    })
  
    it('should return 403 if authentication fails', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        }
      }
  
      Users.findByEmail.mockResolvedValue({
        password: 'hashedPassword',
      })
      bcrypt.compare.mockResolvedValue(false)
  
      await login(req, res)
  
      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unable to authenticate',
      })
    })
  
    it('should handle errors when generating token', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        }
      }
  
      const user = {
        user_id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
      }
  
      Users.findByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(new Error('Error generating token'), null);
      })
  
      await login(req, res)
  
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Error generating token',
      })
    })
})

describe('signup', () => {
    it('should create a user and return a token', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        }
      }
  
      const newUser = {
        user_id: '1',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        lat: 123.456,
        lng: 789.012,
      }
  
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      Users.create.mockResolvedValue(newUser);
      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, 'token123')
      })
  
      await signup(req, res)
  
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'token123',
        user: {
          user_id: newUser.user_id,
          email: newUser.email,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          lat: newUser.lat,
          lng: newUser.lng,
        },
      })
    })

    it('should handle errors when generating token during signup', async () => {
        const req = {
            body: {
                email: 'test@example.com',
                password: 'password123',
                first_name: 'John',
                last_name: 'Doe',
                lat: 123.456,
                lng: 789.012,
            }
        }

        const newUser = {
            user_id: '1',
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            lat: 123.456,
            lng: 789.012,
        }

        bcrypt.genSalt.mockResolvedValue('salt')
        bcrypt.hash.mockResolvedValue('hashedPassword')
        Users.create.mockResolvedValue(newUser);
        jwt.sign.mockImplementation((payload, secret, options, callback) => {
            callback(new Error('Error generating token'), null)
        })

        await signup(req, res)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: 'Error generating token',
        })
    })

    it('should handle errors during signup', async () => {
      const req = {
        body: {
          email: 'test@example.com',
          password: 'password123',
        }
      }
  
      bcrypt.genSalt.mockResolvedValue('salt')
      bcrypt.hash.mockResolvedValue('hashedPassword')
      Users.create.mockRejectedValue(new Error('Error creating user'))
  
      await signup(req, res)
  
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        error: 'Error creating user',
      })
    })
})
  
describe('verifyToken', () => {
    it('should return user data if authenticated', () => {
      const req = {
        user: {
          user_id: '1',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          lat: 123.456,
          lng: 789.012,
        }
      }
  
      verifyToken(req, res)
  
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: req.user,
      })
    })
  
    it('should return 401 if not authenticated', () => {
      const req = {}
  
      verifyToken(req, res);
  
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'This route requires authentication',
      })
    })
})
  
describe('restrictTo', () => {
    let req
    let res
  
    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      }
    })
  
    it('should allow access if the user has the required role', () => {
      req = {
        user: {
          user_id: '1',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          lat: 123.456,
          lng: 789.012,
          role: 'admin',  // This is necessary for the check, but it won't be included in the response
        },
        body: {
          allowedRoles: ['admin'],
        }
      }
  
      restrictTo(req, res)
  
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        user: {
          user_id: '1',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          lat: 123.456,
          lng: 789.012,
        }
      })
    })
  
    it('should deny access if the user does not have the required role', () => {
      req = {
        user: {
          user_id: '1',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          lat: 123.456,
          lng: 789.012,
          role: 'user',
        },
        body: {
          allowedRoles: ['admin'],
        }
      }
  
      restrictTo(req, res);
  
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not Authorized',
      })
    })
})
