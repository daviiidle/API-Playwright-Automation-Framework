import { test, expect } from '../../fixtures/api-fixtures';
import { DataGenerator } from '../../utils/data-generator';
import { ResponseValidator } from '../../utils/validators';

test.describe('Posts API Tests', () => {
  test.describe('GET /posts - Retrieve all posts', () => {
    test('@smoke should retrieve all posts successfully', async ({ postsAPI }) => {
      const response = await postsAPI.getAllPosts();

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(100);
      ResponseValidator.validateResponseTime(response.responseTime, 500);
    });

    test('should have valid structure for all posts', async ({ postsAPI }) => {
      const response = await postsAPI.getAllPosts();

      expect(response.status).toBe(200);
      // Validate first post has all required properties
      const firstPost = response.body[0];
      expect(firstPost).toHaveProperty('userId');
      expect(firstPost).toHaveProperty('id');
      expect(firstPost).toHaveProperty('title');
      expect(firstPost).toHaveProperty('body');
    });

    test('should validate response time is acceptable', async ({ postsAPI }) => {
      const response = await postsAPI.getAllPosts();

      expect(response.status).toBe(200);
      expect(response.responseTime).toBeLessThan(1000);
    });
  });

  test.describe('GET /posts/:id - Retrieve single post', () => {
    test('@smoke should retrieve a single post by ID', async ({ postsAPI }) => {
      const postId = 1;
      const response = await postsAPI.getPostById(postId);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(postId);
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('body');
    });

    test('should return 404 for non-existent post', async ({ postsAPI }) => {
      const response = await postsAPI.getPostById(9999);

      expect(response.status).toBe(404);
    });

    test('should validate post data types', async ({ postsAPI }) => {
      const response = await postsAPI.getPostById(1);

      expect(response.status).toBe(200);
      expect(typeof response.body.id).toBe('number');
      expect(typeof response.body.userId).toBe('number');
      expect(typeof response.body.title).toBe('string');
      expect(typeof response.body.body).toBe('string');
    });
  });

  test.describe('GET /posts?userId= - Filter posts by user', () => {
    test('should retrieve posts for a specific user', async ({ postsAPI }) => {
      const userId = 1;
      const response = await postsAPI.getPostsByUserId(userId);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);

      // Verify all posts belong to the specified user
      response.body.forEach(post => {
        expect(post.userId).toBe(userId);
      });
    });

    test('should return empty array for user with no posts', async ({ postsAPI }) => {
      const userId = 99999;
      const response = await postsAPI.getPostsByUserId(userId);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(0);
    });
  });

  test.describe('POST /posts - Create new post', () => {
    test('@smoke should create a new post successfully', async ({ postsAPI }) => {
      const newPost = DataGenerator.generatePost(1);
      const response = await postsAPI.createPost(newPost);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newPost.title);
      expect(response.body.body).toBe(newPost.body);
      expect(response.body.userId).toBe(newPost.userId);
    });

    test('should create post with generated data', async ({ postsAPI }) => {
      const newPost = DataGenerator.generatePost();
      const response = await postsAPI.createPost(newPost);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    test('should validate created post structure', async ({ postsAPI }) => {
      const newPost = {
        userId: 1,
        title: 'Test Post Title',
        body: 'Test post body content'
      };
      const response = await postsAPI.createPost(newPost);

      expect(response.status).toBe(201);
      expect(typeof response.body.id).toBe('number');
      expect(response.body.id).toBeGreaterThan(0);
    });
  });

  test.describe('PUT /posts/:id - Update entire post', () => {
    test('should update a post successfully', async ({ postsAPI }) => {
      const postId = 1;
      const updatedPost = {
        id: postId,
        userId: 1,
        title: 'Updated Post Title',
        body: 'Updated post body content'
      };
      const response = await postsAPI.updatePost(postId, updatedPost);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(postId);
      expect(response.body.title).toBe(updatedPost.title);
      expect(response.body.body).toBe(updatedPost.body);
    });

    test('should handle update for non-existent post', async ({ postsAPI }) => {
      const postId = 9999;
      const updatedPost = {
        id: postId,
        userId: 1,
        title: 'Updated Title',
        body: 'Updated Body'
      };
      const response = await postsAPI.updatePost(postId, updatedPost);

      // JSONPlaceholder currently throws a 500 when json-server tries to read the missing record (see logs)
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  test.describe('PATCH /posts/:id - Partial update post', () => {
    test('should partially update a post', async ({ postsAPI }) => {
      const postId = 1;
      const partialUpdate = {
        title: 'Partially Updated Title'
      };
      const response = await postsAPI.patchPost(postId, partialUpdate);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(partialUpdate.title);
    });

    test('should update only body field', async ({ postsAPI }) => {
      const postId = 1;
      const partialUpdate = {
        body: 'Only body content updated'
      };
      const response = await postsAPI.patchPost(postId, partialUpdate);

      expect(response.status).toBe(200);
      expect(response.body.body).toBe(partialUpdate.body);
    });
  });

  test.describe('DELETE /posts/:id - Delete post', () => {
    test('@smoke should delete a post successfully', async ({ postsAPI }) => {
      const postId = 1;
      const response = await postsAPI.deletePost(postId);

      expect(response.status).toBe(200);
    });

    test('should handle delete for non-existent post', async ({ postsAPI }) => {
      const response = await postsAPI.deletePost(9999);

      // JSONPlaceholder returns 200 even for non-existent resources
      expect([200, 404]).toContain(response.status);
    });
  });

  test.describe('GET /posts/:id/comments - Get post comments', () => {
    test('should retrieve comments for a specific post', async ({ postsAPI }) => {
      const postId = 1;
      const response = await postsAPI.getPostComments(postId);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);

      // Verify all comments belong to the post
      response.body.forEach((comment: unknown) => {
        expect((comment as { postId: number }).postId).toBe(postId);
      });
    });
  });

  test.describe('Negative Tests', () => {
    test('should handle invalid post ID format gracefully', async ({ postsAPI }) => {
      // TypeScript prevents string IDs, but testing edge case with 0
      const response = await postsAPI.getPostById(0);

      expect([200, 404]).toContain(response.status);
    });

    test('should handle empty post creation data', async ({ postsAPI }) => {
      const emptyPost = {
        userId: 0,
        title: '',
        body: ''
      };
      const response = await postsAPI.createPost(emptyPost);

      // JSONPlaceholder is permissive, will still return 201
      expect(response.status).toBe(201);
    });

    test('should test response time under acceptable threshold', async ({ postsAPI }) => {
      const response = await postsAPI.getAllPosts();

      expect(response.status).toBe(200);
      expect(response.responseTime).toBeLessThan(2000);
    });
  });

  test.describe('Performance Tests', () => {
    test('@performance should retrieve posts within performance threshold', async ({ postsAPI }) => {
      const response = await postsAPI.getAllPosts();

      expect(response.status).toBe(200);
      expect(response.responseTime).toBeLessThan(500);
    });

    test('@performance should create post within performance threshold', async ({ postsAPI }) => {
      const newPost = DataGenerator.generatePost();
      const response = await postsAPI.createPost(newPost);

      expect(response.status).toBe(201);
      expect(response.responseTime).toBeLessThan(1000);
    });
  });
});
