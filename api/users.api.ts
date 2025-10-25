import { APIRequestContext } from '@playwright/test';
import { BaseAPI, ApiResponse } from './base.api';

export interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: {
    lat: string;
    lng: string;
  };
}

export interface Company {
  name: string;
  catchPhrase: string;
  bs: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website: string;
  company: Company;
}

export interface CreateUserPayload {
  name: string;
  username: string;
  email: string;
  address?: Address;
  phone?: string;
  website?: string;
  company?: Company;
}

export class UsersAPI extends BaseAPI {
  private readonly endpoint = '/users';

  constructor(request: APIRequestContext, baseURL: string) {
    super(request, baseURL);
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    return await this.get<User[]>(this.endpoint);
  }

  /**
   * Get a single user by ID
   */
  async getUserById(id: number): Promise<ApiResponse<User>> {
    return await this.get<User>(`${this.endpoint}/${id}`);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<ApiResponse<User[]>> {
    return await this.get<User[]>(this.endpoint, {
      params: { email },
    });
  }

  /**
   * Create a new user
   */
  async createUser(payload: CreateUserPayload): Promise<ApiResponse<User>> {
    return await this.post<User>(this.endpoint, {
      data: payload,
    });
  }

  /**
   * Update a user (PUT)
   */
  async updateUser(id: number, payload: CreateUserPayload): Promise<ApiResponse<User>> {
    return await this.put<User>(`${this.endpoint}/${id}`, {
      data: payload,
    });
  }

  /**
   * Partially update a user (PATCH)
   */
  async patchUser(id: number, payload: Partial<User>): Promise<ApiResponse<User>> {
    return await this.patch<User>(`${this.endpoint}/${id}`, {
      data: payload,
    });
  }

  /**
   * Delete a user
   */
  async deleteUser(id: number): Promise<ApiResponse<Record<string, never>>> {
    return await this.delete<Record<string, never>>(`${this.endpoint}/${id}`);
  }

  /**
   * Get all posts for a specific user
   */
  async getUserPosts(userId: number): Promise<ApiResponse<unknown[]>> {
    return await this.get<unknown[]>(`${this.endpoint}/${userId}/posts`);
  }

  /**
   * Get all albums for a specific user
   */
  async getUserAlbums(userId: number): Promise<ApiResponse<unknown[]>> {
    return await this.get<unknown[]>(`${this.endpoint}/${userId}/albums`);
  }

  /**
   * Get all todos for a specific user
   */
  async getUserTodos(userId: number): Promise<ApiResponse<unknown[]>> {
    return await this.get<unknown[]>(`${this.endpoint}/${userId}/todos`);
  }
}
