import { test, expect } from '../../fixtures/api-fixtures';
import { DataGenerator } from '../../utils/data-generator';

/**
 * Integration tests - Testing interactions between different endpoints
 */
test.describe('Integration Tests', () => {
  test.describe('User and Posts Integration', () => {
    test('@integration should verify user posts relationship', async ({ usersAPI, postsAPI }) => {
      const userId = 1;

      // Get user
      const userResponse = await usersAPI.getUserById(userId);
      expect(userResponse.status).toBe(200);

      // Get user's posts
      const postsResponse = await postsAPI.getPostsByUserId(userId);
      expect(postsResponse.status).toBe(200);

      // Verify all posts belong to the user
      postsResponse.body.forEach(post => {
        expect(post.userId).toBe(userId);
      });
    });

    test('@integration should verify user todos relationship', async ({ usersAPI, todosAPI }) => {
      const userId = 1;

      // Get user
      const userResponse = await usersAPI.getUserById(userId);
      expect(userResponse.status).toBe(200);

      // Get user's todos
      const todosResponse = await todosAPI.getTodosByUserId(userId);
      expect(todosResponse.status).toBe(200);

      // Verify all todos belong to the user
      todosResponse.body.forEach(todo => {
        expect(todo.userId).toBe(userId);
      });
    });
  });

  test.describe('Posts and Comments Integration', () => {
    test('@integration should verify post comments relationship', async ({ postsAPI, commentsAPI }) => {
      const postId = 1;

      // Get post
      const postResponse = await postsAPI.getPostById(postId);
      expect(postResponse.status).toBe(200);

      // Get post's comments
      const commentsResponse = await commentsAPI.getCommentsByPostId(postId);
      expect(commentsResponse.status).toBe(200);

      // Verify all comments belong to the post
      commentsResponse.body.forEach(comment => {
        expect(comment.postId).toBe(postId);
      });
    });

    test('@integration should create post and verify it exists', async ({ postsAPI }) => {
      // Create a new post
      const newPost = DataGenerator.generatePost(1);
      const createResponse = await postsAPI.createPost(newPost);
      expect(createResponse.status).toBe(201);

      expect(createResponse.body.id).toBeDefined();

      // Note: JSONPlaceholder doesn't persist data, but we verify the response structure
      expect(createResponse.body.title).toBe(newPost.title);
      expect(createResponse.body.body).toBe(newPost.body);
    });
  });

  test.describe('Complete Workflow Tests', () => {
    test('@workflow should complete full CRUD workflow for post', async ({ postsAPI }) => {
      // CREATE
      const newPost = DataGenerator.generatePost(1);
      const createResponse = await postsAPI.createPost(newPost);
      expect(createResponse.status).toBe(201);
      expect(createResponse.body.id).toBeDefined();

      // READ
      const readResponse = await postsAPI.getPostById(1); // Using ID 1 as JSONPlaceholder doesn't persist
      expect(readResponse.status).toBe(200);

      // UPDATE
      const updatedPost = {
        id: 1,
        userId: 1,
        title: 'Updated Title',
        body: 'Updated Body'
      };
      const updateResponse = await postsAPI.updatePost(1, updatedPost);
      expect(updateResponse.status).toBe(200);

      // PATCH
      const patchResponse = await postsAPI.patchPost(1, { title: 'Patched Title' });
      expect(patchResponse.status).toBe(200);

      // DELETE
      const deleteResponse = await postsAPI.deletePost(1);
      expect(deleteResponse.status).toBe(200);
    });

    test('@workflow should handle multiple users and their data', async ({ usersAPI, postsAPI, todosAPI }) => {
      const userIds = [1, 2, 3];

      for (const userId of userIds) {
        // Get user
        const userResponse = await usersAPI.getUserById(userId);
        expect(userResponse.status).toBe(200);

        // Get user's posts
        const postsResponse = await postsAPI.getPostsByUserId(userId);
        expect(postsResponse.status).toBe(200);
        expect(Array.isArray(postsResponse.body)).toBeTruthy();

        // Get user's todos
        const todosResponse = await todosAPI.getTodosByUserId(userId);
        expect(todosResponse.status).toBe(200);
        expect(Array.isArray(todosResponse.body)).toBeTruthy();
      }
    });
  });

  test.describe('Data-Driven Tests', () => {
    const testData = [
      { userId: 1, expectedPostCount: 10 },
      { userId: 2, expectedPostCount: 10 },
      { userId: 3, expectedPostCount: 10 },
    ];

    testData.forEach(({ userId, expectedPostCount }) => {
      test(`should verify user ${userId} has ${expectedPostCount} posts`, async ({ postsAPI }) => {
        const response = await postsAPI.getPostsByUserId(userId);

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(expectedPostCount);
      });
    });

    const completionStatuses = [true, false];

    completionStatuses.forEach((completed) => {
      test(`should filter todos by completion status: ${completed}`, async ({ todosAPI }) => {
        const response = await todosAPI.getTodosByCompletionStatus(completed);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBeGreaterThan(0);

        response.body.forEach(todo => {
          expect(todo.completed).toBe(completed);
        });
      });
    });
  });

  test.describe('Concurrent Operations', () => {
    test('@concurrent should handle multiple API calls concurrently', async ({ postsAPI, usersAPI, commentsAPI, todosAPI }) => {
      // Execute multiple API calls concurrently
      const [postsResponse, usersResponse, commentsResponse, todosResponse] = await Promise.all([
        postsAPI.getAllPosts(),
        usersAPI.getAllUsers(),
        commentsAPI.getAllComments(),
        todosAPI.getAllTodos(),
      ]);

      // Verify all responses
      expect(postsResponse.status).toBe(200);
      expect(usersResponse.status).toBe(200);
      expect(commentsResponse.status).toBe(200);
      expect(todosResponse.status).toBe(200);

      // Verify data integrity
      expect(postsResponse.body.length).toBe(100);
      expect(usersResponse.body.length).toBe(10);
      expect(commentsResponse.body.length).toBe(500);
      expect(todosResponse.body.length).toBe(200);
    });
  });
});
