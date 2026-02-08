import { TodoRepository } from "./repositories/todo";
import { TodoService } from "./services/todo";
import { TodoController } from "./controllers/todo";
import { HealthController } from "./controllers/health";

// Repositories
const todoRepository = new TodoRepository();

// Services
const todoService = new TodoService(todoRepository);

// Controllers
const todoController = new TodoController(todoService);
const healthController = new HealthController();

export { todoRepository, todoService, todoController, healthController };
