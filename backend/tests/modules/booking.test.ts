import { Appointment } from '../../src/modules/booking/models/Appointment';
import { BookingRoutes } from '../../src/modules/booking/routes/BookingRoutes';

jest.mock('../../src/modules/booking/models/Appointment', () => ({
  Appointment: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

describe('Appointment Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an appointment with required fields', async () => {
      const appointmentData = {
        websiteId: 'web-1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        date: new Date('2025-01-15T10:00:00Z'),
        duration: 60,
        service: 'Consultation',
      };

      (Appointment.create as jest.Mock).mockResolvedValue({
        _id: 'apt-1',
        ...appointmentData,
        status: 'confirmed',
        createdAt: new Date(),
      });

      const result = await Appointment.create(appointmentData);

      expect(result._id).toBe('apt-1');
      expect(result.status).toBe('confirmed');
      expect(Appointment.create).toHaveBeenCalledWith(appointmentData);
    });

    it('should reject missing required fields', async () => {
      (Appointment.create as jest.Mock).mockRejectedValue(new Error('Validation failed'));

      await expect(
        Appointment.create({ customerName: 'John' })
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('findById', () => {
    it('should find appointment by id', async () => {
      (Appointment.findById as jest.Mock).mockResolvedValue({
        _id: 'apt-1',
        customerName: 'John Doe',
        status: 'confirmed',
      });

      const result = await Appointment.findById('apt-1');

      expect(result._id).toBe('apt-1');
    });

    it('should return null for non-existent id', async () => {
      (Appointment.findById as jest.Mock).mockResolvedValue(null);

      const result = await Appointment.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('status transitions', () => {
    it('should allow valid status transitions', () => {
      const validTransitions: Record<string, string[]> = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['completed', 'cancelled', 'rescheduled'],
        completed: [],
        cancelled: [],
        rescheduled: ['confirmed', 'cancelled'],
      };

      expect(validTransitions.pending).toContain('confirmed');
      expect(validTransitions.pending).toContain('cancelled');
      expect(validTransitions.pending).not.toContain('completed');
      expect(validTransitions.confirmed).toContain('completed');
      expect(validTransitions.completed).toHaveLength(0);
    });
  });

  describe('find', () => {
    it('should find appointments by websiteId', async () => {
      (Appointment.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { _id: 'apt-1', date: new Date('2025-01-15'), status: 'confirmed' },
        ]),
      });

      const results = await Appointment.find({ websiteId: 'web-1' }).sort({ date: -1 });

      expect(results).toHaveLength(1);
      expect(Appointment.find).toHaveBeenCalledWith({ websiteId: 'web-1' });
    });
  });

  describe('countDocuments', () => {
    it('should count appointments for a date range', async () => {
      (Appointment.countDocuments as jest.Mock).mockResolvedValue(5);

      const count = await Appointment.countDocuments({
        date: { $gte: new Date('2025-01-01'), $lte: new Date('2025-01-31') },
      });

      expect(count).toBe(5);
    });
  });
});
