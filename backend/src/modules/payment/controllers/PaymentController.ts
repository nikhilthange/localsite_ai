import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, ControllerMethod } from '../../../types/express';
import { PaymentService } from '../services/PaymentService';

const paymentService = new PaymentService();

export class PaymentController {
  static createSubscription: ControllerMethod = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { plan, interval, provider } = req.body;
      const result = await paymentService.createSubscription(req.user!.userId, plan, interval, provider);
      res.status(201).json({ success: true, data: result, message: 'Subscription created successfully' });
    } catch (error) {
      next(error);
    }
  };

  static cancelSubscription: ControllerMethod = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const subscription = await paymentService.cancelSubscription(req.user!.userId, req.body.subscriptionId);
      res.status(200).json({ success: true, data: subscription, message: 'Subscription cancelled successfully' });
    } catch (error) {
      next(error);
    }
  };

  static webhook = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const provider = req.params.provider;
      if (provider === 'stripe') {
        await paymentService.processStripeWebhook(req.body);
      } else if (provider === 'razorpay') {
        await paymentService.processRazorpayWebhook(req.body);
      }
      res.status(200).json({ success: true, message: 'Webhook processed successfully' });
    } catch (error) {
      next(error);
    }
  };

  static getStatus: ControllerMethod = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const subscription = await paymentService.getSubscriptionStatus(req.user!.userId);
      res.status(200).json({ success: true, data: subscription, message: 'Subscription status retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };

  static getHistory: ControllerMethod = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await paymentService.getPaymentHistory(req.user!.userId, req.query as any);
      res.status(200).json({ success: true, data: result, message: 'Payment history retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };
}
