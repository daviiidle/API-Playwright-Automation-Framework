import { test, expect } from '../../fixtures/api-fixtures';
import { DataGenerator } from '../../utils/data-generator';
import { ResponseValidator } from '../../utils/validators';

test.describe('Todos API Tests', () => {
  test.describe('GET /todos - Retrieve all todos', () => {
    test('@smoke should retrieve all todos successfully', async ({ todosAPI }) => {
      const response = await todosAPI.getAllTodos();

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(200);
    });

    test('should validate todo structure', async ({ todosAPI }) => {
      const response = await todosAPI.getAllTodos();

      expect(response.status).toBe(200);
      const firstTodo = response.body[0];

      expect(firstTodo).toHaveProperty('userId');
      expect(firstTodo).toHaveProperty('id');
      expect(firstTodo).toHaveProperty('title');
      expect(firstTodo).toHaveProperty('completed');
    });

    test('should validate completed field is boolean', async ({ todosAPI }) => {
      const response = await todosAPI.getAllTodos();

      expect(response.status).toBe(200);

      // Check first 10 todos
      const todosToCheck = response.body.slice(0, 10);
      todosToCheck.forEach(todo => {
        expect(typeof todo.completed).toBe('boolean');
      });
    });
  });

  test.describe('GET /todos/:id - Retrieve single todo', () => {
    test('@smoke should retrieve a single todo by ID', async ({ todosAPI }) => {
      const todoId = 1;
      const response = await todosAPI.getTodoById(todoId);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(todoId);
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('completed');
    });

    test('should return 404 for non-existent todo', async ({ todosAPI }) => {
      const response = await todosAPI.getTodoById(99999);

      expect(response.status).toBe(404);
    });

    test('should validate todo data types', async ({ todosAPI }) => {
      const response = await todosAPI.getTodoById(1);

      expect(response.status).toBe(200);
      expect(typeof response.body.id).toBe('number');
      expect(typeof response.body.userId).toBe('number');
      expect(typeof response.body.title).toBe('string');
      expect(typeof response.body.completed).toBe('boolean');
    });

    test('should validate boolean field', async ({ todosAPI }) => {
      const response = await todosAPI.getTodoById(1);

      expect(response.status).toBe(200);
      ResponseValidator.validateBoolean(response.body.completed, 'completed');
    });
  });

  test.describe('GET /todos?userId= - Filter todos by user', () => {
    test('should retrieve todos for a specific user', async ({ todosAPI }) => {
      const userId = 1;
      const response = await todosAPI.getTodosByUserId(userId);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);

      // Verify all todos belong to the specified user
      response.body.forEach(todo => {
        expect(todo.userId).toBe(userId);
      });
    });

    test('should return empty array for user with no todos', async ({ todosAPI }) => {
      const userId = 99999;
      const response = await todosAPI.getTodosByUserId(userId);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(0);
    });
  });

  test.describe('GET /todos?completed= - Filter by completion status', () => {
    test('should retrieve only completed todos', async ({ todosAPI }) => {
      const response = await todosAPI.getTodosByCompletionStatus(true);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);

      // Verify all todos are completed
      response.body.forEach(todo => {
        expect(todo.completed).toBe(true);
      });
    });

    test('should retrieve only incomplete todos', async ({ todosAPI }) => {
      const response = await todosAPI.getTodosByCompletionStatus(false);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);

      // Verify all todos are incomplete
      response.body.forEach(todo => {
        expect(todo.completed).toBe(false);
      });
    });
  });

  test.describe('POST /todos - Create new todo', () => {
    test('@smoke should create a new todo successfully', async ({ todosAPI }) => {
      const newTodo = DataGenerator.generateTodo(1);
      const response = await todosAPI.createTodo(newTodo);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newTodo.title);
      expect(response.body.completed).toBe(newTodo.completed);
      expect(response.body.userId).toBe(newTodo.userId);
    });

    test('should create completed todo', async ({ todosAPI }) => {
      const newTodo = {
        userId: 1,
        title: 'Completed Todo',
        completed: true
      };
      const response = await todosAPI.createTodo(newTodo);

      expect(response.status).toBe(201);
      expect(response.body.completed).toBe(true);
    });

    test('should create incomplete todo', async ({ todosAPI }) => {
      const newTodo = {
        userId: 1,
        title: 'Incomplete Todo',
        completed: false
      };
      const response = await todosAPI.createTodo(newTodo);

      expect(response.status).toBe(201);
      expect(response.body.completed).toBe(false);
    });
  });

  test.describe('PUT /todos/:id - Update entire todo', () => {
    test('should update a todo successfully', async ({ todosAPI }) => {
      const todoId = 1;
      const updatedTodo = {
        userId: 1,
        title: 'Updated Todo Title',
        completed: true
      };
      const response = await todosAPI.updateTodo(todoId, updatedTodo);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updatedTodo.title);
      expect(response.body.completed).toBe(updatedTodo.completed);
    });

    test('should toggle completion status', async ({ todosAPI }) => {
      const todoId = 1;

      // First get the current state
      const currentState = await todosAPI.getTodoById(todoId);

      // Update with opposite completion status
      const updatedTodo = {
        userId: 1,
        title: 'Toggle Test',
        completed: !currentState.body.completed
      };
      const response = await todosAPI.updateTodo(todoId, updatedTodo);

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(updatedTodo.completed);
    });
  });

  test.describe('PATCH /todos/:id - Partial update todo', () => {
    test('should partially update a todo title', async ({ todosAPI }) => {
      const todoId = 1;
      const partialUpdate = {
        title: 'Partially Updated Title'
      };
      const response = await todosAPI.patchTodo(todoId, partialUpdate);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(partialUpdate.title);
    });

    test('should partially update completion status', async ({ todosAPI }) => {
      const todoId = 1;
      const partialUpdate = {
        completed: true
      };
      const response = await todosAPI.patchTodo(todoId, partialUpdate);

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(true);
    });
  });

  test.describe('DELETE /todos/:id - Delete todo', () => {
    test('@smoke should delete a todo successfully', async ({ todosAPI }) => {
      const todoId = 1;
      const response = await todosAPI.deleteTodo(todoId);

      expect(response.status).toBe(200);
    });
  });

  test.describe('Negative Tests', () => {
    test('should handle invalid todo ID', async ({ todosAPI }) => {
      const response = await todosAPI.getTodoById(0);

      expect([200, 404]).toContain(response.status);
    });

    test('should validate boolean field type enforcement', async ({ todosAPI }) => {
      const response = await todosAPI.getTodoById(1);

      expect(response.status).toBe(200);
      expect([true, false]).toContain(response.body.completed);
    });
  });

  test.describe('Performance Tests', () => {
    test('@performance should retrieve todos within threshold', async ({ todosAPI }) => {
      const response = await todosAPI.getAllTodos();

      expect(response.status).toBe(200);
      expect(response.responseTime).toBeLessThan(800);
    });

    test('@performance should filter by completion quickly', async ({ todosAPI }) => {
      const response = await todosAPI.getTodosByCompletionStatus(true);

      expect(response.status).toBe(200);
      expect(response.responseTime).toBeLessThan(600);
    });
  });
});
