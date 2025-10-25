import { APIRequestContext } from '@playwright/test';
import { BaseAPI, ApiResponse } from './base.api';

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export interface CreateTodoPayload {
  userId: number;
  title: string;
  completed: boolean;
}

export class TodosAPI extends BaseAPI {
  private readonly endpoint = '/todos';

  constructor(request: APIRequestContext, baseURL: string) {
    super(request, baseURL);
  }

  /**
   * Get all todos
   */
  async getAllTodos(): Promise<ApiResponse<Todo[]>> {
    return await this.get<Todo[]>(this.endpoint);
  }

  /**
   * Get a single todo by ID
   */
  async getTodoById(id: number): Promise<ApiResponse<Todo>> {
    return await this.get<Todo>(`${this.endpoint}/${id}`);
  }

  /**
   * Get todos by user ID
   */
  async getTodosByUserId(userId: number): Promise<ApiResponse<Todo[]>> {
    return await this.get<Todo[]>(this.endpoint, {
      params: { userId },
    });
  }

  /**
   * Get todos by completion status
   */
  async getTodosByCompletionStatus(completed: boolean): Promise<ApiResponse<Todo[]>> {
    return await this.get<Todo[]>(this.endpoint, {
      params: { completed },
    });
  }

  /**
   * Create a new todo
   */
  async createTodo(payload: CreateTodoPayload): Promise<ApiResponse<Todo>> {
    return await this.post<Todo>(this.endpoint, {
      data: payload,
    });
  }

  /**
   * Update a todo (PUT)
   */
  async updateTodo(id: number, payload: CreateTodoPayload): Promise<ApiResponse<Todo>> {
    return await this.put<Todo>(`${this.endpoint}/${id}`, {
      data: payload,
    });
  }

  /**
   * Partially update a todo (PATCH)
   */
  async patchTodo(id: number, payload: Partial<Todo>): Promise<ApiResponse<Todo>> {
    return await this.patch<Todo>(`${this.endpoint}/${id}`, {
      data: payload,
    });
  }

  /**
   * Delete a todo
   */
  async deleteTodo(id: number): Promise<ApiResponse<Record<string, never>>> {
    return await this.delete<Record<string, never>>(`${this.endpoint}/${id}`);
  }
}
