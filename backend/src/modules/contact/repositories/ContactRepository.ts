import { BaseRepository } from '../../../core/database/BaseRepository';
import { ContactForm } from '../models/ContactForm';
import type { PaginationParams, PaginatedResult } from '../../../types/services';
import { Types } from 'mongoose';

interface IContactFormDoc {
  _id: Types.ObjectId;
  websiteId: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  message: string;
  source: string;
  createdAt: Date;
}

export class ContactRepository {
  private repo: BaseRepository<any>;

  constructor() {
    this.repo = new (class extends BaseRepository<any> {
      constructor() { super(ContactForm); }
    })();
  }

  async create(data: Partial<IContactFormDoc>): Promise<any> {
    return this.repo.create(data);
  }

  async findByWebsite(websiteId: string | Types.ObjectId, params: PaginationParams): Promise<PaginatedResult<any>> {
    return this.repo.paginate({ websiteId }, params);
  }

  async findById(id: string | Types.ObjectId): Promise<any | null> {
    return this.repo.findById(id);
  }
}
