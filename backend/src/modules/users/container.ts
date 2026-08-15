import { Db } from 'mongodb';
import { MongoUserRepository } from './infrastructure/mongodb/repository/MongoUserRepository.js';
import { UserService } from './service/UserService.js';
import { UserController } from './controller/UserController.js';
import { KeycloakService } from './service/KeycloakService.js';


export function makeUserModule(db: Db) {
  const userRepository = new MongoUserRepository(db);
  const keycloakService = new KeycloakService()
  const userService    = new UserService(userRepository, keycloakService);
  const userController = new UserController(userService);
  return { userController };
}