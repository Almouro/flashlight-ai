export class Serializer {
  // Class registry to store class constructors by name
  private static classRegistry: { [key: string]: any } = {};

  // Static method to register the class in the registry
  static registerClass(cls: any): void {
    if (!Serializer.classRegistry[cls.name]) {
      Serializer.classRegistry[cls.name] = cls;
    }
  }

  // Automatically called to serialize an object into JSON
  static toJSON(object: any): object {
    return {
      ...object,
      _class: object.constructor.name, // Store class name for deserialization
    };
  }

  // Deserialize a JSON string into an instance of the correct class
  static fromJSON<T>(parsed: { _class: string }): T {
    const targetClass = Serializer.classRegistry[parsed._class];

    if (!targetClass) {
      throw new Error(`Unknown class: ${parsed._class}`);
    }

    // Dynamically create an instance of the correct class
    return Object.assign(new targetClass(), parsed);
  }
}

export function Serializable<T>(constructor: T) {
  // Automatically register the class with Serializer when declared
  Serializer.registerClass(constructor);
}
