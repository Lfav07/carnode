import { Db } from 'mongodb';
import { MongoUserRepository } from './infrastructure/mongodb/repository/MongoUserRepository.js';
import { UserService } from './service/UserService.js';
import { UserController } from './controller/UserController.js';
import { KeycloakIdentityProvider } from './infrastructure/keycloak/KeycloakIdentityProvider.js';
import { FetchHttpClient } from '../shared/http/FetchHttpClient.js';


export function makeUserModule(db: Db) {
  const httpClient = new FetchHttpClient()
  const userRepository = new MongoUserRepository(db);
  const keycloakIdentityProvider = new KeycloakIdentityProvider(httpClient)
  const userService    = new UserService(userRepository, keycloakIdentityProvider);
  const userController = new UserController(userService);
  return { userController };
}