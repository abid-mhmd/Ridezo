import { Types, type Model } from 'mongoose';

export abstract class BaseMongooseRepository<TDocument> {
  protected constructor(protected readonly model: Model<TDocument>) {}

  async findDocumentById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.model.findById(id).exec();
  }

  async existsById(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await this.model.exists({ _id: id }).exec();
    return result !== null;
  }

  async deleteById(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }
    const result = await this.model.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }

  createDocument(data: Partial<TDocument>) {
    return this.model.create(data);
  }
}
