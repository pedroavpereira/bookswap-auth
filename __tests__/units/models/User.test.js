const db = require('../../../db/connect')
const User = require('../../../models/User')


describe('User Model', () => {

  afterEach(() => {
    jest.clearAllMocks() 
  })

  describe('User.findById', () => {
    it('should return a user object when provided a valid user_id', async () => {
      const user_id = '1'
      const mockUserData = {
        user_id: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
        first_name: 'John',
        last_name: 'Doe',
        lat: 123.456,
        lng: 789.012,
      }

      jest.spyOn(db, 'query').mockResolvedValueOnce({rows: [mockUserData]})


      const user = await User.findById(user_id)

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE user_id = $1',
        [user_id]
      )
      expect(user).toBeInstanceOf(User)
      expect(user).toMatchObject(mockUserData)
    })

    it('should throw an error if no user_id is provided', async () => {
      await expect(User.findById()).rejects.toThrow('No username provided')
    })

    it('should throw an error if user is not found', async () => {

      jest.spyOn(db, 'query').mockResolvedValueOnce({rows: []})

      await expect(User.findById('1')).rejects.toThrow('Unable to authenticate')
    })
  })

  describe('User.findByEmail', () => {
    it('should return a user object when provided a valid email', async () => {
      const email = 'test@example.com'
      const mockUserData = {
        user_id: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
        first_name: 'John',
        last_name: 'Doe',
        lat: 123.456,
        lng: 789.012,
      }

      jest.spyOn(db, 'query').mockResolvedValueOnce({rows: [mockUserData]})

      const user = await User.findByEmail(email)

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1',
        [email]
      )
      expect(user).toBeInstanceOf(User)
      expect(user).toMatchObject(mockUserData)
    })

    it('should throw an error if no email is provided', async () => {
      await expect(User.findByEmail()).rejects.toThrow('No email provided')
    })

    it('should throw an error if user is not found', async () => {
      jest.spyOn(db, 'query').mockResolvedValueOnce({rows: []})

      await expect(User.findByEmail('test@example.com')).rejects.toThrow('Unable to authenticate');
    })
  })

  describe('User.create', () => {
    it('should create and return a new user object', async () => {
      const newUserData = {
        email: 'newuser@example.com',
        password: 'hashedpassword',
        first_name: 'Jane',
        last_name: 'Doe',
        lat: 123.456,
        lng: 789.012,
      }

      const mockCreatedUser = {
        user_id: '2',
        ...newUserData,
      }

      jest.spyOn(db, 'query').mockResolvedValueOnce({rows: [mockCreatedUser]})

      const user = await User.create(newUserData)

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO users (email,password,first_name,last_name,lat,lng) VALUES($1,$2,$3,$4,$5,$6) RETURNING *;',
        [
          newUserData.email,
          newUserData.password,
          newUserData.first_name,
          newUserData.last_name,
          newUserData.lat,
          newUserData.lng,
        ]
      )
      expect(user).toBeInstanceOf(User)
      expect(user).toMatchObject(mockCreatedUser)
    })

    it('should throw an error if required fields are not provided', async () => {
      const incompleteUserData = {
        email: 'incompleteuser@example.com',
        password: 'hashedpassword',
      }

      await expect(User.create(incompleteUserData)).rejects.toThrow('Required field not provided')
    })
  })
})
