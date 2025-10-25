import { APIRequestContext } from '@playwright/test';
import { BaseAPI, ApiResponse } from './base.api';

export interface Comment {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
}

export interface CreateCommentPayload {
  postId: number;
  name: string;
  email: string;
  body: string;
}

export class CommentsAPI extends BaseAPI {
  private readonly endpoint = '/comments';

  constructor(request: APIRequestContext, baseURL: string) {
    super(request, baseURL);
  }

  /**
   * Get all comments
   */
  async getAllComments(): Promise<ApiResponse<Comment[]>> {
    return await this.get<Comment[]>(this.endpoint);
  }

  /**
   * Get a single comment by ID
   */
  async getCommentById(id: number): Promise<ApiResponse<Comment>> {
    return await this.get<Comment>(`${this.endpoint}/${id}`);
  }

  /**
   * Get comments by post ID
   */
  async getCommentsByPostId(postId: number): Promise<ApiResponse<Comment[]>> {
    return await this.get<Comment[]>(this.endpoint, {
      params: { postId },
    });
  }

  /**
   * Create a new comment
   */
  async createComment(payload: CreateCommentPayload): Promise<ApiResponse<Comment>> {
    return await this.post<Comment>(this.endpoint, {
      data: payload,
    });
  }

  /**
   * Update a comment (PUT)
   */
  async updateComment(id: number, payload: CreateCommentPayload): Promise<ApiResponse<Comment>> {
    return await this.put<Comment>(`${this.endpoint}/${id}`, {
      data: payload,
    });
  }

  /**
   * Partially update a comment (PATCH)
   */
  async patchComment(id: number, payload: Partial<Comment>): Promise<ApiResponse<Comment>> {
    return await this.patch<Comment>(`${this.endpoint}/${id}`, {
      data: payload,
    });
  }

  /**
   * Delete a comment
   */
  async deleteComment(id: number): Promise<ApiResponse<Record<string, never>>> {
    return await this.delete<Record<string, never>>(`${this.endpoint}/${id}`);
  }
}
