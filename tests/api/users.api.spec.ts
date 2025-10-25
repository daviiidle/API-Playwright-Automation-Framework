import { test, expect } from '../../fixtures/api-fixtures';
import { DataGenerator } from '../../utils/data-generator';
import { ResponseValidator } from '../../utils/validators';

test.describe('Users API Tests', () => {
  test.describe('GET /users - Retrieve all users', () => {
    test('@smoke should retrieve all users successfully', async ({ usersAPI }) => {
      const response = await usersAPI.getAllUsers();

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(10);
    });

    test('should validate user structure', async ({ usersAPI }) => {
      const response = await usersAPI.getAllUsers();

      expect(response.status).toBe(200);
      const firstUser = response.body[0];

      expect(firstUser).toHaveProperty('id');
      expect(firstUser).toHaveProperty('name');
      expect(firstUser).toHaveProperty('username');
      expect(firstUser).toHaveProperty('email');
      expect(firstUser).toHaveProperty('address');
      expect(firstUser).toHaveProperty('phone');
      expect(firstUser).toHaveProperty('website');
      expect(firstUser).toHaveProperty('company');
    });

    test('should validate nested address structure', async ({ usersAPI }) => {
      const response = await usersAPI.getAllUsers();

      expect(response.status).toBe(200);
      const firstUser = response.body[0];

      expect(firstUser.address).toHaveProperty('street');
      expect(firstUser.address).toHaveProperty('suite');
      expect(firstUser.address).toHaveProperty('city');
      expect(firstUser.address).toHaveProperty('zipcode');
      expect(firstUser.address).toHaveProperty('geo');
      expect(firstUser.address.geo).toHaveProperty('lat');
      expect(firstUser.address.geo).toHaveProperty('lng');
    });

    test('should validate nested company structure', async ({ usersAPI }) => {
      const response = await usersAPI.getAllUsers();

      expect(response.status).toBe(200);
      const firstUser = response.body[0];

      expect(firstUser.company).toHaveProperty('name');
      expect(firstUser.company).toHaveProperty('catchPhrase');
      expect(firstUser.company).toHaveProperty('bs');
    });
  });

  test.describe('GET /users/:id - Retrieve single user', () => {
    test('@smoke should retrieve a single user by ID', async ({ usersAPI }) => {
      const userId = 1;
      const response = await usersAPI.getUserById(userId);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
    });

    test('should return 404 for non-existent user', async ({ usersAPI }) => {
      const response = await usersAPI.getUserById(9999);

      expect(response.status).toBe(404);
    });

    test('should validate email format', async ({ usersAPI }) => {
      const response = await usersAPI.getUserById(1);

      expect(response.status).toBe(200);
      expect(ResponseValidator.validateEmailFormat(response.body.email)).toBeTruthy();
    });

    test('should validate coordinate data types', async ({ usersAPI }) => {
      const response = await usersAPI.getUserById(1);

      expect(response.status).toBe(200);
      const { lat, lng } = response.body.address.geo;

      // Coordinates are strings in JSONPlaceholder
      expect(typeof lat).toBe('string');
      expect(typeof lng).toBe('string');

      // Should be parseable as numbers
      expect(parseFloat(lat)).not.toBeNaN();
      expect(parseFloat(lng)).not.toBeNaN();
    });
  });

  test.describe('GET /users?email= - Filter users by email', () => {
    test('should retrieve user by email', async ({ usersAPI }) => {
      const email = 'Sincere@april.biz';
      const response = await usersAPI.getUserByEmail(email);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();

      if (response.body.length > 0) {
        expect(response.body[0].email).toBe(email);
      }
    });

    test('should return empty array for non-existent email', async ({ usersAPI }) => {
      const response = await usersAPI.getUserByEmail('nonexistent@test.com');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(0);
    });
  });

  test.describe('POST /users - Create new user', () => {
    test('@smoke should create a new user successfully', async ({ usersAPI }) => {
      const newUser = DataGenerator.generateUser(true);
      const response = await usersAPI.createUser(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newUser.name);
      expect(response.body.email).toBe(newUser.email);
    });

    test('should create user with minimal data', async ({ usersAPI }) => {
      const newUser = DataGenerator.generateUser(false);
      const response = await usersAPI.createUser(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    test('should create user with complete data', async ({ usersAPI }) => {
      const newUser = DataGenerator.generateUser(true);
      const response = await usersAPI.createUser(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('number');
    });
  });

  test.describe('PUT /users/:id - Update entire user', () => {
    test('should update a user successfully', async ({ usersAPI }) => {
      const userId = 1;
      const updatedUser = DataGenerator.generateUser(true);
      const response = await usersAPI.updateUser(userId, updatedUser);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updatedUser.name);
      expect(response.body.email).toBe(updatedUser.email);
    });
  });

  test.describe('PATCH /users/:id - Partial update user', () => {
    test('should partially update a user', async ({ usersAPI }) => {
      const userId = 1;
      const partialUpdate = {
        name: 'Updated Name'
      };
      const response = await usersAPI.patchUser(userId, partialUpdate);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(partialUpdate.name);
    });

    test('should update only email field', async ({ usersAPI }) => {
      const userId = 1;
      const partialUpdate = {
        email: 'newemail@example.com'
      };
      const response = await usersAPI.patchUser(userId, partialUpdate);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe(partialUpdate.email);
    });
  });

  test.describe('DELETE /users/:id - Delete user', () => {
    test('@smoke should delete a user successfully', async ({ usersAPI }) => {
      const userId = 1;
      const response = await usersAPI.deleteUser(userId);

      expect(response.status).toBe(200);
    });
  });

  test.describe('Nested Resources', () => {
    test('should get all posts for a specific user', async ({ usersAPI }) => {
      const userId = 1;
      const response = await usersAPI.getUserPosts(userId);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);

      // Verify all posts belong to the user
      response.body.forEach((post: unknown) => {
        expect((post as { userId: number }).userId).toBe(userId);
      });
    });

    test('should get all albums for a specific user', async ({ usersAPI }) => {
      const userId = 1;
      const response = await usersAPI.getUserAlbums(userId);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('should get all todos for a specific user', async ({ usersAPI }) => {
      const userId = 1;
      const response = await usersAPI.getUserTodos(userId);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);

      // Verify all todos belong to the user
      response.body.forEach((todo: unknown) => {
        expect((todo as { userId: number }).userId).toBe(userId);
      });
    });
  });

  test.describe('Negative Tests', () => {
    test('should handle invalid user ID', async ({ usersAPI }) => {
      const response = await usersAPI.getUserById(0);

      expect([200, 404]).toContain(response.status);
    });

    test('should validate all users have valid email format', async ({ usersAPI }) => {
      const response = await usersAPI.getAllUsers();

      expect(response.status).toBe(200);

      response.body.forEach(user => {
        expect(ResponseValidator.validateEmailFormat(user.email)).toBeTruthy();
      });
    });
  });

  test.describe('Performance Tests', () => {
    test('@performance should retrieve users within performance threshold', async ({ usersAPI }) => {
      const response = await usersAPI.getAllUsers();

      expect(response.status).toBe(200);
      expect(response.responseTime).toBeLessThan(500);
    });

    test('@performance should retrieve single user quickly', async ({ usersAPI }) => {
      const response = await usersAPI.getUserById(1);

      expect(response.status).toBe(200);
      expect(response.responseTime).toBeLessThan(300);
    });
  });
});
