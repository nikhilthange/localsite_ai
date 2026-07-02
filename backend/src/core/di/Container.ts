import 'reflect-metadata';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Metadata = Reflect;

type Constructor<T = any> = new (...args: any[]) => T;

interface Registration<T = any> {
  instance?: T;
  constructor: Constructor<T>;
  dependencies: string[];
  singleton: boolean;
}

export class Container {
  private static registrations = new Map<string, Registration>();
  private static instances = new Map<string, any>();
  private static readonly INSTANCE_KEY = Symbol('di:instance');

  static register<T>(
    name: string,
    constructor: Constructor<T>,
    options: { singleton?: boolean; dependencies?: string[] } = {}
  ): void {
    this.registrations.set(name, {
      constructor,
      dependencies: options.dependencies || [],
      singleton: options.singleton ?? true,
    });
  }

  static resolve<T>(name: string): T {
    const registration = this.registrations.get(name);
    if (!registration) {
      throw new Error(`Service '${name}' not registered in DI container`);
    }

    if (registration.singleton) {
      const instanceKey = `${name}:${this.INSTANCE_KEY.toString()}`;
      if (!this.instances.has(instanceKey)) {
        this.instances.set(instanceKey, this.createInstance(registration));
      }
      return this.instances.get(instanceKey) as T;
    }

    return this.createInstance(registration) as T;
  }

  private static createInstance(registration: Registration): any {
    const dependencies = registration.dependencies.map((dep) => this.resolve(dep));
    return new registration.constructor(...dependencies);
  }

  static clear(): void {
    this.registrations.clear();
    this.instances.clear();
  }

  static isRegistered(name: string): boolean {
    return this.registrations.has(name);
  }
}

export function Injectable(name?: string): ClassDecorator {
  return (target: any) => {
    const serviceName = name || target.name;
    Container.register(serviceName, target);
    Reflect.defineMetadata('di:name', serviceName, target);
  };
}

export function Inject(serviceName: string): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    const existingParams =
      Reflect.getOwnMetadata('di:params', target) || [];
    existingParams[parameterIndex] = serviceName;
    Reflect.defineMetadata('di:params', existingParams, target);
  };
}
