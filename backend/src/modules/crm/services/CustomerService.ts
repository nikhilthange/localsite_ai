import { CustomerRepository } from '../repositories/CustomerRepository';
import { NotFoundError } from '../../../utils/AppError';
import type { ICustomer } from '../../../types/models';

const repository = new CustomerRepository();

export class CustomerService {
  async getCustomers(websiteId: string, params: any) {
    return repository.paginate({ websiteId }, params);
  }

  async getCustomerById(customerId: string): Promise<ICustomer> {
    const customer = await repository.findById(customerId);
    if (!customer) throw new NotFoundError('Customer');
    return customer;
  }
}
