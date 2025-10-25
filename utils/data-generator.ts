import { faker } from '@faker-js/faker';
import { CreatePostPayload } from '../api/posts.api';
import { CreateUserPayload, Address, Company } from '../api/users.api';
import { CreateCommentPayload } from '../api/comments.api';
import { CreateTodoPayload } from '../api/todos.api';

export class DataGenerator {
  /**
   * Generate a random post payload
   */
  static generatePost(userId?: number): CreatePostPayload {
    return {
      userId: userId || faker.number.int({ min: 1, max: 10 }),
      title: faker.lorem.sentence(),
      body: faker.lorem.paragraphs(2),
    };
  }

  /**
   * Generate multiple random posts
   */
  static generatePosts(count: number, userId?: number): CreatePostPayload[] {
    return Array.from({ length: count }, () => this.generatePost(userId));
  }

  /**
   * Generate a random address
   */
  static generateAddress(): Address {
    return {
      street: faker.location.streetAddress(),
      suite: faker.location.secondaryAddress(),
      city: faker.location.city(),
      zipcode: faker.location.zipCode(),
      geo: {
        lat: faker.location.latitude().toString(),
        lng: faker.location.longitude().toString(),
      },
    };
  }

  /**
   * Generate a random company
   */
  static generateCompany(): Company {
    return {
      name: faker.company.name(),
      catchPhrase: faker.company.catchPhrase(),
      bs: faker.company.buzzPhrase(),
    };
  }

  /**
   * Generate a random user payload
   */
  static generateUser(includeOptionalFields: boolean = true): CreateUserPayload {
    const user: CreateUserPayload = {
      name: faker.person.fullName(),
      username: faker.internet.username(),
      email: faker.internet.email(),
    };

    if (includeOptionalFields) {
      user.address = this.generateAddress();
      user.phone = faker.phone.number();
      user.website = faker.internet.domainName();
      user.company = this.generateCompany();
    }

    return user;
  }

  /**
   * Generate multiple random users
   */
  static generateUsers(count: number, includeOptionalFields: boolean = true): CreateUserPayload[] {
    return Array.from({ length: count }, () => this.generateUser(includeOptionalFields));
  }

  /**
   * Generate a random comment payload
   */
  static generateComment(postId?: number): CreateCommentPayload {
    return {
      postId: postId || faker.number.int({ min: 1, max: 100 }),
      name: faker.lorem.sentence(),
      email: faker.internet.email(),
      body: faker.lorem.paragraph(),
    };
  }

  /**
   * Generate multiple random comments
   */
  static generateComments(count: number, postId?: number): CreateCommentPayload[] {
    return Array.from({ length: count }, () => this.generateComment(postId));
  }

  /**
   * Generate a random todo payload
   */
  static generateTodo(userId?: number): CreateTodoPayload {
    return {
      userId: userId || faker.number.int({ min: 1, max: 10 }),
      title: faker.lorem.sentence(),
      completed: faker.datatype.boolean(),
    };
  }

  /**
   * Generate multiple random todos
   */
  static generateTodos(count: number, userId?: number): CreateTodoPayload[] {
    return Array.from({ length: count }, () => this.generateTodo(userId));
  }

  /**
   * Generate a random email
   */
  static generateEmail(): string {
    return faker.internet.email();
  }

  /**
   * Generate a random string
   */
  static generateRandomString(length: number = 10): string {
    return faker.string.alpha(length);
  }

  /**
   * Generate a random number
   */
  static generateRandomNumber(min: number = 1, max: number = 1000): number {
    return faker.number.int({ min, max });
  }

  /**
   * Generate a random boolean
   */
  static generateRandomBoolean(): boolean {
    return faker.datatype.boolean();
  }

  /**
   * Generate an invalid email
   */
  static generateInvalidEmail(): string {
    return faker.lorem.word() + 'invalid-email';
  }

  /**
   * Generate an extremely long string (for negative testing)
   */
  static generateLongString(length: number = 10000): string {
    return faker.string.alpha(length);
  }

  /**
   * Generate special characters string (for testing)
   */
  static generateSpecialCharactersString(): string {
    return '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';
  }

  /**
   * Generate SQL injection string (for security testing)
   */
  static generateSQLInjectionString(): string {
    return "'; DROP TABLE users; --";
  }

  /**
   * Generate XSS payload (for security testing)
   */
  static generateXSSPayload(): string {
    return '<script>alert("XSS")</script>';
  }
}
