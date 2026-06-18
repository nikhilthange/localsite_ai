import { Types } from 'mongoose';
import { BaseRepository } from '../../../core/database/BaseRepository';
import { ICustomer } from '../../../types/models';
import { Customer } from '../models/Customer';

export class CustomerRepository extends BaseRepository<ICustomer> {
  constructor() {
    super(Customer);
  }

  async findByWebsiteId(websiteId: string | Types.ObjectId) {
    return this.find({ websiteId });
  }

  async findByEmail(websiteId: string | Types.ObjectId, email: string) {
    return this.findOne({ websiteId, email: email.toLowerCase() } as any);
  }

  async updateLifetimeValue(customerId: string | Types.ObjectId, amount: number) {
    return this.model.findByIdAndUpdate(
      customerId,
      { $inc: { lifetimeValue: amount }, lastContact: new Date() },
      { new: true }
    ).lean();
  }
}
