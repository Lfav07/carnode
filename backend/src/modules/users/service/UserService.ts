import type { UserRepository } from "../domain/UserRepository.js";

class UserService{
    constructor(
        private readonly userRepository: UserRepository
    ){}
    
}