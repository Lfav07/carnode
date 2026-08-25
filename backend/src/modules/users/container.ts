import { Db } from 'mongodb';
import { MongoUserRepository } from './infrastructure/mongodb/repository/MongoUserRepository.js';
import { UserService } from './service/UserService.js';
import { UserController } from './controller/UserController.js';
import { KeycloakIdentityProvider } from './infrastructure/keycloak/KeycloakIdentityProvider.js';
import { FetchHttpClient } from '../shared/http/FetchHttpClient.js';
import { userRoutes } from './routes/UserRoutes.js';


export function makeUserModule(db: Db) {
  const httpClient = new FetchHttpClient();
  const userRepository = new MongoUserRepository(db);
  const identityProvider = new KeycloakIdentityProvider(httpClient);

  const userService = new UserService(
    userRepository,
    identityProvider
  );

  const userController = new UserController(userService);

  const router = userRoutes(userController);

  return { router, userService };
}
