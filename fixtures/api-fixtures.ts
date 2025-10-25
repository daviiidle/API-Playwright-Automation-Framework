import { test as base } from '@playwright/test';
import { PostsAPI } from '../api/posts.api';
import { UsersAPI } from '../api/users.api';
import { CommentsAPI } from '../api/comments.api';
import { TodosAPI } from '../api/todos.api';

type ApiFixtures = {
  postsAPI: PostsAPI;
  usersAPI: UsersAPI;
  commentsAPI: CommentsAPI;
  todosAPI: TodosAPI;
};

/**
 * Custom fixtures for API testing
 * These fixtures provide pre-configured API client instances for each endpoint
 */
export const test = base.extend<ApiFixtures>({
  /**
   * Posts API fixture
   */
  postsAPI: async ({ request }, use) => {
    const baseURL = process.env.BASE_URL || 'https://jsonplaceholder.typicode.com';
    const postsAPI = new PostsAPI(request, baseURL);
    await use(postsAPI);
  },

  /**
   * Users API fixture
   */
  usersAPI: async ({ request }, use) => {
    const baseURL = process.env.BASE_URL || 'https://jsonplaceholder.typicode.com';
    const usersAPI = new UsersAPI(request, baseURL);
    await use(usersAPI);
  },

  /**
   * Comments API fixture
   */
  commentsAPI: async ({ request }, use) => {
    const baseURL = process.env.BASE_URL || 'https://jsonplaceholder.typicode.com';
    const commentsAPI = new CommentsAPI(request, baseURL);
    await use(commentsAPI);
  },

  /**
   * Todos API fixture
   */
  todosAPI: async ({ request }, use) => {
    const baseURL = process.env.BASE_URL || 'https://jsonplaceholder.typicode.com';
    const todosAPI = new TodosAPI(request, baseURL);
    await use(todosAPI);
  },
});

export { expect } from '@playwright/test';
