import type { User } from "../../../domain/User.js";
import type { UserRepository } from "../../../domain/UserRepository.js";
import type { CreateUserInput } from "../../../dto/request/CreateUserInput.js";
import { Collection, Db, ObjectId } from "mongodb";
import type { UserDocument } from "../UserDocument.js";
import { UserDocumentMapper } from "../UserDocumentMapper.js";

export class MongoUserRepository implements UserRepository {
  private readonly collection: Collection<UserDocument>;

  constructor(db: Db) {
    this.collection = db.collection("users");
  }

    async findById(id: string) {
      const doc = await this.collection.findOne({_id: new ObjectId(id)});
      return doc ? UserDocumentMapper.toDomain(doc) : null;
    }

  async findByKeycloakId(id: string) {
    const doc = await this.collection.findOne({ keycloak_id: id });
    return doc ? UserDocumentMapper.toDomain(doc) : null;
  }

  async findByEmail(email: string) {
    const doc = await this.collection.findOne({ email });
    return doc ? UserDocumentMapper.toDomain(doc) : null;
  }

  async findAll() {
    const docs = await this.collection.find().toArray();
    return docs.map(UserDocumentMapper.toDomain);
  }

  async create(input: CreateUserInput) {
    const doc = UserDocumentMapper.toDocumentFromInput(input);
    const result = await this.collection.insertOne(doc);
    const created = await this.collection.findOne({ _id: result.insertedId });
    return UserDocumentMapper.toDomain(created!);
  }

  async update(user: User): Promise<User> {
    throw new Error("Method not implemented.");
  }

  async delete(id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
