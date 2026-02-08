import { TodoRepository } from "./repositories/todo";
import { UserRepository } from "./repositories/user";
import { TokenRepository } from "./repositories/token";
import { TodoService } from "./services/todo";
import { AuthService } from "./services/auth";
import { TodoController } from "./controllers/todo";
import { HealthController } from "./controllers/health";
import { AuthController } from "./controllers/auth";

// Repositories
const todoRepository = new TodoRepository();
const userRepository = new UserRepository();
const tokenRepository = new TokenRepository();

// Services
const todoService = new TodoService(todoRepository);
const authService = new AuthService(userRepository, tokenRepository);

// Controllers
const todoController = new TodoController(todoService);
const healthController = new HealthController();
const authController = new AuthController(authService);

export {
  todoRepository,
  userRepository,
  tokenRepository,
  todoService,
  authService,
  todoController,
  healthController,
  authController,
};
