import { test, expect } from '../../fixtures/api-fixtures';
import { DataGenerator } from '../../utils/data-generator';
import { ResponseValidator } from '../../utils/validators';

test.describe('Comments API Tests', () => {
  test.describe('GET /comments - Retrieve all comments', () => {
    test('@smoke should retrieve all comments successfully', async ({ commentsAPI }) => {
      const response = await commentsAPI.getAllComments();

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(500);
    });

    test('should validate comment structure', async ({ commentsAPI }) => {
      const response = await commentsAPI.getAllComments();

      expect(response.status).toBe(200);
      const firstComment = response.body[0];

      expect(firstComment).toHaveProperty('postId');
      expect(firstComment).toHaveProperty('id');
      expect(firstComment).toHaveProperty('name');
      expect(firstComment).toHaveProperty('email');
      expect(firstComment).toHaveProperty('body');
    });

    test('should validate all comments have valid email format', async ({ commentsAPI }) => {
      const response = await commentsAPI.getAllComments();

      expect(response.status).toBe(200);

      // Check first 10 comments for email format
      const commentsToCheck = response.body.slice(0, 10);
      commentsToCheck.forEach(comment => {
        expect(ResponseValidator.validateEmailFormat(comment.email)).toBeTruthy();
      });
    });
  });

  test.describe('GET /comments/:id - Retrieve single comment', () => {
    test('@smoke should retrieve a single comment by ID', async ({ commentsAPI }) => {
      const commentId = 1;
      const response = await commentsAPI.getCommentById(commentId);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(commentId);
      expect(response.body).toHaveProperty('postId');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('body');
    });

    test('should return 404 for non-existent comment', async ({ commentsAPI }) => {
      const response = await commentsAPI.getCommentById(99999);

      expect(response.status).toBe(404);
    });

    test('should validate comment data types', async ({ commentsAPI }) => {
      const response = await commentsAPI.getCommentById(1);

      expect(response.status).toBe(200);
      expect(typeof response.body.id).toBe('number');
      expect(typeof response.body.postId).toBe('number');
      expect(typeof response.body.name).toBe('string');
      expect(typeof response.body.email).toBe('string');
      expect(typeof response.body.body).toBe('string');
    });
  });

  test.describe('GET /comments?postId= - Filter comments by post', () => {
    test('should retrieve comments for a specific post', async ({ commentsAPI }) => {
      const postId = 1;
      const response = await commentsAPI.getCommentsByPostId(postId);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);

      // Verify all comments belong to the specified post
      response.body.forEach(comment => {
        expect(comment.postId).toBe(postId);
      });
    });

    test('should return empty array for post with no comments', async ({ commentsAPI }) => {
      const postId = 99999;
      const response = await commentsAPI.getCommentsByPostId(postId);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(0);
    });

    test('should validate email in filtered comments', async ({ commentsAPI }) => {
      const postId = 1;
      const response = await commentsAPI.getCommentsByPostId(postId);

      expect(response.status).toBe(200);

      response.body.forEach(comment => {
        expect(ResponseValidator.validateEmailFormat(comment.email)).toBeTruthy();
      });
    });
  });

  test.describe('POST /comments - Create new comment', () => {
    test('@smoke should create a new comment successfully', async ({ commentsAPI }) => {
      const newComment = DataGenerator.generateComment(1);
      const response = await commentsAPI.createComment(newComment);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newComment.name);
      expect(response.body.email).toBe(newComment.email);
      expect(response.body.body).toBe(newComment.body);
    });

    test('should create comment with generated data', async ({ commentsAPI }) => {
      const newComment = DataGenerator.generateComment();
      const response = await commentsAPI.createComment(newComment);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });

  test.describe('PUT /comments/:id - Update entire comment', () => {
    test('should update a comment successfully', async ({ commentsAPI }) => {
      const commentId = 1;
      const updatedComment = DataGenerator.generateComment(1);
      const response = await commentsAPI.updateComment(commentId, updatedComment);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updatedComment.name);
      expect(response.body.email).toBe(updatedComment.email);
    });
  });

  test.describe('PATCH /comments/:id - Partial update comment', () => {
    test('should partially update a comment', async ({ commentsAPI }) => {
      const commentId = 1;
      const partialUpdate = {
        body: 'Updated comment body'
      };
      const response = await commentsAPI.patchComment(commentId, partialUpdate);

      expect(response.status).toBe(200);
      expect(response.body.body).toBe(partialUpdate.body);
    });
  });

  test.describe('DELETE /comments/:id - Delete comment', () => {
    test('@smoke should delete a comment successfully', async ({ commentsAPI }) => {
      const commentId = 1;
      const response = await commentsAPI.deleteComment(commentId);

      expect(response.status).toBe(200);
    });
  });

  test.describe('Performance Tests', () => {
    test('@performance should retrieve comments within threshold', async ({ commentsAPI }) => {
      const response = await commentsAPI.getAllComments();

      expect(response.status).toBe(200);
      expect(response.responseTime).toBeLessThan(1000);
    });
  });
});
