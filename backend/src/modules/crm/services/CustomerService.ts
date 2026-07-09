import { CustomerRepository } from '../repositories/CustomerRepository';
import { NotFoundError, ForbiddenError } from '../../../utils/AppError';
import type { ICustomer } from '../../../types/models';

const repository = new CustomerRepository();

export class CustomerService {
  async getCustomers(websiteId: string, params: any) {
    return repository.paginate({ websiteId }, params);
  }

  async getCustomerById(customerId: string, userId: string): Promise<ICustomer> {
    const customer = await repository.findById(customerId);
    if (!customer) throw new NotFoundError('Customer');
    if (customer.userId?.toString() !== userId) throw new ForbiddenError('You do not have access to this customer');
    return customer;
  }
}
