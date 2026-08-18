import type { User } from "../../../domain/User.js";
import type { UserRepository } from "../../../domain/UserRepository.js";
import type { CreateUserInput } from "../../../dto/request/CreateUserInput.js";
import { Collection, Db, MongoServerError, ObjectId } from "mongodb";
import type { UserDocument } from "../UserDocument.js";
import { UserDocumentMapper } from "../UserDocumentMapper.js";
import { UserNotFoundError } from "../../../domain/errors/UserNotFoundError.js";
import { UserConflictError } from "../../../domain/errors/UserConflictError.js";

export class MongoUserRepository implements UserRepository {
  private readonly collection: Collection<UserDocument>;

  constructor(db: Db) {
    this.collection = db.collection("users");
  }
 private isMongoServerError(err: unknown): err is MongoServerError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as { code?: unknown }).code === "number"
  );
}

  async findById(id: string) {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) });
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

  async create(input: CreateUserInput): Promise<User> {
    const doc = UserDocumentMapper.toDocumentFromInput(input);
    await this.collection.insertOne(doc);
    return UserDocumentMapper.toDomain(doc);
  }

async update(user: User): Promise<User> {
  const filter = {
    _id: new ObjectId(user.id),
  };

  const update = {
    $set: {
      email: user.email,
      updated_at: new Date(),
    },
  };

  try {
    const updated = await this.collection.findOneAndUpdate(
      filter,
      update,
      {
        returnDocument: "after",
      },
    );

    if (!updated) {
      throw new UserNotFoundError(`User ${user.id} not found`);
    }

    return UserDocumentMapper.toDomain(updated);
  } catch (err: unknown) {
    if (this.isMongoServerError(err) && err.code === 11000) {
      throw new UserConflictError("User email already exists");
    }

    throw err;
  }
}
  async delete(id: string): Promise<boolean> {
    const doc = {
      _id: new ObjectId(id),
    };
    const result = await this.collection.deleteOne(doc);
    return result.deletedCount === 1;
  }
}
