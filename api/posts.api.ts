import { APIRequestContext } from '@playwright/test';
import { BaseAPI, ApiResponse } from './base.api';

export interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface CreatePostPayload {
  userId: number;
  title: string;
  body: string;
}

export interface UpdatePostPayload extends CreatePostPayload {
  id: number;
}

export class PostsAPI extends BaseAPI {
  private readonly endpoint = '/posts';

  constructor(request: APIRequestContext, baseURL: string) {
    super(request, baseURL);
  }

  /**
   * Get all posts
   */
  async getAllPosts(): Promise<ApiResponse<Post[]>> {
    return await this.get<Post[]>(this.endpoint);
  }

  /**
   * Get a single post by ID
   */
  async getPostById(id: number): Promise<ApiResponse<Post>> {
    return await this.get<Post>(`${this.endpoint}/${id}`);
  }

  /**
   * Get posts by user ID
   */
  async getPostsByUserId(userId: number): Promise<ApiResponse<Post[]>> {
    return await this.get<Post[]>(this.endpoint, {
      params: { userId },
    });
  }

  /**
   * Create a new post
   */
  async createPost(payload: CreatePostPayload): Promise<ApiResponse<Post>> {
    return await this.post<Post>(this.endpoint, {
      data: payload,
    });
  }

  /**
   * Update a post (PUT - full update)
   */
  async updatePost(id: number, payload: UpdatePostPayload): Promise<ApiResponse<Post>> {
    return await this.put<Post>(`${this.endpoint}/${id}`, {
      data: payload,
    });
  }

  /**
   * Partially update a post (PATCH)
   */
  async patchPost(id: number, payload: Partial<Post>): Promise<ApiResponse<Post>> {
    return await this.patch<Post>(`${this.endpoint}/${id}`, {
      data: payload,
    });
  }

  /**
   * Delete a post
   */
  async deletePost(id: number): Promise<ApiResponse<Record<string, never>>> {
    return await this.delete<Record<string, never>>(`${this.endpoint}/${id}`);
  }

  /**
   * Get comments for a specific post
   */
  async getPostComments(postId: number): Promise<ApiResponse<unknown[]>> {
    return await this.get<unknown[]>(`${this.endpoint}/${postId}/comments`);
  }
}
