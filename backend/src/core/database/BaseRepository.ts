import { Model, Document, FilterQuery, UpdateQuery, Types, QueryOptions, FlattenMaps } from 'mongoose';
import { PaginationParams, PaginatedResult } from '../../types/services';

export abstract class BaseRepository<T extends Document> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findById(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findById(id).lean() as unknown as T | null;
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).lean() as unknown as T | null;
  }

  async find(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(filter).lean() as unknown as T[];
  }

  async create(data: Partial<T>): Promise<T> {
    const doc = await this.model.create(data);
    return doc.toObject() as T;
  }

  async update(id: string | Types.ObjectId, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean() as unknown as T | null;
  }

  async updateOne(filter: FilterQuery<T>, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, data, { new: true, runValidators: true }).lean() as unknown as T | null;
  }

  async delete(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findByIdAndDelete(id).lean() as unknown as T | null;
  }

  async deleteMany(filter: FilterQuery<T>): Promise<number> {
    const result = await this.model.deleteMany(filter);
    return result.deletedCount;
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).limit(1);
    return count > 0;
  }

  async paginate(
    filter: FilterQuery<T> = {},
    params: PaginationParams = {}
  ): Promise<PaginatedResult<T>> {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
    } = params;

    const skip = (page - 1) * limit;
    const sortObj: Record<string, 1 | -1> = { [sort]: order === 'desc' ? -1 : 1 };

    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
      this.model.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data as unknown as T[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async bulkInsert(docs: Partial<T>[]): Promise<T[]> {
    const created = await this.model.insertMany(docs);
    return created.map((doc) => (typeof (doc as any).toObject === 'function' ? (doc as any).toObject() : doc)) as T[];
  }

  async bulkUpdate(
    filter: FilterQuery<T>,
    data: UpdateQuery<T>,
    options: Record<string, any> = {}
  ): Promise<number> {
    const result = await this.model.updateMany(filter, data, options);
    return result.modifiedCount;
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    return this.model.aggregate(pipeline);
  }

  async distinct(field: string, filter: FilterQuery<T> = {}): Promise<any[]> {
    return this.model.distinct(field, filter);
  }
}
